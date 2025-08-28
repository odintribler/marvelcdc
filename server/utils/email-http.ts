import { randomBytes } from 'crypto'

// Brevo API configuration
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

// Token configuration
const EMAIL_TOKEN_LENGTH = 32
const EMAIL_TOKEN_EXPIRES_IN = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const PASSWORD_RESET_TOKEN_EXPIRES_IN = 1 * 60 * 60 * 1000 // 1 hour in milliseconds

// Retry configuration
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000 // 1 second between retries

// Types
export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface EmailTokenData {
  token: string
  expiresAt: Date
}

interface BrevoEmailPayload {
  sender: {
    name: string
    email: string
  }
  to: Array<{
    email: string
    name?: string
  }>
  subject: string
  htmlContent: string
  textContent?: string
}

// Core email sending function using Brevo HTTP API
export async function sendEmail(options: EmailOptions): Promise<void> {
  const fromEmail = process.env.FROM_EMAIL
  const apiKey = process.env.BREVO_API_KEY
  
  if (!fromEmail) {
    throw new Error('FROM_EMAIL environment variable is required')
  }
  
  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is required')
  }

  // Extract name from email if available (format: "name@domain.com")
  const toName = options.to.split('@')[0].replace(/[._-]/g, ' ')
  
  const payload: BrevoEmailPayload = {
    sender: {
      name: 'MarvelCDC',
      email: fromEmail
    },
    to: [{
      email: options.to,
      name: toName
    }],
    subject: options.subject,
    htmlContent: options.html,
    textContent: options.text
  }

  let lastError: any
  
  // Retry logic for transient failures
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`[EMAIL-HTTP] Retry attempt ${attempt}/${MAX_RETRY_ATTEMPTS} after ${RETRY_DELAY}ms delay...`)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      }
      
      console.log(`[EMAIL-HTTP] Sending email via Brevo API (attempt ${attempt})...`)
      const startTime = Date.now()
      
      const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const duration = Date.now() - startTime
      const responseData = await response.json()
      
      if (!response.ok) {
        // Log the error details
        console.error(`[EMAIL-HTTP] Brevo API error (attempt ${attempt}):`, {
          status: response.status,
          statusText: response.statusText,
          error: responseData,
          duration
        })
        
        // Check if it's a rate limit or temporary error worth retrying
        if (response.status === 429 || response.status >= 500) {
          lastError = new Error(`Brevo API error: ${response.status} - ${JSON.stringify(responseData)}`)
          if (attempt < MAX_RETRY_ATTEMPTS) {
            continue // Retry
          }
        } else {
          // Permanent error, don't retry
          throw new Error(`Brevo API error: ${response.status} - ${JSON.stringify(responseData)}`)
        }
      } else {
        console.log(`[EMAIL-HTTP] Email sent successfully in ${duration}ms`)
        console.log(`[EMAIL-HTTP] Message ID:`, responseData.messageId)
        return
      }
    } catch (error: any) {
      lastError = error
      console.error(`[EMAIL-HTTP] Request failed (attempt ${attempt}):`, {
        message: error.message,
        attempt: attempt,
        maxAttempts: MAX_RETRY_ATTEMPTS
      })
      
      // Network errors are worth retrying
      if (attempt < MAX_RETRY_ATTEMPTS) {
        continue
      }
    }
  }
  
  // All attempts failed
  console.error('[EMAIL-HTTP] All email send attempts failed. Final error:', {
    error: lastError?.message,
    environment: process.env.NODE_ENV
  })
  throw new Error(`Failed to send email after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message}`)
}

// Token generation utilities (same as SMTP version)
export function generateEmailToken(): string {
  return randomBytes(EMAIL_TOKEN_LENGTH).toString('hex')
}

export function createEmailTokenData(customExpiresIn?: number): EmailTokenData {
  const token = generateEmailToken()
  const expiresIn = customExpiresIn || EMAIL_TOKEN_EXPIRES_IN
  const expiresAt = new Date(Date.now() + expiresIn)

  return {
    token,
    expiresAt,
  }
}

export function createPasswordResetTokenData(): EmailTokenData {
  return createEmailTokenData(PASSWORD_RESET_TOKEN_EXPIRES_IN)
}

// URL generation utilities
export function createVerificationUrl(token: string): string {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  return `${baseUrl}/verify-email?token=${token}`
}

export function createPasswordResetUrl(token: string): string {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  return `${baseUrl}/reset-password?token=${token}`
}

// Verification helpers
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt
}

// Test email configuration
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    console.log('[EMAIL-HTTP] Testing Brevo API configuration...')
    console.log('[EMAIL-HTTP] API URL:', BREVO_API_URL)
    console.log('[EMAIL-HTTP] FROM_EMAIL:', process.env.FROM_EMAIL)
    console.log('[EMAIL-HTTP] BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY)
    
    // Make a test API call to verify credentials
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY || ''
      }
    })
    
    if (response.ok) {
      const account = await response.json()
      console.log('[EMAIL-HTTP] Brevo account verified:', account.email)
      console.log('[EMAIL-HTTP] Email configuration test passed!')
      return true
    } else {
      const error = await response.json()
      console.error('[EMAIL-HTTP] Brevo API test failed:', error)
      return false
    }
  } catch (error: any) {
    console.error('[EMAIL-HTTP] Email configuration test failed:', {
      error: error.message
    })
    return false
  }
}