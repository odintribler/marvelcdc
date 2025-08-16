import prisma from '../utils/db'
import { requireAuth } from '../utils/auth'
import { z } from 'zod'

const updateCollectionSchema = z.object({
  updates: z.array(z.object({
    packCode: z.string(),
    quantity: z.number().min(0).max(10)
  }))
})

// Pack validation is now done against the database Pack table

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await requireAuth(event)
    const body = await readBody(event)
    const { updates } = updateCollectionSchema.parse(body)

    // Process each update
    for (const update of updates) {
      // Verify pack exists in database
      const pack = await prisma.pack.findUnique({
        where: { code: update.packCode }
      })
      
      if (!pack) {
        throw createError({
          statusCode: 400,
          statusMessage: `Unknown pack code: ${update.packCode}`
        })
      }

      if (update.quantity === 0) {
        // Remove pack if quantity is 0
        await prisma.collection.deleteMany({
          where: {
            userId,
            packCode: update.packCode
          }
        })
      } else {
        // Update or create pack entry
        await prisma.collection.upsert({
          where: {
            userId_packCode: {
              userId,
              packCode: update.packCode
            }
          },
          update: {
            quantity: update.quantity
          },
          create: {
            userId,
            packCode: update.packCode,
            quantity: update.quantity
          }
        })
      }
    }

    // Return updated collection
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

    if (error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid update data'
      })
    }

    console.error('Collection update error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update collection'
    })
  }
})