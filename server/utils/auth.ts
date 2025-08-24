import { hash, verify } from '@node-rs/argon2'
import { randomBytes } from 'crypto'
import prisma from './db'
import type { H3Event } from 'h3'

// Session configuration
const SESSION_COOKIE_NAME = 'session'
const SESSION_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

// Argon2 configuration
const ARGON2_OPTIONS = {
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4,
}

// Types
export interface User {
  id: number
  username: string
  email: string
  emailVerified: boolean
}

export interface Session {
  id: string
  userId: number
  expiresAt: Date
  user?: User
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, ARGON2_OPTIONS)
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await verify(hash, password)
  } catch {
    return false
  }
}

// Session utilities
export function generateSessionId(): string {
  // Generate a cryptographically secure random session ID
  return randomBytes(32).toString('hex')
}

export async function createSession(userId: number): Promise<Session> {
  const sessionId = generateSessionId()
  const expiresAt = new Date(Date.now() + SESSION_EXPIRES_IN)

  const session = await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  })

  return {
    id: session.id,
    userId: session.userId,
    expiresAt: session.expiresAt,
  }
}

export async function getSessionById(sessionId: string): Promise<Session | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          emailVerified: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  // Check if session is expired
  if (session.expiresAt < new Date()) {
    await deleteSession(sessionId)
    return null
  }

  return {
    id: session.id,
    userId: session.userId,
    expiresAt: session.expiresAt,
    user: session.user,
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.session.delete({
    where: { id: sessionId },
  }).catch(() => {
    // Ignore errors if session doesn't exist
  })
}

export async function deleteUserSessions(userId: number): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  })
}

// Clean up expired sessions from database
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  })
  return result.count
}

// Get session count for a user (for debugging/monitoring)
export async function getUserSessionCount(userId: number): Promise<number> {
  return await prisma.session.count({
    where: { userId }
  })
}

// Cookie utilities
export function setSessionCookie(event: H3Event, sessionId: string): void {
  setCookie(event, SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRES_IN / 1000, // Convert to seconds
    path: '/',
  })
}

export function getSessionCookie(event: H3Event): string | undefined {
  return getCookie(event, SESSION_COOKIE_NAME)
}

export function deleteSessionCookie(event: H3Event): void {
  deleteCookie(event, SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}

// Session validation with event (for API routes)
export async function validateSession(event: H3Event): Promise<{ session: Session; user: User } | null> {
  const sessionId = getSessionCookie(event)
  
  if (!sessionId) {
    return null
  }

  const session = await getSessionById(sessionId)
  
  if (!session || !session.user) {
    return null
  }

  return {
    session,
    user: session.user,
  }
}

// Session validation with session ID (for server plugins)
export async function validateSessionById(sessionId: string): Promise<{ session: Session; user: User } | null> {
  if (!sessionId) {
    return null
  }

  const session = await getSessionById(sessionId)
  
  if (!session || !session.user) {
    return null
  }

  return {
    session,
    user: session.user,
  }
}

// Require authentication (throws error if not authenticated)
export async function requireAuth(event: H3Event): Promise<{ session: Session; user: User; userId: number }> {
  const result = await validateSession(event)
  
  if (!result) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  return {
    ...result,
    userId: result.user.id,
  }
}