import prisma from '../utils/db'
import { requireAuth } from '../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await requireAuth(event)

    // Fetch user's collection from database with pack information
    const collection = await prisma.collection.findMany({
      where: { userId },
      include: {
        pack: true
      },
      orderBy: { 
        pack: {
          name: 'asc'
        }
      }
    })

    return {
      success: true,
      data: {
        collection: collection.map(item => ({
          id: item.id,
          packCode: item.packCode,
          packName: item.pack.name,
          quantity: item.quantity
        }))
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    console.error('Collection fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch collection'
    })
  }
})