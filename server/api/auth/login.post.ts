import { verifyPassword, createSession, setSessionCookie, cleanupExpiredSessions } from '../../utils/auth'
import prisma from '../../utils/db'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password } = loginSchema.parse(body)

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Verify password using Argon2
    const isValidPassword = await verifyPassword(user.passwordHash, password)
    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Clean up expired sessions to prevent database bloat
    try {
      await cleanupExpiredSessions()
    } catch (cleanupError) {
      // Don't fail login if cleanup fails, just log it
      console.warn('Session cleanup warning:', cleanupError)
    }

    // Optional: For multiple users on same device, you might want to limit concurrent sessions
    // This is commented out by default, but can be enabled if needed
    /*
    const currentSessions = await getUserSessionCount(user.id)
    if (currentSessions > 5) { // Limit to 5 concurrent sessions
      // Delete oldest sessions for this user
      const oldestSessions = await prisma.session.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'asc' },
        take: currentSessions - 4 // Keep 4, delete rest
      })
      
      for (const oldSession of oldestSessions) {
        await deleteSession(oldSession.id)
      }
    }
    */

    // Create new session
    const session = await createSession(user.id)

    // Set session cookie
    setSessionCookie(event, session.id)

    // Return user data
    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Login error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})