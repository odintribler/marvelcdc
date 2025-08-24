import nodemailer from 'nodemailer'
import { randomBytes } from 'crypto'
import type { Transporter } from 'nodemailer'

// Email configuration
const BREVO_SMTP_HOST = 'smtp-relay.brevo.com'
const BREVO_SMTP_PORT = 587

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

  return nodemailer.createTransport({
    host: BREVO_SMTP_HOST,
    port: BREVO_SMTP_PORT,
    secure: false, // TLS
    auth: {
      user: process.env.BREVO_LOGIN_EMAIL, // Your Brevo account email
      pass: process.env.BREVO_API_KEY, // Your SMTP API key
    },
  })
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = createTransporter()
  }
  return transporter
}

// Core email sending function
export async function sendEmail(options: EmailOptions): Promise<void> {
  const fromEmail = process.env.FROM_EMAIL
  if (!fromEmail) {
    throw new Error('FROM_EMAIL environment variable is required')
  }

  const transporter = getTransporter()

  const mailOptions = {
    from: `"MarvelCDC" <${fromEmail}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  }

  try {
    const result = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', result.messageId)
    return result
  } catch (error) {
    console.error('Detailed email send error:', {
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack
    })
    throw new Error(`Failed to send email: ${error.message}`)
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