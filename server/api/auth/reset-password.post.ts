import { hashPassword, deleteUserSessions, createSession, setSessionCookie } from '../../utils/auth'
import { withRateLimit, validatePasswordStrength } from '../../utils/rateLimit'
import { isTokenExpired, sendEmail } from '../../utils/email'
import { createPasswordChangedEmailTemplate } from '../../utils/emailTemplates'
import prisma from '../../utils/db'
import { z } from 'zod'

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export default defineEventHandler(withRateLimit('resetPassword', async (event) => {
  try {
    const body = await readBody(event)
    const { token, password } = resetPasswordSchema.parse(body)

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: passwordValidation.errors[0]
      })
    }

    // Find user with reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token
      }
    })

    if (!user) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired reset token'
      })
    }

    // Check if token is expired
    if (!user.passwordTokenExpiresAt || isTokenExpired(user.passwordTokenExpiresAt)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Reset token has expired. Please request a new password reset.'
      })
    }

    // Hash new password
    const passwordHash = await hashPassword(password)

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordTokenExpiresAt: null
      }
    })

    // Invalidate all existing sessions for security
    await deleteUserSessions(user.id)

    // Send password changed confirmation email
    try {
      const { html, text } = createPasswordChangedEmailTemplate({
        username: user.username
      })

      await sendEmail({
        to: user.email,
        subject: 'Password changed - MarvelCDC',
        html,
        text
      })
    } catch (emailError) {
      // Don't fail password reset if email fails
      console.warn('Failed to send password changed email:', emailError)
    }

    // Create new session and log user in
    const session = await createSession(user.id)
    setSessionCookie(event, session.id)

    return {
      success: true,
      message: 'Password reset successfully! You are now logged in.',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          emailVerified: user.emailVerified
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

    console.error('Reset password error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}))