import { requireAuth } from '../utils/auth'
import prisma from '../utils/db'

export default defineEventHandler(async (event) => {
  const { userId } = await requireAuth(event)

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      emailVerified: true,
      firstName: true,
      lastName: true,
      marvelcdbProfile: true,
      pendingEmail: true,
      createdAt: true,
      updatedAt: true
    }
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found'
    })
  }

  return {
    success: true,
    data: {
      profile: user
    }
  }
})