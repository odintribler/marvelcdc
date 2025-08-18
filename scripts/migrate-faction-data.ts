import prisma from '../server/utils/db'

async function migrateFactionData() {
  console.log('Starting faction data migration...')

  try {
    // Get all deck cards that don't have faction data
    const deckCardsWithoutFaction = await prisma.deckCard.findMany({
      where: {
        faction: null
      }
    })

    console.log(`Found ${deckCardsWithoutFaction.length} deck cards without faction data`)

    if (deckCardsWithoutFaction.length === 0) {
      console.log('All deck cards already have faction data!')
      return
    }

    // Get all cards from the cards table for reference
    const allCards = await prisma.card.findMany({
      select: {
        code: true,
        faction: true
      }
    })

    const cardFactionMap = new Map()
    allCards.forEach(card => {
      cardFactionMap.set(card.code, card.faction)
    })

    console.log(`Loaded ${allCards.length} cards for faction lookup`)

    // Update deck cards with faction data
    let updated = 0
    let notFound = 0

    for (const deckCard of deckCardsWithoutFaction) {
      const faction = cardFactionMap.get(deckCard.cardCode)
      
      if (faction !== undefined) {
        await prisma.deckCard.update({
          where: { id: deckCard.id },
          data: { faction }
        })
        updated++
      } else {
        console.warn(`Card not found in database: ${deckCard.cardCode} (${deckCard.cardName})`)
        notFound++
      }
    }

    console.log(`Migration completed!`)
    console.log(`- Updated: ${updated} deck cards`)
    console.log(`- Not found: ${notFound} deck cards`)

  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateFactionData()