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
  
  // Define public routes that don't require authentication
  const publicRoutes = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/about'
  ]
  
  // Handle public routes
  if (publicRoutes.includes(to.path)) {
    // If authenticated and trying to access login/register, redirect to dashboard
    if (isAuthenticated.value && (to.path === '/login' || to.path === '/register')) {
      return navigateTo('/', { replace: true })
    }
    return
  }
  
  // Protect all other routes
  if (!isAuthenticated.value) {
    return navigateTo('/login', { replace: true })
  }
})