import prisma from '../../utils/db'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await requireAuth(event)
    const deckId = parseInt(getRouterParam(event, 'id') || '0')

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

    // Delete deck (cascade will delete deck cards)
    await prisma.deck.delete({
      where: { id: deckId }
    })

    return {
      success: true,
      message: 'Deck deleted successfully'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Delete deck error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete deck'
    })
  }
})