import prisma from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { z } from 'zod'

const resolveConflictsSchema = z.object({
  deckIds: z.array(z.number())
})

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await requireAuth(event)
    const body = await readBody(event)
    const { deckIds } = resolveConflictsSchema.parse(body)

    // Verify all decks belong to the user
    const decks = await prisma.deck.findMany({
      where: {
        id: { in: deckIds },
        userId
      }
    })

    if (decks.length !== deckIds.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Some decks not found or do not belong to user'
      })
    }

    // Deactivate the specified decks
    await prisma.deck.updateMany({
      where: {
        id: { in: deckIds },
        userId
      },
      data: {
        isActive: false
      }
    })

    // Recalculate conflicts after deactivation
    const updatedConflicts = await calculateConflicts(userId)

    return {
      success: true,
      data: {
        deactivatedDecks: deckIds,
        remainingConflicts: updatedConflicts
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

    console.error('Resolve conflicts error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to resolve conflicts'
    })
  }
})

async function calculateConflicts(userId: number) {
  // Get user's collection
  const collection = await prisma.collection.findMany({
    where: { userId }
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

  // Calculate card usage across all active decks
  const cardUsage = new Map<string, { 
    totalNeeded: number, 
    deckNames: string[], 
    cardName: string,
    packCode: string
  }>()

  for (const deck of activeDecks) {
    for (const card of deck.deckCards) {
      const key = card.cardCode
      if (!cardUsage.has(key)) {
        cardUsage.set(key, { 
          totalNeeded: 0, 
          deckNames: [],
          cardName: card.cardName,
          packCode: card.packCode
        })
      }
      const usage = cardUsage.get(key)!
      usage.totalNeeded += card.quantity
      if (!usage.deckNames.includes(deck.name)) {
        usage.deckNames.push(deck.name)
      }
    }
  }

  // Check for conflicts
  const conflicts = []
  for (const [cardCode, usage] of cardUsage.entries()) {
    // Find how many of this pack the user owns
    const packOwnership = collection.find(item => item.packCode === usage.packCode)
    const totalOwned = packOwnership ? packOwnership.quantity : 0

    // Calculate conflict
    const availableCards = totalOwned
    
    if (usage.totalNeeded > availableCards) {
      conflicts.push({
        cardCode,
        cardName: usage.cardName,
        totalNeeded: usage.totalNeeded,
        totalOwned: availableCards,
        conflictQuantity: usage.totalNeeded - availableCards,
        conflictingDecks: usage.deckNames
      })
    }
  }

  return conflicts
}