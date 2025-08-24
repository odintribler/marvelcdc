import { withRateLimit } from '../../utils/rateLimit'
import { sendEmail, createPasswordResetTokenData, createPasswordResetUrl } from '../../utils/email'
import { createPasswordResetEmailTemplate } from '../../utils/emailTemplates'
import prisma from '../../utils/db'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export default defineEventHandler(withRateLimit('forgotPassword', async (event) => {
  try {
    const body = await readBody(event)
    const { email } = forgotPasswordSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        success: true,
        message: 'If an account with this email exists, a password reset email has been sent.'
      }
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email not verified. Please verify your email first before resetting your password.'
      })
    }

    // Generate password reset token
    const { token, expiresAt } = createPasswordResetTokenData()

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordTokenExpiresAt: expiresAt
      }
    })

    // Send password reset email
    const resetUrl = createPasswordResetUrl(token)
    const { html, text } = createPasswordResetEmailTemplate({
      username: user.username,
      resetUrl
    })

    await sendEmail({
      to: user.email,
      subject: 'Reset your password - MarvelCDC',
      html,
      text
    })

    return {
      success: true,
      message: 'Password reset email sent! Please check your inbox.'
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

    console.error('Forgot password error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}))