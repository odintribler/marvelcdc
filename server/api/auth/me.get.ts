import { validateSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Validate session
    const sessionResult = await validateSession(event)
    
    if (!sessionResult) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    return {
      success: true,
      data: {
        user: {
          id: sessionResult.user.id,
          username: sessionResult.user.username,
          email: sessionResult.user.email,
          emailVerified: sessionResult.user.emailVerified
        }
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Auth verification error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})