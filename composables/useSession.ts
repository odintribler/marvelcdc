interface User {
  id: number
  username: string
  email: string
  emailVerified: boolean
  firstName?: string | null
  lastName?: string | null
  marvelcdbProfile?: string | null
  pendingEmail?: string | null
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
      const response = await $fetch<{ success: boolean; message: string; data: { requiresVerification: boolean; email: string } }>('/api/auth/register', {
        method: 'POST',
        body: userData
      })

      if (response.success) {
        return { 
          success: true, 
          message: response.message,
          requiresVerification: response.data.requiresVerification,
          email: response.data.email
        }
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

  const verifyEmail = async (token: string) => {
    try {
      const response = await $fetch<{ success: boolean; message: string; data: { user: User } }>('/api/auth/verify-email', {
        method: 'POST',
        body: { token }
      })

      if (response.success) {
        sessionState.value.user = response.data.user
        sessionState.value.status = 'authenticated'
        return { success: true, message: response.message }
      } else {
        return { success: false, error: 'Email verification failed' }
      }
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Email verification failed'
      return { success: false, error: errorMessage }
    }
  }

  const resendVerification = async (email: string) => {
    try {
      const response = await $fetch<{ success: boolean; message: string }>('/api/auth/resend-verification', {
        method: 'POST',
        body: { email }
      })

      return { success: response.success, message: response.message }
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Failed to resend verification email'
      return { success: false, error: errorMessage }
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      const response = await $fetch<{ success: boolean; message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: { email }
      })

      return { success: response.success, message: response.message }
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Failed to send password reset email'
      return { success: false, error: errorMessage }
    }
  }

  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await $fetch<{ success: boolean; message: string; data: { user: User } }>('/api/auth/reset-password', {
        method: 'POST',
        body: { token, password }
      })

      if (response.success) {
        sessionState.value.user = response.data.user
        sessionState.value.status = 'authenticated'
        return { success: true, message: response.message }
      } else {
        return { success: false, error: 'Password reset failed' }
      }
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Password reset failed'
      return { success: false, error: errorMessage }
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await $fetch<{ success: boolean; data: { profile: User } }>('/api/profile')
      
      if (response.success) {
        // Update the user session with the latest profile data
        sessionState.value.user = response.data.profile
        return { success: true, profile: response.data.profile }
      } else {
        return { success: false, error: 'Failed to fetch profile' }
      }
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Failed to fetch profile'
      return { success: false, error: errorMessage }
    }
  }

  const updateProfile = async (profileData: Partial<Pick<User, 'username' | 'email' | 'firstName' | 'lastName' | 'marvelcdbProfile'>>) => {
    try {
      const response = await $fetch<{ success: boolean; message: string; data: { profile: User } }>('/api/profile', {
        method: 'PUT',
        body: profileData
      })

      if (response.success) {
        // Update the user session with the updated profile data
        sessionState.value.user = response.data.profile
        return { success: true, message: response.message, profile: response.data.profile }
      } else {
        return { success: false, error: 'Profile update failed' }
      }
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Profile update failed'
      return { success: false, error: errorMessage }
    }
  }

  const deleteAccount = async () => {
    try {
      const response = await $fetch<{ success: boolean; message: string }>('/api/profile', {
        method: 'DELETE'
      })

      if (response.success) {
        // Clear session state after account deletion
        sessionState.value.user = null
        sessionState.value.status = 'unauthenticated'
        
        // Clear any client-side storage
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
            const cookiesToClear = ['session', 'auth-token', 'token', 'jwt', 'authentication']
            for (const cookieName of cookiesToClear) {
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`
              document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
            }
          } catch (e) {
            console.warn('Client-side cleanup error:', e)
          }
        }
        
        // Navigate to login page
        await navigateTo('/login', { replace: true })
        
        return { success: true, message: response.message }
      } else {
        return { success: false, error: 'Account deletion failed' }
      }
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Account deletion failed'
      return { success: false, error: errorMessage }
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
    initializeSession,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    
    // Profile methods
    fetchProfile,
    updateProfile,
    deleteAccount
  }
}