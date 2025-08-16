import prisma from '../utils/db'
import { requireAuth } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await requireAuth(event)

    const conflicts = await calculateConflicts(userId)

    return {
      success: true,
      data: {
        conflicts
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Conflicts calculation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to calculate conflicts'
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