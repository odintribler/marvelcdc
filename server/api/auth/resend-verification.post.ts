import { withRateLimit } from '../../utils/rateLimit'
import { sendEmail, createEmailTokenData, createVerificationUrl } from '../../utils/email'
import { createVerificationEmailTemplate } from '../../utils/emailTemplates'
import prisma from '../../utils/db'
import { z } from 'zod'

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address')
})

export default defineEventHandler(withRateLimit('resendVerification', async (event) => {
  try {
    const body = await readBody(event)
    const { email } = resendVerificationSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        success: true,
        message: 'If an account with this email exists and is not verified, a verification email has been sent.'
      }
    }

    // Check if already verified
    if (user.emailVerified) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is already verified'
      })
    }

    // Generate new verification token
    const { token, expiresAt } = createEmailTokenData()

    // Update user with new token
    await prisma.user.update({
      where: { id: user.id },
      data: {
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
      message: 'Verification email sent! Please check your inbox.'
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

    console.error('Resend verification error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}))