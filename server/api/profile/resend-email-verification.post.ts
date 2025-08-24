import { requireAuth } from '../../utils/auth'
import { withRateLimit } from '../../utils/rateLimit'
import { sendEmail, createEmailTokenData } from '../../utils/email'
import prisma from '../../utils/db'

export default defineEventHandler(withRateLimit('resendVerification', async (event) => {
  const { userId } = await requireAuth(event)
  
  try {
    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        pendingEmail: true,
        pendingEmailTokenExpiresAt: true
      }
    })
    
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    if (!user.pendingEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No pending email change found'
      })
    }
    
    // Generate new verification token
    const { token, expiresAt } = createEmailTokenData()
    
    // Update user with new token
    await prisma.user.update({
      where: { id: userId },
      data: {
        pendingEmailToken: token,
        pendingEmailTokenExpiresAt: expiresAt
      }
    })
    
    // Send verification email
    const verificationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/verify-email-change?token=${token}`
    
    await sendEmail({
      to: user.pendingEmail,
      subject: 'Verify your new email - MarvelCDC',
      html: `
        <h2>Verify Your New Email Address</h2>
        <p>Hi ${user.username},</p>
        <p>You've requested to change your email address. Please click the link below to verify your new email:</p>
        <a href="${verificationUrl}">Verify New Email</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't request this change, please ignore this email.</p>
      `,
      text: `Verify your new email address by visiting: ${verificationUrl}`
    })
    
    return {
      success: true,
      message: 'Verification email sent successfully'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Resend email verification error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to resend verification email'
    })
  }
}))