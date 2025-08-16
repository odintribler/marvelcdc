import prisma from '../utils/db'

export default defineEventHandler(async (event) => {
  try {
    // Fetch all packs from local database, ordered by release date
    const packs = await prisma.pack.findMany({
      orderBy: {
        released: 'asc'
      }
    })
    
    // Transform to format expected by collection store
    const transformedPacks = packs.map(pack => ({
      code: pack.code,
      name: pack.name,
      type: pack.type,
      released: pack.released.toISOString().split('T')[0] // Convert to YYYY-MM-DD format
    }))

    return {
      success: true,
      data: {
        packs: transformedPacks
      }
    }
  } catch (error: any) {
    console.error('Failed to fetch packs:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch packs from database'
    })
  }
})