# MarvelCDC Transactional Email Implementation PRD

## Executive Summary

This Product Requirements Document (PRD) outlines the implementation of comprehensive email authentication features for MarvelCDC, including email verification on signup, forgot password functionality, and two-factor authentication foundation using Brevo SMTP service.

**Key Features:**
- Email verification on user registration
- Forgot password with secure reset tokens
- Professional email templates with Marvel Champions branding
- Rate limiting and security enhancements
- Foundation for future 2FA implementation

**Technology Stack:**
- **Email Service:** Brevo SMTP (300 emails/day free tier)
- **Email Library:** Nodemailer
- **Database:** PostgreSQL with Prisma ORM
- **Deployment:** Railway with environment variables
- **Security:** Argon2 password hashing, secure token generation

## Technical Requirements

### Dependencies
```bash
npm install nodemailer @types/nodemailer ms
```

### Environment Variables
```env
# Brevo SMTP Configuration
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-brevo-email@domain.com
BREVO_SMTP_KEY=your-brevo-smtp-key
BREVO_FROM_EMAIL=noreply@marvelcdc.com
BREVO_FROM_NAME=MarvelCDC

# Application Configuration
APP_URL=https://your-app-url.up.railway.app
APP_NAME=MarvelCDC
```

## Implementation Phases

### Phase 1: Email Infrastructure Setup

#### 1.1 Create Email Service Module
**File:** `server/utils/email.ts`

```typescript
import nodemailer from 'nodemailer'

// Brevo SMTP Configuration
const transporter = nodemailer.createTransporter({
  host: process.env.BREVO_SMTP_HOST,
  port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
  secure: false, // STARTTLS
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_KEY,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.BREVO_FROM_NAME}" <${process.env.BREVO_FROM_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })
    
    console.log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error.message }
  }
}

export function generateEmailToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function createVerificationUrl(token: string): string {
  return `${process.env.APP_URL}/verify-email?token=${token}`
}

export function createPasswordResetUrl(token: string): string {
  return `${process.env.APP_URL}/reset-password/${token}`
}
```

#### 1.2 Email Template System
**File:** `server/utils/emailTemplates.ts`

```typescript
export function getVerificationEmailTemplate(username: string, verificationUrl: string): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to MarvelCDC</title>
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #DC2626, #991B1B); color: white; padding: 2rem; text-align: center; }
        .content { padding: 2rem; background: #f9fafb; }
        .button { background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 1rem 0; }
        .footer { background: #374151; color: #9CA3AF; padding: 1rem; text-align: center; font-size: 0.875rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to MarvelCDC!</h1>
          <p>Your Marvel Champions Deck Collection Manager</p>
        </div>
        <div class="content">
          <h2>Hello ${username}!</h2>
          <p>Thank you for joining MarvelCDC. To get started with managing your Marvel Champions deck collection, please verify your email address.</p>
          <p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #6B7280;">${verificationUrl}</p>
          <p><strong>This link will expire in 24 hours.</strong></p>
        </div>
        <div class="footer">
          <p>© 2025 MarvelCDC. All rights reserved.</p>
          <p>A deck collection management tool for Marvel Champions LCG</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Welcome to MarvelCDC!
    
    Hello ${username}!
    
    Thank you for joining MarvelCDC. To get started with managing your Marvel Champions deck collection, please verify your email address by clicking the link below:
    
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    © 2025 MarvelCDC. All rights reserved.
  `
  
  return { html, text }
}

