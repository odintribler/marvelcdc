import prisma from '../utils/db'
import { requireAuth } from '../utils/auth'
import { z } from 'zod'

const importSchema = z.object({
  url: z.string().url('Invalid URL')
})

async function fetchCardDatabase() {
  try {
    // Fetch cards from local database instead of external API
    const cards = await prisma.card.findMany()
    
    // Convert to lookup object by code for compatibility
    const cardDatabase: any = {}
    for (const card of cards) {
      cardDatabase[card.code] = {
        name: card.name,
        type: card.cardType,
        pack_code: card.packCode,
        faction: card.faction,
        cost: card.cost,
        traits: card.traits,
        quantity: card.quantity
      }
    }
    
    return cardDatabase
  } catch (error) {
    console.error('Failed to fetch card database:', error)
    throw new Error('Unable to fetch local card database')
  }
}

async function fetchDeckData(deckId: number) {
  try {
    const response = await fetch(`https://marvelcdb.com/api/public/decklist/${deckId}`)
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('PRIVATE_DECK')
      }
      throw new Error(`API responded with status: ${response.status}`)
    }
    
    const responseText = await response.text()
    if (!responseText.trim()) {
      throw new Error('PRIVATE_DECK')
    }
    
    try {
      const deckData = JSON.parse(responseText)
      return deckData
    } catch (jsonError) {
      throw new Error('PRIVATE_DECK')
    }
  } catch (error) {
    console.error('Failed to fetch deck data:', error)
    if (error.message === 'PRIVATE_DECK') {
      throw error
    }
    throw new Error('Unable to fetch deck from MarvelCDB')
  }
}

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await requireAuth(event)
    const body = await readBody(event)
    const { url } = importSchema.parse(body)

    // Validate marvelcdb.com URL
    if (!url.includes('marvelcdb.com')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'URL must be from marvelcdb.com'
      })
    }

    // Extract deck ID from URL
    let deckId: number
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const viewIndex = pathParts.indexOf('view')
      if (viewIndex !== -1 && pathParts[viewIndex + 1]) {
        deckId = parseInt(pathParts[viewIndex + 1])
        if (isNaN(deckId)) {
          throw new Error('Invalid deck ID')
        }
      } else {
        throw new Error('Deck ID not found in URL')
      }
    } catch (parseError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid MarvelCDB URL format'
      })
    }

    // Check if deck already exists
    const existingDeck = await prisma.deck.findFirst({
      where: {
        userId,
        marvelcdbId: deckId
      }
    })

    if (existingDeck) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Deck already imported'
      })
    }

    // Fetch real deck data from marvelcdb.com API
    const [deckData, cardDatabase] = await Promise.all([
      fetchDeckData(deckId),
      fetchCardDatabase()
    ])
    
    // Extract hero information
    const heroCode = deckData.hero_code || deckData.investigator_code || 'unknown'
    const heroName = deckData.hero_name || deckData.investigator_name || 'Unknown Hero'

    // Create deck in database
    const deck = await prisma.deck.create({
      data: {
        userId,
        marvelcdbId: deckData.id,
        name: deckData.name,
        heroCode: heroCode,
        heroName: heroName,
        deckUrl: url,
        isActive: true
      }
    })

    // Create deck cards using real card data
    const deckCards = []
    for (const [cardCode, quantity] of Object.entries(deckData.slots)) {
      const cardInfo = cardDatabase[cardCode]
      if (cardInfo) {
        const deckCard = await prisma.deckCard.create({
          data: {
            deckId: deck.id,
            cardCode,
            cardName: cardInfo.name,
            quantity: quantity as number,
            cardType: cardInfo.type,
            packCode: cardInfo.pack_code
          }
        })
        deckCards.push(deckCard)
      } else {
        console.warn(`Card not found in database: ${cardCode}`)
      }
    }

    // Calculate conflicts
    const conflicts = await calculateConflicts(userId)

    // Return the created deck with cards
    const createdDeck = await prisma.deck.findUnique({
      where: { id: deck.id },
      include: { deckCards: true }
    })

    return {
      success: true,
      data: {
        deck: {
          id: createdDeck!.id,
          name: createdDeck!.name,
          heroCode: createdDeck!.heroCode,
          heroName: createdDeck!.heroName,
          isActive: createdDeck!.isActive,
          deckUrl: createdDeck!.deckUrl,
          marvelcdbId: createdDeck!.marvelcdbId,
          deckCards: createdDeck!.deckCards.map(card => ({
            id: card.id,
            deckId: card.deckId,
            cardCode: card.cardCode,
            cardName: card.cardName,
            quantity: card.quantity,
            cardType: card.cardType,
            packCode: card.packCode
          }))
        },
        conflicts
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid URL format'
      })
    }

    if (error.message === 'PRIVATE_DECK') {
      throw createError({
        statusCode: 400,
        statusMessage: 'This deck is private and cannot be imported. Please make sure the deck is set to "Public" on MarvelCDB, or use a different deck URL.'
      })
    }

    console.error('Import deck error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to import deck'
    })
  }
})

