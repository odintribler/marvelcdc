import { hashPassword, createSession, setSessionCookie } from '../../utils/auth'
import prisma from '../../utils/db'
import { z } from 'zod'

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, email, password } = registerSchema.parse(body)

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

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash
      }
    })

    // Create session
    const session = await createSession(user.id)

    // Set session cookie
    setSessionCookie(event, session.id)

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
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

    console.error('Registration error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})