export function getPasswordResetEmailTemplate(username: string, resetUrl: string): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your MarvelCDC Password</title>
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #DC2626, #991B1B); color: white; padding: 2rem; text-align: center; }
        .content { padding: 2rem; background: #f9fafb; }
        .button { background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 1rem 0; }
        .warning { background: #FEF3C7; border: 1px solid #F59E0B; padding: 1rem; border-radius: 6px; margin: 1rem 0; }
        .footer { background: #374151; color: #9CA3AF; padding: 1rem; text-align: center; font-size: 0.875rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
          <p>MarvelCDC Account Security</p>
        </div>
        <div class="content">
          <h2>Hello ${username}!</h2>
          <p>We received a request to reset the password for your MarvelCDC account. If you made this request, click the button below to reset your password.</p>
          <p>
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #6B7280;">${resetUrl}</p>
          <div class="warning">
            <p><strong>⚠️ Important Security Information:</strong></p>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your current password remains unchanged until you complete the reset</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>© 2025 MarvelCDC. All rights reserved.</p>
          <p>If you're having trouble, contact us or visit our help center</p>
        </div>
      </div>
    </body>
    </html>
  `
  
  const text = `
    Password Reset Request - MarvelCDC
    
    Hello ${username}!
    
    We received a request to reset the password for your MarvelCDC account. If you made this request, click the link below to reset your password:
    
    ${resetUrl}
    
    IMPORTANT SECURITY INFORMATION:
    - This link will expire in 1 hour
    - If you didn't request this reset, please ignore this email
    - Your current password remains unchanged until you complete the reset
    
    © 2025 MarvelCDC. All rights reserved.
  `
  
  return { html, text }
}
```

### Phase 2: Database Schema Enhancement

#### 2.1 Updated Prisma Schema
**File:** `prisma/schema.prisma` (additions)

```prisma
model User {
  id               Int      @id @default(autoincrement())
  username         String   @unique
  email            String   @unique
  passwordHash     String   @map("password_hash")
  emailVerified    Boolean  @default(false) @map("email_verified")
  emailToken       String?  @unique @map("email_token")
  emailTokenExpiry DateTime? @map("email_token_expiry")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  // Relations
  collections    Collection[]
  decks          Deck[]
  sessions       Session[]
  passwordResets PasswordReset[]

  @@map("users")
}

model PasswordReset {
  id        String   @id @default(cuid())
  userId    Int      @map("user_id")
  token     String   @unique
  expiresAt DateTime @map("expires_at")
  used      Boolean  @default(false)
  ipAddress String?  @map("ip_address")
  userAgent String?  @map("user_agent")
  createdAt DateTime @default(now()) @map("created_at")
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([token])
  @@map("password_resets")
}
```

#### 2.2 Migration Command
```bash
npx prisma migrate dev --name add-email-verification-and-password-reset
```

### Phase 3: API Endpoints Implementation

#### 3.1 Enhanced Registration Endpoint
**File:** `server/api/auth/register.post.ts`

```typescript
import { z } from 'zod'
import { hashPassword } from '~/server/utils/auth'
import { sendEmail, generateEmailToken, createVerificationUrl, getVerificationEmailTemplate } from '~/server/utils/email'
import prisma from '~/server/utils/db'

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User with this email or username already exists'
      })
    }

    // Hash password
    const passwordHash = await hashPassword(password)
    
    // Generate email verification token
    const emailToken = generateEmailToken()
    const emailTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        emailVerified: false,
        emailToken,
        emailTokenExpiry,
      },
    })

    // Send verification email
    const verificationUrl = createVerificationUrl(emailToken)
    const { html, text } = getVerificationEmailTemplate(username, verificationUrl)
    
    await sendEmail({
      to: email,
      subject: 'Welcome to MarvelCDC - Verify Your Email',
      html,
      text,
    })

    return {
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
      }
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
```

#### 3.2 Email Verification Endpoint
**File:** `server/api/auth/verify-email.post.ts`

```typescript
import { z } from 'zod'
import prisma from '~/server/utils/db'

const verifyEmailSchema = z.object({
  token: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token } = verifyEmailSchema.parse(body)

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { emailToken: token }
    })

    if (!user) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired verification token'
      })
    }

    // Check if token is expired
    if (user.emailTokenExpiry && user.emailTokenExpiry < new Date()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Verification token has expired'
      })
    }

    // Update user to verified and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailToken: null,
        emailTokenExpiry: null,
      }
    })

    return {
      success: true,
      message: 'Email verified successfully. You can now log in.',
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
```

#### 3.3 Forgot Password Endpoint
**File:** `server/api/auth/forgot-password.post.ts`

```typescript
import { z } from 'zod'
import { generateEmailToken, sendEmail, createPasswordResetUrl, getPasswordResetEmailTemplate } from '~/server/utils/email'
import prisma from '~/server/utils/db'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email } = forgotPasswordSchema.parse(body)
    
    // Get client IP and user agent for security logging
    const ipAddress = getClientIP(event)
    const userAgent = getHeader(event, 'user-agent')

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success to prevent email enumeration
    const successResponse = {
      success: true,
      message: 'If an account with that email exists, we\'ve sent a password reset link.',
    }

    if (!user) {
      return successResponse
    }

    // Check rate limiting - max 3 reset requests per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentResets = await prisma.passwordReset.count({
      where: {
        userId: user.id,
        createdAt: { gte: oneHourAgo },
      }
    })

    if (recentResets >= 3) {
      return successResponse // Don't reveal rate limiting
    }

    // Generate reset token
    const token = generateEmailToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Create password reset record
    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
        ipAddress,
        userAgent,
      }
    })

    // Send reset email
    const resetUrl = createPasswordResetUrl(token)
    const { html, text } = getPasswordResetEmailTemplate(user.username, resetUrl)
    
    await sendEmail({
      to: email,
      subject: 'Reset Your MarvelCDC Password',
      html,
      text,
    })

    return successResponse
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
```

#### 3.4 Reset Password Endpoint
**File:** `server/api/auth/reset-password.post.ts`

```typescript
import { z } from 'zod'
import { hashPassword } from '~/server/utils/auth'
import { deleteUserSessions } from '~/server/utils/auth'
import prisma from '~/server/utils/db'

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token, password } = resetPasswordSchema.parse(body)

    // Find valid password reset token
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!passwordReset || passwordReset.used || passwordReset.expiresAt < new Date()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired reset token'
      })
    }

    // Hash new password
    const passwordHash = await hashPassword(password)

    // Update user password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: passwordReset.userId },
        data: { passwordHash }
      }),
      prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { used: true }
      })
    ])

    // Invalidate all user sessions for security
    await deleteUserSessions(passwordReset.userId)

    return {
      success: true,
      message: 'Password reset successfully. Please log in with your new password.',
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
```

#### 3.5 Enhanced Login Endpoint
**File:** `server/api/auth/login.post.ts` (modifications)

```typescript
// Add email verification check to existing login
const user = await prisma.user.findUnique({
  where: { username },
})

if (!user) {
  throw createError({
    statusCode: 401,
    statusMessage: 'Invalid credentials'
  })
}

// Check email verification
if (!user.emailVerified) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Please verify your email address before logging in'
  })
}

// Continue with existing password verification...
```

### Phase 4: Frontend Implementation

#### 4.1 Enhanced Registration Page
**File:** `pages/register.vue` (modifications)

```vue
<template>
  <!-- Add email verification notice -->
  <div v-if="registrationSuccess" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="ml-3">
        <h3 class="text-sm font-medium text-green-800">Account Created Successfully!</h3>
        <p class="mt-1 text-sm text-green-700">
          Please check your email and click the verification link to activate your account.
        </p>
      </div>
    </div>
  </div>
</template>
```

#### 4.2 Forgot Password Page
**File:** `pages/forgot-password.vue`

```vue
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Forgot your password?
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you a reset link.
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700">
                If an account with that email exists, we've sent a password reset link.
              </p>
            </div>
          </div>
        </div>

        <form v-else @submit.prevent="handleForgotPassword" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                :disabled="isLoading"
                type="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isLoading">Send Reset Link</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            </button>
          </div>

          <div class="text-center">
            <NuxtLink to="/login" class="text-sm text-red-600 hover:text-red-500">
              Back to sign in
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const form = reactive({
  email: ''
})

const isLoading = ref(false)
const error = ref('')
const success = ref(false)

const handleForgotPassword = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: form
    })
    
    if (response.success) {
      success.value = true
    }
  } catch (err: any) {
    error.value = err.data?.message || 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}
</script>
```

#### 4.3 Reset Password Page
**File:** `pages/reset-password/[token].vue`

```vue
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Enter your new password below.
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">Password Reset Successfully!</h3>
              <p class="mt-1 text-sm text-green-700">
                Your password has been updated. You can now log in with your new password.
              </p>
              <div class="mt-3">
                <NuxtLink to="/login" class="text-sm font-medium text-green-800 hover:text-green-700">
                  Go to login →
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <form v-else @submit.prevent="handleResetPassword" class="space-y-6">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                :disabled="isLoading"
                type="password"
                required
                minlength="8"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Enter your new password"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :disabled="isLoading"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Confirm your new password"
              />
            </div>
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading || !passwordsMatch"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isLoading">Reset Password</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const token = route.params.token as string

const form = reactive({
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const error = ref('')
const success = ref(false)

const passwordsMatch = computed(() => {
  return form.password === form.confirmPassword && form.password.length >= 8
})

const handleResetPassword = async () => {
  if (isLoading.value || !passwordsMatch.value) return
  
  isLoading.value = true
  error.value = ''

  try {
    const response = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token,
        password: form.password
      }
    })
    
    if (response.success) {
      success.value = true
    }
  } catch (err: any) {
    error.value = err.data?.message || 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}
</script>
```

#### 4.4 Email Verification Page
**File:** `pages/verify-email.vue`

```vue
<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center">
          <svg class="animate-spin h-8 w-8 text-red-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-2 text-sm text-gray-600">Verifying your email...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="success" class="text-center">
          <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Email Verified!</h3>
          <p class="text-sm text-gray-600 mb-4">
            Your email has been successfully verified. You can now log in to your MarvelCDC account.
          </p>
          <NuxtLink
            to="/login"
            class="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Go to Login
          </NuxtLink>
        </div>

        <!-- Error State -->
        <div v-else class="text-center">
          <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Verification Failed</h3>
          <p class="text-sm text-gray-600 mb-4">{{ error }}</p>
          <div class="space-y-2">
            <NuxtLink
              to="/login"
              class="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Back to Login
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const token = route.query.token as string

const isLoading = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  if (!token) {
    error.value = 'No verification token provided'
    isLoading.value = false
    return
  }

  try {
    const response = await $fetch('/api/auth/verify-email', {
      method: 'POST',
      body: { token }
    })
    
    if (response.success) {
      success.value = true
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Verification failed'
  } finally {
    isLoading.value = false
  }
})
</script>
```

### Phase 5: Security Enhancements

#### 5.1 Rate Limiting Middleware
**File:** `server/utils/rateLimit.ts`

```typescript
interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (event: H3Event) => string
}

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function createRateLimit(config: RateLimitConfig) {
  return async (event: H3Event) => {
    const key = config.keyGenerator ? config.keyGenerator(event) : getClientIP(event) || 'unknown'
    const now = Date.now()
    
    // Clean up expired entries
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetTime) {
        rateLimitMap.delete(k)
      }
    }
    
    const current = rateLimitMap.get(key)
    
    if (!current) {
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return
    }
    
    if (now > current.resetTime) {
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return
    }
    
    if (current.count >= config.maxRequests) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many requests'
      })
    }
    
    current.count++
  }
}

// Specific rate limiters
export const authRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
})

export const loginRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour  
  maxRequests: 10,
})

export const passwordResetRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  keyGenerator: (event) => {
    const body = readBody(event)
    return `reset:${body.email}`
  }
})
```

#### 5.2 Enhanced Auth Utilities
**File:** `server/utils/auth.ts` (additions)

```typescript
// Add email verification check to requireAuth
export async function requireVerifiedAuth(event: H3Event): Promise<{ session: Session; user: User; userId: number }> {
  const result = await validateSession(event)
  
  if (!result) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  if (!result.user.emailVerified) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Email verification required',
    })
  }

  return {
    ...result,
    userId: result.user.id,
  }
}

// Generate secure tokens
export function generateSecureToken(): string {
  return randomBytes(32).toString('hex')
}

// Validate token format
export function isValidToken(token: string): boolean {
  return /^[a-f0-9]{64}$/.test(token)
}
```

### Phase 6: Railway Deployment Configuration

#### 6.1 Environment Variables Setup
```bash
# Set Brevo SMTP credentials in Railway
railway variables set BREVO_SMTP_HOST=smtp-relay.brevo.com
railway variables set BREVO_SMTP_PORT=587
railway variables set BREVO_SMTP_USER=your-brevo-email@domain.com
railway variables set BREVO_SMTP_KEY=your-brevo-smtp-key
railway variables set BREVO_FROM_EMAIL=noreply@marvelcdc.com
railway variables set BREVO_FROM_NAME=MarvelCDC
railway variables set APP_URL=https://your-app.up.railway.app
railway variables set APP_NAME=MarvelCDC

# Verify variables are set
railway variables
```

#### 6.2 Production Deployment Checklist
```bash
# 1. Run database migration
railway run npx prisma migrate deploy

# 2. Test email sending in production
railway run node -e "
const { sendEmail } = require('./server/utils/email.js');
sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Test</h1>',
  text: 'Test'
}).then(console.log).catch(console.error);
"

# 3. Monitor logs
railway logs

# 4. Check Brevo dashboard for delivery statistics
```

## Security Considerations

### 6.1 Token Security
- **Email tokens**: 32-byte cryptographically secure random tokens
- **Expiration**: Email verification (24 hours), Password reset (1 hour)
- **Single-use**: Tokens invalidated after use
- **Rate limiting**: Prevent token enumeration attacks

### 6.2 Email Security
- **No email enumeration**: Always return success for forgot password
- **Rate limiting**: Prevent spam and abuse
- **Secure headers**: SPF, DKIM, DMARC configuration
- **Input validation**: Email format validation with Zod

### 6.3 Session Security
- **Session invalidation**: All sessions cleared on password reset
- **HTTPS only**: Secure cookies in production
- **SameSite**: CSRF protection
- **HttpOnly**: XSS protection

## Monitoring & Analytics

### 6.1 Brevo Dashboard Metrics
- Email delivery rates
- Bounce rates and classifications
- Open rates (if tracking enabled)
- Spam complaint rates
- Domain reputation scores

### 6.2 Application Metrics
- Email verification completion rates
- Password reset usage patterns
- Failed authentication attempts
- Rate limiting trigger frequency

### 6.3 Error Monitoring
- Email sending failures
- SMTP connection issues
- Token validation errors
- Rate limit violations

## Future Enhancements

### 6.1 Two-Factor Authentication (2FA)
- TOTP-based authentication with Google Authenticator
- Backup codes for recovery
- Optional enforcement for admin accounts

### 6.2 Advanced Security Features
- Device tracking and notifications
- Suspicious login alerts
- Geographic login restrictions
- Session management dashboard

### 6.3 Email Enhancements
- Email change verification workflow
- Welcome email series for new users
- Transactional email templates in Brevo
- A/B testing for email content

## Testing Strategy

### 6.1 Local Development Testing
```bash
# Use Ethereal Email for development
BREVO_SMTP_HOST=smtp.ethereal.email
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=ethereal-username
BREVO_SMTP_KEY=ethereal-password
```

### 6.2 Production Testing
- Test email delivery to multiple providers (Gmail, Outlook, Yahoo)
- Verify SPF/DKIM records are properly configured
- Test rate limiting with automated tools
- Validate HTML email rendering across clients

### 6.3 Security Testing
- Test token expiration and invalidation
- Verify rate limiting effectiveness
- Test email enumeration protection
- Validate session invalidation on password reset

---

## Conclusion

This comprehensive implementation provides MarvelCDC with enterprise-grade email authentication features while maintaining the simplicity and security of the existing architecture. The Brevo SMTP integration ensures reliable email delivery with room for growth, and the modular design allows for easy extension with additional security features.

**Key Benefits:**
- 🔒 **Enhanced Security**: Email verification, secure password reset, rate limiting
- 📧 **Reliable Email**: Brevo's robust SMTP infrastructure with 300 emails/day free
- 🚀 **Railway Ready**: Optimized for Railway deployment with environment variables
- 📱 **Mobile Optimized**: Responsive email templates and UI components
- 🔍 **Monitoring**: Comprehensive analytics and error tracking
- 🎯 **Future Proof**: Foundation for 2FA and advanced security features

The implementation follows security best practices while maintaining excellent user experience, positioning MarvelCDC as a professional and trustworthy platform for Marvel Champions LCG enthusiasts.