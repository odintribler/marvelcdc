export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth check for static assets and API routes
  if (to.path.startsWith('/_') || to.path.startsWith('/api/')) {
    return
  }
  
  const { status, isAuthenticated, initializeSession } = useSession()
  
  // Initialize session if needed (especially important on SSR)
  if (status.value === 'loading') {
    await initializeSession()
  }
  
  // Handle public routes (login/register)
  if (to.path === '/login' || to.path === '/register') {
    // If authenticated, redirect to dashboard (server-side for no flash)
    if (isAuthenticated.value) {
      return navigateTo('/', { replace: true })
    }
    return
  }
  
  // Protect all other routes
  if (!isAuthenticated.value) {
    return navigateTo('/login', { replace: true })
  }
})