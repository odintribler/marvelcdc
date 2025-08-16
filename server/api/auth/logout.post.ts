import { deleteSession, deleteSessionCookie, getSessionCookie } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Get current session ID
    const sessionId = getSessionCookie(event)
    
    if (sessionId) {
      // Delete session from database
      await deleteSession(sessionId)
    }

    // Clear session cookie with comprehensive cleanup
    deleteSessionCookie(event)
    
    // Also clear any potential legacy auth cookies
    // This handles cases where old JWT tokens might still exist
    const legacyCookieNames = ['auth-token', 'token', 'jwt', 'authentication']
    for (const cookieName of legacyCookieNames) {
      try {
        deleteCookie(event, cookieName, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          domain: undefined // Clear for current domain
        })
      } catch (e) {
        // Ignore errors - cookie might not exist
      }
    }

    // Return 204 as per spec
    setResponseStatus(event, 204)
    return null
  } catch (error) {
    console.error('Logout error:', error)
    // Even if database deletion fails, clear all cookies
    deleteSessionCookie(event)
    
    // Force clear legacy cookies even on error
    const legacyCookieNames = ['auth-token', 'token', 'jwt', 'authentication']
    for (const cookieName of legacyCookieNames) {
      try {
        deleteCookie(event, cookieName, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          domain: undefined
        })
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    
    setResponseStatus(event, 204)
    return null
  }
})