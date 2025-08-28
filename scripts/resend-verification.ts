#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client'
import { sendEmail, createEmailTokenData, createVerificationUrl } from '../server/utils/email.js'
import { createVerificationEmailTemplate } from '../server/utils/emailTemplates.js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env') })

const prisma = new PrismaClient()

async function resendVerificationEmail(username: string) {
  try {
    console.log(`Looking for user with username: ${username}`)
    
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      console.error(`❌ User with username "${username}" not found`)
      process.exit(1)
    }

    console.log(`Found user: ${user.email}`)

    // Check if already verified
    if (user.emailVerified) {
      console.log(`✅ User's email is already verified`)
      process.exit(0)
    }

    console.log(`Generating new verification token...`)

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

    console.log(`Token generated and saved. Sending email...`)

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

    console.log(`✅ Verification email successfully sent to ${user.email}`)
    console.log(`Verification URL: ${verificationUrl}`)
    
  } catch (error) {
    console.error('❌ Error resending verification email:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Get username from command line arguments
const username = process.argv[2]

if (!username) {
  console.error('❌ Please provide a username')
  console.log('Usage: npm run resend-verification <username>')
  console.log('Example: npm run resend-verification john_doe')
  process.exit(1)
}

// Run the script
resendVerificationEmail(username)