import ms from 'ms'

// In-memory rate limiting store (for production, consider Redis)
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Rate limit configurations
export const RATE_LIMITS = {
  // Authentication endpoints
  login: { attempts: 5, window: ms('15m') }, // 5 attempts per 15 minutes
  register: { attempts: 3, window: ms('1h') }, // 3 attempts per hour
  verifyEmail: { attempts: 10, window: ms('1h') }, // 10 attempts per hour
  resendVerification: { attempts: 3, window: ms('1h') }, // 3 resends per hour
  forgotPassword: { attempts: 3, window: ms('1h') }, // 3 attempts per hour
  resetPassword: { attempts: 5, window: ms('1h') }, // 5 attempts per hour
  
  // General API endpoints
  api: { attempts: 100, window: ms('15m') }, // 100 requests per 15 minutes
}

export interface RateLimitConfig {
  attempts: number
  window: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  error?: string
}

// Clean up expired entries periodically
function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, ms('5m'))

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = identifier
  const entry = rateLimitStore.get(key)

  // No entry exists or window expired - create new entry
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.window
    })
    
    return {
      allowed: true,
      remaining: config.attempts - 1,
      resetTime: now + config.window
    }
  }

  // Increment existing entry
  entry.count++

  // Check if limit exceeded
  if (entry.count > config.attempts) {
    const resetInMs = entry.resetTime - now
    const resetInMinutes = Math.ceil(resetInMs / (1000 * 60))
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      error: `Rate limit exceeded. Try again in ${resetInMinutes} minute${resetInMinutes !== 1 ? 's' : ''}.`
    }
  }

  return {
    allowed: true,
    remaining: config.attempts - entry.count,
    resetTime: entry.resetTime
  }
}

// Create rate limit key based on IP and endpoint
export function createRateLimitKey(event: any, endpoint: string): string {
  const ip = getClientIP(event) || 'unknown'
  return `${ip}:${endpoint}`
}

// Get client IP address
export function getClientIP(event: any): string | null {
  // Check various headers for IP address
  const headers = getHeaders(event)
  
  return (
    headers['cf-connecting-ip'] || // Cloudflare
    headers['x-forwarded-for']?.split(',')[0]?.trim() || // Proxy/Load balancer
    headers['x-real-ip'] || // Nginx
    headers['x-client-ip'] || // Apache
    headers['x-forwarded'] || // Other proxies
    headers['forwarded-for'] || // RFC 7239
    headers['forwarded'] || // RFC 7239
    event.node?.req?.socket?.remoteAddress || // Direct connection
    event.node?.req?.connection?.remoteAddress || // Direct connection (legacy)
    null
  )
}

// Rate limiting middleware for API routes
export function withRateLimit(
  endpoint: keyof typeof RATE_LIMITS,
  handler: (event: any) => Promise<any>
) {
  return async (event: any) => {
    const rateLimitKey = createRateLimitKey(event, endpoint)
    const config = RATE_LIMITS[endpoint]
    const result = checkRateLimit(rateLimitKey, config)

    if (!result.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
        data: {
          error: result.error,
          resetTime: result.resetTime
        }
      })
    }

    // Add rate limit headers
    setHeaders(event, {
      'X-RateLimit-Limit': config.attempts.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    })

    return await handler(event)
  }
}

// Additional security utilities
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long')
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters')
  }
  
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Validate email format more strictly
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 320 // RFC 5321 limit
}

// Validate username format
export function validateUsername(username: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long')
  }
  
  if (username.length > 50) {
    errors.push('Username must be less than 50 characters')
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, hyphens, and underscores')
  }
  
  if (/^[_-]|[_-]$/.test(username)) {
    errors.push('Username cannot start or end with hyphens or underscores')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}