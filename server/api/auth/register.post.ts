import { hashPassword } from '../../utils/auth'
import { withRateLimit, validatePasswordStrength, validateEmailFormat, validateUsername } from '../../utils/rateLimit'
import prisma from '../../utils/db'
import { sendEmail, createEmailTokenData, createVerificationUrl } from '../../utils/email'
import { createVerificationEmailTemplate } from '../../utils/emailTemplates'
import { z } from 'zod'

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export default defineEventHandler(withRateLimit('register', async (event) => {
  try {
    const body = await readBody(event)
    const { username, email, password } = registerSchema.parse(body)

    // Additional validation
    const usernameValidation = validateUsername(username)
    if (!usernameValidation.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: usernameValidation.errors[0]
      })
    }

    if (!validateEmailFormat(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      })
    }

    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: passwordValidation.errors[0]
      })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username or email already exists'
      })
    }

    // Hash password using Argon2
    const passwordHash = await hashPassword(password)

    // Generate email verification token
    const { token, expiresAt } = createEmailTokenData()

    // Create user with email verification token
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        emailVerificationToken: token,
        emailTokenExpiresAt: expiresAt
      }
    })

    // Send verification email
    const verificationUrl = createVerificationUrl(token)
    const { html, text } = createVerificationEmailTemplate({
      username: user.username,
      verificationUrl
    })

    await sendEmail({
      to: user.email,
      subject: 'Verify your email - MarvelCDC',
      html,
      text
    })

    return {
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      data: {
        requiresVerification: true,
        email: user.email
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: error.errors[0].message
      })
    }

    console.error('Registration error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}))