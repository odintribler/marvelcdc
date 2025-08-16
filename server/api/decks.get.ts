import prisma from '../utils/db'
import { requireAuth } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await requireAuth(event)

    // Fetch user's decks with their cards
    const decks = await prisma.deck.findMany({
      where: { userId },
      include: {
        deckCards: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      data: {
        decks: decks.map(deck => ({
          id: deck.id,
          name: deck.name,
          heroCode: deck.heroCode,
          heroName: deck.heroName,
          isActive: deck.isActive,
          deckUrl: deck.deckUrl,
          marvelcdbId: deck.marvelcdbId,
          createdAt: deck.createdAt,
          updatedAt: deck.updatedAt,
          deckCards: deck.deckCards.map(card => ({
            id: card.id,
            deckId: card.deckId,
            cardCode: card.cardCode,
            cardName: card.cardName,
            quantity: card.quantity,
            cardType: card.cardType,
            packCode: card.packCode
          }))
        }))
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Decks fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch decks'
    })
  }
})