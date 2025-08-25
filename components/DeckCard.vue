<template>
  <div class="relative cursor-pointer" :style="'aspect-ratio: 66/91; perspective: 1000px;'" @click="toggleExpanded">
    <!-- Card container with flip animation -->
    <div 
      class="flip-card-inner w-full h-full transition-transform duration-700 transform-style-preserve-3d" 
      :class="{ 'flip-card-flipped': isExpanded }"
    >
      <!-- Front of card -->
      <div class="flip-card-face flip-card-front bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div class="flex flex-col h-full">
      <!-- Deck header -->
      <div class="p-4 sm:p-6 pb-4 flex-1">
      <div class="flex items-start space-x-3 sm:space-x-4 mb-3">
        <!-- Hero thumbnail -->
        <div class="flex-shrink-0">
          <img 
            :src="heroImageUrl" 
            :alt="deck.heroName"
            class="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200 shadow-sm"
            :class="!deck.isActive ? 'opacity-50' : ''"
            @error="onImageError"
          />
        </div>
        
        <!-- Deck info -->
        <div class="flex-1 min-w-0">
          <h4 class="text-base sm:text-lg font-semibold text-gray-900 mb-2 leading-tight" :class="!deck.isActive ? 'opacity-70' : ''">
            <a 
              v-if="deck.deckUrl" 
              :href="deck.deckUrl" 
              target="_blank" 
              rel="noopener noreferrer"
              class="hover:text-red-600 transition-colors"
            >
              {{ deck.name }}
            </a>
            <span v-else class="text-gray-900">{{ deck.name }}</span>
          </h4>
        </div>
        
        <!-- Flip button -->
        <div class="flex items-center">
          <button
            @click.stop="toggleExpanded"
            class="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Conflicts section or Ready/Deactivated stamp -->
      <div v-if="hasConflicts" class="bg-yellow-50 border border-yellow-200 rounded px-2 py-2 mb-4">
        <h6 class="font-bold text-yellow-800 text-xs uppercase tracking-wider mb-1">Conflicts</h6>
        <div :class="props.conflicts && props.conflicts.length > 4 ? 'grid grid-cols-2 gap-x-3' : 'space-y-0'">
          <div v-for="conflict in props.conflicts" :key="conflict.cardName" class="flex">
            <span class="w-3 text-right mr-1 font-medium text-xs text-yellow-800">{{ conflict.conflictQuantity }}×</span>
            <span class="flex-1 text-yellow-800 text-xs leading-none">{{ conflict.cardName }}</span>
          </div>
        </div>
      </div>
      <div v-else class="mb-4 mt-8 flex justify-center items-center py-8">
        <div class="ready-stamp" :class="deck.isActive ? '' : 'deactivated-stamp'">
          {{ deck.isActive ? 'Ready for play' : 'Deactivated' }}
        </div>
      </div>
    </div>

    <!-- Action buttons bar -->
    <div class="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200" @click.stop>
      <!-- Mobile layout: Stack buttons vertically -->
      <div class="sm:hidden space-y-2">
        <div class="flex items-center">
          <button
            v-if="hasConflicts"
            @click.stop="showConflicts"
            class="w-full inline-flex items-center justify-center py-2 px-3 text-sm text-yellow-600 hover:text-yellow-700 transition-colors border border-yellow-300 rounded-md bg-white"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Conflicts
          </button>
        </div>
        
        <!-- Toggle active/inactive and delete - mobile -->
        <div class="flex items-center space-x-2">
          <button
            @click.stop="toggleActive"
            class="flex-1 inline-flex items-center justify-center py-3 px-4 text-sm font-medium rounded-md transition-colors"
            :class="deck.isActive 
              ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200' 
              : 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'"
          >
            <svg v-if="deck.isActive" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-4V8a4 4 0 118 0v2M9 21v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            {{ deck.isActive ? 'Deactivate' : 'Activate' }}
          </button>
          
          <!-- Delete button for inactive decks - mobile -->
          <button
            v-if="!deck.isActive"
            @click.stop="deleteDeck"
            class="inline-flex items-center p-3 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md border border-red-200 transition-colors"
            title="Delete deck"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Desktop layout: Horizontal -->
      <div class="hidden sm:flex items-center justify-between">
        <div class="flex items-center">
          <button
            v-if="hasConflicts"
            @click.stop="showConflicts"
            class="inline-flex items-center text-sm text-yellow-600 hover:text-yellow-700 transition-colors"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            View Conflicts
          </button>
        </div>
        
        <div class="flex items-center space-x-2">
          <!-- Toggle active/inactive -->
          <button
            @click.stop="toggleActive"
            class="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
            :class="deck.isActive 
              ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200' 
              : 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'"
          >
            <svg v-if="deck.isActive" class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-5-4V8a4 4 0 118 0v2M9 21v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
            {{ deck.isActive ? 'Deactivate' : 'Activate' }}
          </button>
          
          <!-- Delete button for inactive decks -->
          <button
            v-if="!deck.isActive"
            @click.stop="deleteDeck"
            class="inline-flex items-center p-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
            title="Delete deck"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
        </div>
      </div>

      <!-- Back of card (card list) -->
      <div class="flip-card-face flip-card-back bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div class="h-full flex flex-col" :class="!deck.isActive ? 'opacity-50' : ''">
          <!-- Header with hero identity -->
          <div class="px-3 py-2 text-white relative" :class="aspectHeaderColor">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h4 class="text-sm font-bold">{{ deck.heroName }}</h4>
                <p class="text-xs opacity-90">{{ deck.name }}</p>
              </div>
              <button
                @click.stop="toggleExpanded"
                class="text-white transition-colors"
                :class="aspectHoverColor"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Card list in two-column format -->
          <div class="flex-1 px-2 py-1 overflow-hidden">
            <div class="grid grid-cols-2 gap-x-3 h-full text-xs leading-tight">
              <!-- Left column -->
              <div class="space-y-0">
                <template v-for="(item, index) in columnLayout.leftColumn" :key="`left-${index}`">
                  <h6 v-if="item.type === 'heroHeader'" class="font-bold text-gray-800 text-xs uppercase tracking-wider" :class="index > 0 ? 'pt-2' : ''">Hero ({{ item.count }})</h6>
                  <h6 v-else-if="item.type === 'aspectHeader'" class="font-bold text-gray-800 text-xs uppercase tracking-wider pt-2">{{ item.aspectGroup.name }} ({{ item.aspectGroup.count }})</h6>
                  <h6 v-else-if="item.type === 'basicHeader'" class="font-bold text-gray-800 text-xs uppercase tracking-wider pt-2">Basic ({{ item.count }})</h6>
                  <div v-else class="flex">
                    <span class="w-3 text-right mr-1 font-medium text-xs">{{ item.card.quantity }}×</span>
                    <span class="flex-1 text-gray-800 text-xs leading-none">{{ item.card.cardName }}</span>
                  </div>
                </template>
              </div>

              <!-- Right column -->
              <div class="space-y-0">
                <template v-for="(item, index) in columnLayout.rightColumn" :key="`right-${index}`">
                  <h6 v-if="item.type === 'heroHeader'" class="font-bold text-gray-800 text-xs uppercase tracking-wider" :class="index > 0 ? 'pt-2' : ''">Hero ({{ item.count }})</h6>
                  <h6 v-else-if="item.type === 'aspectHeader'" class="font-bold text-gray-800 text-xs uppercase tracking-wider pt-2">{{ item.aspectGroup.name }} ({{ item.aspectGroup.count }})</h6>
                  <h6 v-else-if="item.type === 'basicHeader'" class="font-bold text-gray-800 text-xs uppercase tracking-wider pt-2">Basic ({{ item.count }})</h6>
                  <div v-else class="flex">
                    <span class="w-3 text-right mr-1 font-medium text-xs">{{ item.card.quantity }}×</span>
                    <span class="flex-1 text-gray-800 text-xs leading-none">{{ item.card.cardName }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-3 py-1.5 bg-gray-100 border-t text-center">
            <span class="text-xs text-gray-600">{{ totalCards }} cards total</span>
            <span v-if="hasConflicts" class="ml-2 text-xs text-red-600 font-medium">
              • {{ conflictCount }} conflict{{ conflictCount !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flip-card-inner {
  transform-style: preserve-3d;
}

.flip-card-flipped {
  transform: rotateY(180deg);
}

.flip-card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.flip-card-front {
  z-index: 2;
  transform: rotateY(0deg);
}

.flip-card-back {
  transform: rotateY(180deg);
}

.ready-stamp {
  background: transparent;
  color: #065f46;
  padding: 12px 32px;
  font-weight: 900;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 2px;
  transform: rotate(-35deg);
  border-top: 4px solid #065f46;
  border-bottom: 4px solid #065f46;
  border-left: none;
  border-right: none;
}

.deactivated-stamp {
  color: #6b7280;
  border-top-color: #6b7280;
  border-bottom-color: #6b7280;
  opacity: 0.5;
}
</style>

<script setup lang="ts">
import { sortCardsByFaction, getFactionColorClasses } from '~/utils/cardSorting'

interface DeckCardData {
  id: number
  deckId: number
  cardCode: string
  cardName: string
  quantity: number
  cardType: string
  packCode: string
  faction: string | null
}

interface DeckData {
  id: number
  name: string
  heroCode: string
  heroName: string
  isActive: boolean
  deckUrl?: string
  deckCards: DeckCardData[]
}

interface Props {
  deck: DeckData
  conflicts?: any[]
}

const props = defineProps<Props>()
const emit = defineEmits(['toggle-active', 'show-conflicts', 'delete-deck'])

const isExpanded = ref(false)

const totalCards = computed(() => {
  return props.deck.deckCards?.reduce((sum, card) => sum + card.quantity, 0) || 0
})

const hasConflicts = computed(() => {
  return props.conflicts && props.conflicts.length > 0
})

const conflictCount = computed(() => {
  return props.conflicts?.length || 0
})

const heroImageUrl = computed(() => {
  return `https://marvelcdb.com/bundles/cards/${props.deck.heroCode}.png`
})

const sortedCardGroups = computed(() => {
  if (!props.deck.deckCards || props.deck.deckCards.length === 0) {
    return []
  }
  return sortCardsByFaction(props.deck.deckCards, props.deck.heroCode)
})

const getStatusText = () => {
  if (!props.deck.isActive) return 'Inactive'
  if (hasConflicts.value) return 'Conflicts'
  return 'Ready'
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const toggleActive = () => {
  emit('toggle-active', props.deck.id, !props.deck.isActive)
}

const showConflicts = () => {
  emit('show-conflicts', props.deck.id)
}

const deleteDeck = () => {
  emit('delete-deck', props.deck.id)
}

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  // Fallback to a placeholder or hide the image
  target.style.display = 'none'
}

const getCardConflict = (card: DeckCardData) => {
  const conflict = props.conflicts?.find(c => 
    c.cardCodes?.includes(card.cardCode) || c.cardName === card.cardName
  )
  return conflict ? `Need ${conflict.conflictQuantity} more` : null
}

const getCardConflictClass = (card: DeckCardData) => {
  return getCardConflict(card) ? 'bg-yellow-50 border border-yellow-200' : 'bg-white border border-gray-100'
}

const getFactionDotClass = (faction: string | null) => {
  const dotClasses: { [key: string]: string } = {
    aggression: 'bg-red-500',
    justice: 'bg-yellow-500',
    leadership: 'bg-blue-500',
    protection: 'bg-green-500',
    basic: 'bg-gray-500',
    hero: 'bg-purple-500'
  }
  
  if (!faction) return dotClasses.hero
  return dotClasses[faction] || dotClasses.basic
}

const getCardConflictQuantity = (card: DeckCardData) => {
  const conflict = props.conflicts?.find(c => 
    c.cardCodes?.includes(card.cardCode) || c.cardName === card.cardName
  )
  return conflict ? conflict.conflictQuantity : 0
}

// Card type sorting priority for organization within each faction
const getCardTypePriority = (cardType: string | null | undefined): number => {
  const typePriority: { [key: string]: number } = {
    'hero': 0,
    'ally': 1,
    'event': 2,
    'resource': 3,
    'player side-scheme': 4,
    'side-scheme': 4, // Alternative naming
    'support': 5,
    'upgrade': 6,
    'basic': 7
  }
  
  const type = cardType?.toLowerCase() || 'basic'
  return typePriority[type] ?? 8
}

// Sort cards by type within faction, then alphabetically
const sortCardsByType = (cards: DeckCardData[]): DeckCardData[] => {
  return cards.sort((a, b) => {
    const typePriorityA = getCardTypePriority(a.cardType)
    const typePriorityB = getCardTypePriority(b.cardType)
    
    if (typePriorityA !== typePriorityB) {
      return typePriorityA - typePriorityB
    }
    
    // Same type, sort alphabetically by name
    return a.cardName.localeCompare(b.cardName)
  })
}

// Group cards by faction (Hero/Aspect/Basic) like physical deck cards
const heroCards = computed(() => {
  const cards = props.deck.deckCards?.filter(card => 
    card.faction === 'hero'
  ) || []
  return sortCardsByType(cards)
})

// Group cards by individual aspects for multi-aspect support
const aspectCardGroups = computed(() => {
  const cards = props.deck.deckCards?.filter(card => 
    card.faction && ['aggression', 'justice', 'leadership', 'protection'].includes(card.faction.toLowerCase())
  ) || []
  
  // Group by faction
  const groups: { [key: string]: DeckCardData[] } = {}
  cards.forEach(card => {
    const faction = card.faction!.toLowerCase()
    if (!groups[faction]) {
      groups[faction] = []
    }
    groups[faction].push(card)
  })
  
  // Sort each group and return as array of aspect groups
  return Object.entries(groups).map(([faction, cards]) => ({
    faction,
    name: faction.charAt(0).toUpperCase() + faction.slice(1),
    cards: sortCardsByType(cards),
    count: cards.reduce((sum, card) => sum + card.quantity, 0)
  }))
})

const basicCards = computed(() => {
  const cards = props.deck.deckCards?.filter(card => 
    card.faction === 'basic' || card.faction === null || card.faction === ''
  ) || []
  return sortCardsByType(cards)
})

// Get all aspects in the deck
const deckAspects = computed(() => {
  return aspectCardGroups.value.map(group => group.faction)
})

// Determine primary aspect (first one) for header color
const primaryAspect = computed(() => {
  return deckAspects.value[0] || null
})

// Get aspect color for header (uses primary aspect for multi-aspect decks)
const aspectHeaderColor = computed(() => {
  if (primaryAspect.value) {
    switch (primaryAspect.value) {
      case 'aggression':
        return 'bg-red-600'
      case 'leadership':
        return 'bg-blue-600'
      case 'protection':
        return 'bg-green-600'
      case 'justice':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-600' // Unknown aspect
    }
  }
  return 'bg-gray-600' // No aspect (like Domini "All Action" deck)
})

// Get aspect hover color for button (uses primary aspect for multi-aspect decks)
const aspectHoverColor = computed(() => {
  if (primaryAspect.value) {
    switch (primaryAspect.value) {
      case 'aggression':
        return 'hover:text-red-200'
      case 'leadership':
        return 'hover:text-blue-200'
      case 'protection':
        return 'hover:text-green-200'
      case 'justice':
        return 'hover:text-yellow-200'
      default:
        return 'hover:text-gray-200' // Unknown aspect
    }
  }
  return 'hover:text-gray-200' // No aspect (like Domini "All Action" deck)
})

// Card counts by faction
const heroCount = computed(() => heroCards.value.reduce((sum, card) => sum + card.quantity, 0))
const totalAspectCount = computed(() => aspectCardGroups.value.reduce((sum, group) => sum + group.count, 0))
const basicCount = computed(() => basicCards.value.reduce((sum, card) => sum + card.quantity, 0))

// Dynamic two-column layout based on line count
const columnLayout = computed(() => {
  const maxLinesPerColumn = 18
  let currentLine = 0
  const leftColumn = []
  const rightColumn = []
  let isRightColumn = false
  
  // Helper to add content to current column
  const addToCurrentColumn = (content) => {
    const isHeader = content.type.includes('Header')
    
    // If we're at the line limit and this is a header, switch to right column first
    if (!isRightColumn && currentLine >= maxLinesPerColumn && isHeader) {
      isRightColumn = true
    }
    
    if (isRightColumn) {
      rightColumn.push(content)
    } else {
      leftColumn.push(content)
      // Check if we should switch to right column after adding this item
      if (currentLine >= maxLinesPerColumn) {
        isRightColumn = true
      }
    }
  }
  
  // Add hero cards
  if (heroCards.value.length > 0) {
    currentLine++ // Header line
    addToCurrentColumn({ type: 'heroHeader', count: heroCount.value })
    
    heroCards.value.forEach(card => {
      currentLine++ // Card line
      addToCurrentColumn({ type: 'heroCard', card })
    })
  }
  
  // Add aspect groups
  aspectCardGroups.value.forEach(aspectGroup => {
    currentLine++ // Header line
    addToCurrentColumn({ type: 'aspectHeader', aspectGroup })
    
    aspectGroup.cards.forEach(card => {
      currentLine++ // Card line
      addToCurrentColumn({ type: 'aspectCard', card })
    })
  })
  
  // Add basic cards
  if (basicCards.value.length > 0) {
    currentLine++ // Header line
    addToCurrentColumn({ type: 'basicHeader', count: basicCount.value })
    
    basicCards.value.forEach(card => {
      currentLine++ // Card line
      addToCurrentColumn({ type: 'basicCard', card })
    })
  }
  
  return { leftColumn, rightColumn }
})
</script>