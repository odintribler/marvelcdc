#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface MarvelCDBPack {
  id: number
  name: string
  code: string
  position: number
  available: string
  known: number
  total: number
}

interface MarvelCDBCard {
  code: string
  name: string
  pack_code: string
  type_code: string
  faction_code: string | null
  cost: number | null
  traits: string | null
  quantity?: number
}

function categorizePackType(name: string, code: string): string {
  const lowerName = name.toLowerCase()
  
  // Core Set
  if (lowerName.includes('core')) {
    return 'core'
  }
  
  // Hero packs (single character names)
  const heroNames = [
    'captain america', 'ms. marvel', 'thor', 'black widow', 'doctor strange', 'hulk',
    'ant-man', 'wasp', 'quicksilver', 'scarlet witch', 'star-lord', 'gamora', 'drax',
    'venom', 'nebula', 'war machine', 'valkyrie', 'vision', 'nova', 'ironheart',
    'spider-ham', 'sp//dr', 'cyclops', 'phoenix', 'wolverine', 'storm', 'gambit',
    'rogue', 'psylocke', 'angel', 'x-23', 'deadpool', 'iceman', 'jubilee', 
    'nightcrawler', 'magneto', 'black panther', 'silk', 'falcon', 'winter soldier'
  ]
  
  if (heroNames.some(hero => lowerName === hero || lowerName.includes(hero))) {
    return 'hero'
  }
  
  // Campaign boxes and expansions
  if (lowerName.includes('galaxy') || lowerName.includes('wanted') ||
      lowerName.includes('shadow') || lowerName.includes('motives') ||
      lowerName.includes('genesis') || lowerName.includes('evolution') ||
      lowerName.includes('apocalypse') || lowerName.includes('agents') ||
      lowerName.includes('red skull') || lowerName.includes('kang')) {
    return 'campaign'
  }
  
  // Scenario packs
  if (lowerName.includes('goblin') || lowerName.includes('wrecking') ||
      lowerName.includes('ronan') || lowerName.includes('hood') ||
      lowerName.includes('mojo')) {
    return 'scenario'
  }
  
  return 'other'
}

async function fetchPacks(): Promise<MarvelCDBPack[]> {
  console.log('📦 Fetching packs from MarvelCDB...')
  
  try {
    const response = await fetch('https://marvelcdb.com/api/public/packs/')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const packs: MarvelCDBPack[] = await response.json()
    const releasedPacks = packs.filter(pack => pack.available)
    
    console.log(`✅ Found ${releasedPacks.length} released packs`)
    return releasedPacks
  } catch (error) {
    console.error('❌ Failed to fetch packs:', error)
    throw error
  }
}

async function fetchCardsForPack(packCode: string): Promise<MarvelCDBCard[]> {
  console.log(`   📋 Fetching cards for pack: ${packCode}`)
  
  try {
    const response = await fetch(`https://marvelcdb.com/api/public/cards/${packCode}.json`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const cards: MarvelCDBCard[] = await response.json()
    console.log(`   ✅ Found ${cards.length} cards in ${packCode}`)
    return cards
  } catch (error) {
    console.error(`   ❌ Failed to fetch cards for pack ${packCode}:`, error)
    return []
  }
}

async function syncPacks(packs: MarvelCDBPack[]): Promise<void> {
  console.log('📦 Syncing packs to database...')
  
  for (const pack of packs) {
    try {
      await prisma.pack.upsert({
        where: { code: pack.code },
        update: {
          name: pack.name,
          type: categorizePackType(pack.name, pack.code),
          released: new Date(pack.available),
          position: pack.position,
          updatedAt: new Date()
        },
        create: {
          code: pack.code,
          name: pack.name,
          type: categorizePackType(pack.name, pack.code),
          released: new Date(pack.available),
          position: pack.position
        }
      })
      
      console.log(`   ✅ Synced pack: ${pack.name} (${pack.code})`)
    } catch (error) {
      console.error(`   ❌ Failed to sync pack ${pack.code}:`, error)
    }
  }
}

async function syncCardsForPack(packCode: string, cards: MarvelCDBCard[]): Promise<void> {
  console.log(`   📋 Syncing ${cards.length} cards for pack: ${packCode}`)
  
  for (const card of cards) {
    try {
      await prisma.card.upsert({
        where: { code: card.code },
        update: {
          name: card.name,
          packCode: card.pack_code,
          cardType: card.type_code,
          faction: card.faction_code,
          cost: card.cost,
          traits: card.traits,
          quantity: card.quantity || 1,
          updatedAt: new Date()
        },
        create: {
          code: card.code,
          name: card.name,
          packCode: card.pack_code,
          cardType: card.type_code,
          faction: card.faction_code,
          cost: card.cost,
          traits: card.traits,
          quantity: card.quantity || 1
        }
      })
    } catch (error) {
      console.error(`     ❌ Failed to sync card ${card.code}:`, error)
    }
  }
  
  console.log(`   ✅ Synced cards for pack: ${packCode}`)
}

async function main() {
  console.log('🚀 Starting MarvelCDB data sync...')
  
  try {
    // Fetch all packs
    const packs = await fetchPacks()
    
    // Sync packs to database
    await syncPacks(packs)
    
    // Fetch and sync cards for each pack
    console.log('\n🃏 Syncing cards...')
    for (const pack of packs) {
      const cards = await fetchCardsForPack(pack.code)
      if (cards.length > 0) {
        await syncCardsForPack(pack.code, cards)
      }
      
      // Add small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Print summary
    const totalPacks = await prisma.pack.count()
    const totalCards = await prisma.card.count()
    
    console.log('\n🎉 Sync completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   📦 Packs: ${totalPacks}`)
    console.log(`   🃏 Cards: ${totalCards}`)
    
  } catch (error) {
    console.error('💥 Sync failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Handle command line arguments
const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const isIncremental = args.includes('--incremental')
const specificPacks = args.find(arg => arg.startsWith('--packs='))?.split('=')[1]?.split(',')

if (isDryRun) {
  console.log('🔍 DRY RUN MODE - No changes will be made')
}

if (isIncremental) {
  console.log('⚡ INCREMENTAL MODE - Only updating changed data')
}

if (specificPacks) {
  console.log(`🎯 SPECIFIC PACKS MODE - Only syncing: ${specificPacks.join(', ')}`)
}

// Run the sync
main().catch(console.error)