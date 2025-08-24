import { requireAuth } from '../utils/auth'
import { withRateLimit, validateUsername, validateEmailFormat } from '../utils/rateLimit'
import { sendEmail, createEmailTokenData, createVerificationUrl } from '../utils/email'
import prisma from '../utils/db'
import { z } from 'zod'

const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional(),
  firstName: z.string().max(100).nullable().optional(),
  lastName: z.string().max(100).nullable().optional(),
  marvelcdbProfile: z.string().url().nullable().optional().or(z.literal('').transform(() => null))
})

export default defineEventHandler(withRateLimit('profileUpdate', async (event) => {
  const { userId } = await requireAuth(event)
  
  try {
    const body = await readBody(event)
    const validatedData = updateProfileSchema.parse(body)
    
    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!currentUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }
    
    // Validate username if changed
    if (validatedData.username && validatedData.username !== currentUser.username) {
      const usernameValidation = validateUsername(validatedData.username)
      if (!usernameValidation.valid) {
        throw createError({
          statusCode: 400,
          statusMessage: usernameValidation.errors[0]
        })
      }
      
      // Check uniqueness
      const existingUser = await prisma.user.findUnique({
        where: { username: validatedData.username }
      })
      
      if (existingUser) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Username already taken'
        })
      }
    }
    
    // Handle email change
    let emailChangeData = {}
    if (validatedData.email && validatedData.email !== currentUser.email) {
      if (!validateEmailFormat(validatedData.email)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid email format'
        })
      }
      
      // Check email uniqueness
      const existingEmail = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })
      
      if (existingEmail) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Email already in use'
        })
      }
      
      // Generate verification token for new email
      const { token, expiresAt } = createEmailTokenData()
      
      emailChangeData = {
        pendingEmail: validatedData.email,
        pendingEmailToken: token,
        pendingEmailTokenExpiresAt: expiresAt
      }
      
      // Send verification email to new address
      const verificationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/verify-email-change?token=${token}`
      
      await sendEmail({
        to: validatedData.email,
        subject: 'Verify your new email - MarvelCDC',
        html: `
          <h2>Verify Your New Email Address</h2>
          <p>Hi ${currentUser.username},</p>
          <p>You've requested to change your email address. Please click the link below to verify your new email:</p>
          <a href="${verificationUrl}">Verify New Email</a>
          <p>If you didn't request this change, please ignore this email.</p>
        `,
        text: `Verify your new email address by visiting: ${verificationUrl}`
      })
      
      // Remove email from update data since it goes to pending
      delete validatedData.email
    }
    
    // Validate MarvelCDB profile URL if provided
    if (validatedData.marvelcdbProfile) {
      try {
        const url = new URL(validatedData.marvelcdbProfile)
        if (!url.hostname.includes('marvelcdb.com')) {
          throw new Error('Invalid MarvelCDB URL')
        }
      } catch {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid MarvelCDB profile URL'
        })
      }
    }
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...validatedData,
        ...emailChangeData
      },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        firstName: true,
        lastName: true,
        marvelcdbProfile: true,
        pendingEmail: true
      }
    })
    
    return {
      success: true,
      message: (emailChangeData as any).pendingEmail 
        ? 'Profile updated. Please check your new email to verify the change.' 
        : 'Profile updated successfully',
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
        statusMessage: error.errors[0].message
      })
    }
    
    console.error('Profile update error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update profile'
    })
  }
}))