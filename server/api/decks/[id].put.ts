import prisma from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { z } from 'zod'

const updateDeckSchema = z.object({
  isActive: z.boolean()
})

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await requireAuth(event)
    const deckId = parseInt(getRouterParam(event, 'id') || '0')
    const body = await readBody(event)
    const { isActive } = updateDeckSchema.parse(body)

    if (!deckId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid deck ID'
      })
    }

    // Verify deck belongs to user
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId
      }
    })

    if (!deck) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Deck not found'
      })
    }

    // Update deck
    const updatedDeck = await prisma.deck.update({
      where: { id: deckId },
      data: { isActive },
      include: {
        deckCards: true
      }
    })

    return {
      success: true,
      data: {
        deck: {
          id: updatedDeck.id,
          name: updatedDeck.name,
          heroCode: updatedDeck.heroCode,
          heroName: updatedDeck.heroName,
          isActive: updatedDeck.isActive,
          deckUrl: updatedDeck.deckUrl,
          marvelcdbId: updatedDeck.marvelcdbId,
          deckCards: updatedDeck.deckCards.map(card => ({
            id: card.id,
            deckId: card.deckId,
            cardCode: card.cardCode,
            cardName: card.cardName,
            quantity: card.quantity,
            cardType: card.cardType,
            packCode: card.packCode
          }))
        }
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data'
      })
    }

    console.error('Update deck error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update deck'
    })
  }
})