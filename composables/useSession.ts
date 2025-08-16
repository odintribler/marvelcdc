interface User {
  id: number
  username: string
  email: string
}

interface SessionState {
  user: User | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
}

export const useSession = () => {
  // SSR-safe state using useState
  const sessionState = useState<SessionState>('session', () => ({
    user: null,
    status: 'loading'
  }))

  // Methods
  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await $fetch<{ success: boolean; data: { user: User } }>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })

      if (response.success) {
        sessionState.value.user = response.data.user
        sessionState.value.status = 'authenticated'
        return { success: true }
      } else {
        return { success: false, error: 'Login failed' }
      }
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Login failed'
      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData: { username: string; email: string; password: string }) => {
    try {
      const response = await $fetch<{ success: boolean; data: { user: User } }>('/api/auth/register', {
        method: 'POST',
        body: userData
      })

      if (response.success) {
        sessionState.value.user = response.data.user
        sessionState.value.status = 'authenticated'
        return { success: true }
      } else {
        return { success: false, error: 'Registration failed' }
      }
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Registration failed'
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      // Ignore logout errors, still clear local state
      console.warn('Logout API error:', error)
    }

    // Clear local state completely
    sessionState.value.user = null
    sessionState.value.status = 'unauthenticated'

    // Clear any client-side storage that might contain auth state
    if (process.client) {
      try {
        // Clear localStorage
        localStorage.removeItem('auth-token')
        localStorage.removeItem('session')
        localStorage.removeItem('user')
        
        // Clear sessionStorage
        sessionStorage.removeItem('auth-token')
        sessionStorage.removeItem('session')
        sessionStorage.removeItem('user')
        
        // Force clear cookies client-side as backup
        // This helps with any cookies that weren't cleared server-side
        const cookiesToClear = ['session', 'auth-token', 'token', 'jwt', 'authentication']
        for (const cookieName of cookiesToClear) {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
        }
      } catch (e) {
        // Ignore client-side cleanup errors
        console.warn('Client-side logout cleanup error:', e)
      }
    }

    // Navigate to login
    await navigateTo('/login')
  }

  const fetchMe = async () => {
    try {
      const response = await $fetch<{ success: boolean; data: { user: User } }>('/api/auth/me')
      
      if (response.success) {
        sessionState.value.user = response.data.user
        sessionState.value.status = 'authenticated'
        return true
      } else {
        sessionState.value.user = null
        sessionState.value.status = 'unauthenticated'
        return false
      }
    } catch (error) {
      sessionState.value.user = null
      sessionState.value.status = 'unauthenticated'
      return false
    }
  }

  const initializeSession = async () => {
    // Only check session if we're in loading state
    // On client-side after hydration, server-side validation should have already set the state
    if (sessionState.value.status === 'loading') {
      // Only call fetchMe if we're on client-side and state is still loading
      if (process.client) {
        await fetchMe()
      }
    }
  }

  // Computed properties
  const user = computed(() => sessionState.value.user)
  const status = computed(() => sessionState.value.status)
  const isAuthenticated = computed(() => sessionState.value.status === 'authenticated')
  const isLoading = computed(() => sessionState.value.status === 'loading')

  return {
    // State
    user,
    status,
    isAuthenticated,
    isLoading,
    
    // Methods
    login,
    register,
    logout,
    fetchMe,
    initializeSession
  }
}