import { validateSession } from '../utils/auth'

export default defineEventHandler(async (event) => {
  // Skip processing for static assets and non-API routes that don't need session
  if (event.node.req.url?.startsWith('/_nuxt/') || 
      event.node.req.url?.startsWith('/_') ||
      event.node.req.url?.includes('.')) {
    return
  }

  // Validate session and attach user to context
  const sessionResult = await validateSession(event)
  
  if (sessionResult) {
    // Attach user and session to event context for use in API routes
    event.context.user = sessionResult.user
    event.context.session = sessionResult.session
  }
})