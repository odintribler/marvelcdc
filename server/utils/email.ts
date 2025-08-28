import nodemailer from 'nodemailer'
import { randomBytes } from 'crypto'
import type { Transporter } from 'nodemailer'

// Email configuration
const BREVO_SMTP_HOST = 'smtp-relay.brevo.com'
// Try alternative port if 587 is blocked (2525 is commonly used as alternative)
const BREVO_SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587

// Extended timeouts for production environments with DNS/network issues
const CONNECTION_TIMEOUT = 60000 // 60 seconds
const GREETING_TIMEOUT = 60000 // 60 seconds
const SOCKET_TIMEOUT = 60000 // 60 seconds

// Retry configuration
const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAY = 2000 // 2 seconds between retries

// Token configuration
const EMAIL_TOKEN_LENGTH = 32
const EMAIL_TOKEN_EXPIRES_IN = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const PASSWORD_RESET_TOKEN_EXPIRES_IN = 1 * 60 * 60 * 1000 // 1 hour in milliseconds

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

// Create transporter instance
let transporter: Transporter | null = null

function createTransporter(): Transporter {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY environment variable is required')
  }

  if (!process.env.BREVO_LOGIN_EMAIL) {
    throw new Error('BREVO_LOGIN_EMAIL environment variable is required')
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
      pass: process.env.BREVO_API_KEY,
    },
    // Extended timeouts for production environments
    connectionTimeout: CONNECTION_TIMEOUT,
    greetingTimeout: GREETING_TIMEOUT,
    socketTimeout: SOCKET_TIMEOUT,
    // Pool connections for better performance
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Debug logging in production for troubleshooting
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

  return nodemailer.createTransporter(transporterOptions)
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = createTransporter()
  }
  return transporter
}

// Core email sending function with retry logic
export async function sendEmail(options: EmailOptions): Promise<void> {
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
        console.log(`Email send attempt ${attempt}/${MAX_RETRY_ATTEMPTS} after ${RETRY_DELAY}ms delay...`)
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
        // Force recreation of transporter
        transporter = null
      }
      
      const currentTransporter = getTransporter()
      const result = await currentTransporter.sendMail(mailOptions)
      console.log(`Email sent successfully on attempt ${attempt}:`, result.messageId)
      return result
    } catch (error: any) {
      lastError = error
      console.error(`Email send attempt ${attempt} failed:`, {
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        attempt: attempt,
        maxAttempts: MAX_RETRY_ATTEMPTS
      })
      
      // Don't retry on permanent errors
      if (error.responseCode >= 500 && error.responseCode < 600 && attempt < MAX_RETRY_ATTEMPTS) {
        // Server error, worth retrying
        continue
      } else if (error.code === 'ETIMEDOUT' && attempt < MAX_RETRY_ATTEMPTS) {
        // Timeout, worth retrying
        continue
      } else if (error.code === 'ECONNREFUSED' && attempt < MAX_RETRY_ATTEMPTS) {
        // Connection refused, might be temporary
        continue
      } else {
        // Permanent error or last attempt
        break
      }
    }
  }
  
  // All attempts failed
  console.error('All email send attempts failed. Final error:', {
    error: lastError?.message,
    code: lastError?.code,
    smtp_port: BREVO_SMTP_PORT,
    environment: process.env.NODE_ENV
  })
  throw new Error(`Failed to send email after ${MAX_RETRY_ATTEMPTS} attempts: ${lastError?.message}`)
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
    const transporter = getTransporter()
    console.log('Testing email configuration...')
    console.log('SMTP Host:', BREVO_SMTP_HOST)
    console.log('SMTP Port:', BREVO_SMTP_PORT)
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL)
    console.log('BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY)
    
    await transporter.verify()
    console.log('Email configuration test passed!')
    return true
  } catch (error) {
    console.error('Email configuration test failed:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    })
    return false
  }
}