async function calculateConflicts(userId: number) {
  // Get user's collection with pack relationships
  const collection = await prisma.collection.findMany({
    where: { userId },
    include: { pack: true }
  })

  // Get all active decks with their cards
  const activeDecks = await prisma.deck.findMany({
    where: {
      userId,
      isActive: true
    },
    include: {
      deckCards: true
    }
  })

  // Calculate card usage across all active decks - group by card name instead of card code
  const cardUsage = new Map<string, { totalNeeded: number, deckNames: string[], cardCodes: string[] }>()

  for (const deck of activeDecks) {
    for (const card of deck.deckCards) {
      const key = card.cardName // Group by card name instead of card code
      if (!cardUsage.has(key)) {
        cardUsage.set(key, { totalNeeded: 0, deckNames: [], cardCodes: [] })
      }
      const usage = cardUsage.get(key)!
      usage.totalNeeded += card.quantity
      if (!usage.deckNames.includes(deck.name)) {
        usage.deckNames.push(deck.name)
      }
      if (!usage.cardCodes.includes(card.cardCode)) {
        usage.cardCodes.push(card.cardCode)
      }
    }
  }

  // Get all unique card codes from usage
  const allCardCodes = Array.from(cardUsage.values()).flatMap(usage => usage.cardCodes)
  const usedCards = await prisma.card.findMany({
    where: {
      code: { in: allCardCodes }
    }
  })

  // Get all unique card names from usage
  const cardNames = Array.from(cardUsage.keys())
  
  // Get ALL cards with these names across all packs (not just the card codes used in decks)
  const cards = await prisma.card.findMany({
    where: {
      name: { in: cardNames }
    }
  })

  // Check for conflicts using real card ownership - aggregate across all packs with same card name
  const conflicts = []
  for (const [cardName, usage] of cardUsage.entries()) {
    // Find all cards with this name across different packs
    const cardsWithSameName = cards.filter(card => card.name === cardName)
    
    // Calculate total owned cards across all packs that contain this card
    let totalOwnedCards = 0
    const packDetails = []
    
    for (const cardInfo of cardsWithSameName) {
      const packOwnership = collection.find(item => item.packCode === cardInfo.packCode)
      const packsOwned = packOwnership ? packOwnership.quantity : 0
      const cardsPerPack = cardInfo.quantity
      const cardsFromThisPack = packsOwned * cardsPerPack
      
      totalOwnedCards += cardsFromThisPack
      
      if (cardsFromThisPack > 0) {
        packDetails.push({
          packCode: cardInfo.packCode,
          packName: packOwnership?.pack.name || 'Unknown Pack',
          cardsFromPack: cardsFromThisPack,
          packsOwned,
          cardsPerPack
        })
      }
    }

    // Calculate conflict
    if (usage.totalNeeded > totalOwnedCards) {
      conflicts.push({
        cardCodes: usage.cardCodes,
        cardName: cardName,
        totalNeeded: usage.totalNeeded,
        totalOwned: totalOwnedCards,
        conflictQuantity: usage.totalNeeded - totalOwnedCards,
        conflictingDecks: usage.deckNames,
        packDetails: packDetails,
        availableInPacks: cardsWithSameName.map(card => ({
          packCode: card.packCode,
          cardCode: card.code
        }))
      })
    }
  }

  return conflicts
}