// Configurable email system that supports both SMTP and Brevo HTTP API
// Set EMAIL_METHOD=smtp or EMAIL_METHOD=http in your .env file

import nodemailer from 'nodemailer'
import { randomBytes } from 'crypto'
import type { Transporter } from 'nodemailer'

// Configuration
const EMAIL_METHOD = process.env.EMAIL_METHOD || 'http' // Default to HTTP API for better reliability
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const BREVO_SMTP_HOST = 'smtp-relay.brevo.com'
const BREVO_SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587

// Token configuration
const EMAIL_TOKEN_LENGTH = 32
const EMAIL_TOKEN_EXPIRES_IN = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const PASSWORD_RESET_TOKEN_EXPIRES_IN = 1 * 60 * 60 * 1000 // 1 hour in milliseconds

// Retry configuration
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 2000 // 2 seconds between retries

// SMTP timeouts
const CONNECTION_TIMEOUT = 60000 // 60 seconds
const GREETING_TIMEOUT = 60000 // 60 seconds
const SOCKET_TIMEOUT = 60000 // 60 seconds

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

// SMTP transporter instance
let transporter: Transporter | null = null

function createSMTPTransporter(): Transporter {
  if (!process.env.BREVO_SMTP_KEY) {
    throw new Error('BREVO_SMTP_KEY environment variable is required for SMTP')
  }

  if (!process.env.BREVO_LOGIN_EMAIL) {
    throw new Error('BREVO_LOGIN_EMAIL environment variable is required for SMTP')
  }

  if (!process.env.FROM_EMAIL) {
    throw new Error('FROM_EMAIL environment variable is required')
  }

  const transporterOptions: any = {
    host: BREVO_SMTP_HOST,
    port: BREVO_SMTP_PORT,
    secure: false, // use STARTTLS
    auth: {
      user: process.env.BREVO_LOGIN_EMAIL,
      pass: process.env.BREVO_SMTP_KEY,
    },
    // Extended timeouts for production environments
    connectionTimeout: CONNECTION_TIMEOUT,
    greetingTimeout: GREETING_TIMEOUT,
    socketTimeout: SOCKET_TIMEOUT,
    // Pool connections for better performance
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Debug logging
    logger: process.env.NODE_ENV === 'production',
    debug: process.env.DEBUG_EMAIL === 'true',
  }

  // Additional TLS options if needed
  if (process.env.NODE_ENV === 'production') {
    transporterOptions.tls = {
      // Allow connection even with self-signed certificates
      rejectUnauthorized: false,
      // Minimum TLS version
      minVersion: 'TLSv1.2',
    }
  }

  return nodemailer.createTransport(transporterOptions)
}

function getSMTPTransporter(): Transporter {
  if (!transporter) {
    transporter = createSMTPTransporter()
  }
  return transporter
}

// Send email via SMTP
async function sendEmailSMTP(options: EmailOptions): Promise<void> {
  const fromEmail = process.env.FROM_EMAIL
  if (!fromEmail) {
    throw new Error('FROM_EMAIL environment variable is required')
  }

  const mailOptions = {
    from: `"MarvelCDC" <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  }

  let lastError: any
  
  // Retry logic for transient failures
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      // Recreate transporter on each retry to handle connection issues
      if (attempt > 1) {
        console.log(`[EMAIL-SMTP] Retry attempt ${attempt}/${MAX_RETRY_ATTEMPTS} after ${RETRY_DELAY}ms delay...`)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        // Force recreation of transporter
        transporter = null
      }
      
      const currentTransporter = getSMTPTransporter()
      const result = await currentTransporter.sendMail(mailOptions)
      console.log(`[EMAIL-SMTP] Email sent successfully on attempt ${attempt}:`, result.messageId)
      return result
    } catch (error: any) {
      lastError = error
      console.error(`[EMAIL-SMTP] Send attempt ${attempt} failed:`, {
        error: error.message,
        code: error.code,
        attempt: attempt,
        maxAttempts: MAX_RETRY_ATTEMPTS
      })
      
      // Don't retry on permanent errors
      if (error.responseCode >= 400 && error.responseCode < 500) {
        break // Permanent error
      } else if (attempt < MAX_RETRY_ATTEMPTS) {
        continue // Retry on temporary errors
      }
    }
  }
  
  throw new Error(`Failed to send email via SMTP after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message}`)
}

// Send email via HTTP API
async function sendEmailHTTP(options: EmailOptions): Promise<void> {
  const fromEmail = process.env.FROM_EMAIL
  const apiKey = process.env.BREVO_API_KEY
  
  if (!fromEmail) {
    throw new Error('FROM_EMAIL environment variable is required')
  }
  
  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is required for HTTP API')
  }

  // Extract name from email if available
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
      
      console.log(`[EMAIL-HTTP] Sending email to ${options.to} via Brevo API (attempt ${attempt})...`)
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
        console.error(`[EMAIL-HTTP] Brevo API error (attempt ${attempt}):`, {
          status: response.status,
          statusText: response.statusText,
          error: responseData,
          duration
        })
        
        // Check if it's worth retrying
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
  
  throw new Error(`Failed to send email via HTTP API after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message}`)
}

// Main email sending function that routes to the appropriate method
export async function sendEmail(options: EmailOptions): Promise<void> {
  console.log(`[EMAIL] Using ${EMAIL_METHOD.toUpperCase()} method to send email`)
  
  try {
    if (EMAIL_METHOD === 'smtp') {
      await sendEmailSMTP(options)
    } else {
      await sendEmailHTTP(options)
    }
  } catch (error: any) {
    console.error('[EMAIL] Failed to send email:', {
      method: EMAIL_METHOD,
      error: error.message,
      to: options.to,
      subject: options.subject
    })
    throw error
  }
}

// Token generation utilities
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
    console.log(`[EMAIL] Testing ${EMAIL_METHOD.toUpperCase()} configuration...`)
    console.log('[EMAIL] FROM_EMAIL:', process.env.FROM_EMAIL)
    
    if (EMAIL_METHOD === 'smtp') {
      console.log('[EMAIL] SMTP Host:', BREVO_SMTP_HOST)
      console.log('[EMAIL] SMTP Port:', BREVO_SMTP_PORT)
      console.log('[EMAIL] BREVO_SMTP_KEY exists:', !!process.env.BREVO_SMTP_KEY)
      console.log('[EMAIL] BREVO_LOGIN_EMAIL:', process.env.BREVO_LOGIN_EMAIL)
      
      const transporter = getSMTPTransporter()
      await transporter.verify()
      console.log('[EMAIL] SMTP configuration test passed!')
      return true
      
    } else {
      console.log('[EMAIL] API URL:', BREVO_API_URL)
      console.log('[EMAIL] BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY)
      
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
        console.log('[EMAIL] Brevo account verified:', account.email)
        console.log('[EMAIL] HTTP API configuration test passed!')
        return true
      } else {
        const error = await response.json()
        console.error('[EMAIL] Brevo API test failed:', error)
        return false
      }
    }
  } catch (error: any) {
    console.error('[EMAIL] Configuration test failed:', {
      method: EMAIL_METHOD,
      error: error.message
    })
    return false
  }
}