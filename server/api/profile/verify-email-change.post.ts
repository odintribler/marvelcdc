import { z } from 'zod'
import { withRateLimit } from '../../utils/rateLimit'
import prisma from '../../utils/db'

const verifyEmailChangeSchema = z.object({
  token: z.string().min(1)
})

export default defineEventHandler(withRateLimit('emailChangeVerification', async (event) => {
  try {
    const body = await readBody(event)
    const { token } = verifyEmailChangeSchema.parse(body)
    
    // Find user with this pending email token
    const user = await prisma.user.findFirst({
      where: {
        pendingEmailToken: token,
        pendingEmailTokenExpiresAt: {
          gt: new Date()
        }
      }
    })
    
    if (!user) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired verification token'
      })
    }
    
    if (!user.pendingEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No pending email change found'
      })
    }
    
    // Check if new email is still unique
    const existingEmail = await prisma.user.findUnique({
      where: { email: user.pendingEmail }
    })
    
    if (existingEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email address is no longer available'
      })
    }
    
    // Update user's email and clear pending fields
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.pendingEmail,
        emailVerified: true,
        pendingEmail: null,
        pendingEmailToken: null,
        pendingEmailTokenExpiresAt: null
      },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true
      }
    })
    
    return {
      success: true,
      message: 'Email successfully changed',
      data: {
        profile: updatedUser
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    
    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid request data'
      })
    }
    
    console.error('Email change verification error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify email change'
    })
  }
}))