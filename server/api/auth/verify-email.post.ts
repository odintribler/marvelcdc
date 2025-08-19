import { createSession, setSessionCookie } from '../../utils/auth'
import { withRateLimit } from '../../utils/rateLimit'
import { isTokenExpired } from '../../utils/email'
import { sendEmail } from '../../utils/email'
import { createWelcomeEmailTemplate } from '../../utils/emailTemplates'
import prisma from '../../utils/db'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required')
})

export default defineEventHandler(withRateLimit('verifyEmail', async (event) => {
  try {
    const body = await readBody(event)
    const { token } = verifyEmailSchema.parse(body)

    // Find user with verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token
      }
    })

    if (!user) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired verification token'
      })
    }

    // Check if token is expired
    if (!user.emailTokenExpiresAt || isTokenExpired(user.emailTokenExpiresAt)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Verification token has expired. Please request a new verification email.'
      })
    }

    // Check if already verified
    if (user.emailVerified) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is already verified'
      })
    }

    // Verify email and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailTokenExpiresAt: null
      }
    })

    // Send welcome email
    try {
      const { html, text } = createWelcomeEmailTemplate({
        username: user.username
      })

      await sendEmail({
        to: user.email,
        subject: 'Welcome to MarvelCDC!',
        html,
        text
      })
    } catch (emailError) {
      // Don't fail verification if welcome email fails
      console.warn('Failed to send welcome email:', emailError)
    }

    // Create session and log user in
    const session = await createSession(user.id)
    setSessionCookie(event, session.id)

    return {
      success: true,
      message: 'Email verified successfully! Welcome to MarvelCDC.',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          emailVerified: true
        }
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

    console.error('Email verification error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}))