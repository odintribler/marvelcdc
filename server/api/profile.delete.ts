import { requireAuth, deleteUserSessions } from '../utils/auth'
import { withRateLimit } from '../utils/rateLimit'
import prisma from '../utils/db'

export default defineEventHandler(withRateLimit('profileDelete', async (event) => {
  const { userId } = await requireAuth(event)
  
  try {
    // Log account deletion for audit purposes
    console.log(`Account deletion initiated for user ID: ${userId} at ${new Date().toISOString()}`)
    
    // Delete all user sessions first
    await deleteUserSessions(userId)
    
    // Delete user and cascade delete all related data
    // Prisma will handle cascade deletion based on relations
    await prisma.$transaction(async (tx) => {
      // Delete collections
      await tx.collection.deleteMany({
        where: { userId }
      })
      
      // Delete deck cards first (to avoid foreign key issues)
      const userDecks = await tx.deck.findMany({
        where: { userId },
        select: { id: true }
      })
      
      const deckIds = userDecks.map(d => d.id)
      
      await tx.deckCard.deleteMany({
        where: { deckId: { in: deckIds } }
      })
      
      // Delete decks
      await tx.deck.deleteMany({
        where: { userId }
      })
      
      // Delete sessions
      await tx.session.deleteMany({
        where: { userId }
      })
      
      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      })
    })
    
    // Clear the session cookie
    deleteCookie(event, 'session', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })
    
    console.log(`Account successfully deleted for user ID: ${userId}`)
    
    return {
      success: true,
      message: 'Account deleted successfully'
    }
  } catch (error: any) {
    console.error('Account deletion error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete account'
    })
  }
}))