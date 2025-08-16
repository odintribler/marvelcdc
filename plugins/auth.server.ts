import { validateSessionById } from '~/server/utils/auth'

export default defineNuxtPlugin(async () => {
  // Only run on server-side
  if (process.client) return

  const sessionState = useState('session', () => ({
    user: null,
    status: 'loading'
  }))

  try {
    // Get request headers (works properly in SSR context)
    const headers = useRequestHeaders(['cookie'])
    const cookieHeader = headers.cookie || ''
    
    if (!cookieHeader) {
      sessionState.value = {
        user: null,
        status: 'unauthenticated'
      }
      return
    }

    // Parse cookies manually from header
    const cookies = Object.fromEntries(
      cookieHeader.split(';')
        .map(cookie => {
          const [name, value] = cookie.trim().split('=')
          return [name?.trim(), value?.trim()]
        })
        .filter(([name, value]) => name && value)
    )
    
    const sessionCookie = cookies.session
    
    if (!sessionCookie) {
      sessionState.value = {
        user: null,
        status: 'unauthenticated'
      }
      return
    }

    // Validate session server-side
    const result = await validateSessionById(sessionCookie)
    if (result) {
      // Pre-populate the session state with user data
      sessionState.value = {
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email
        },
        status: 'authenticated'
      }
    } else {
      // Invalid/expired session - clear any client state
      sessionState.value = {
        user: null,
        status: 'unauthenticated'
      }
    }
  } catch (error) {
    // Log error but don't expose details to client
    console.error('Server-side session validation error:', error.message || error)
    sessionState.value = {
      user: null,
      status: 'unauthenticated'
    }
  }
})