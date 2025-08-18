<template>
  <div class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
    <!-- Deck header -->
    <div class="p-4 sm:p-6 pb-4">
      <div class="flex items-start space-x-3 sm:space-x-4 mb-3">
        <!-- Hero thumbnail -->
        <div class="flex-shrink-0">
          <img 
            :src="heroImageUrl" 
            :alt="deck.heroName"
            class="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200 shadow-sm"
            @error="onImageError"
          />
        </div>
        
        <!-- Deck info -->
        <div class="flex-1 min-w-0">
          <h4 class="text-base sm:text-lg font-semibold text-gray-900 mb-2 leading-tight">
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
          <div class="flex items-center space-x-2 mb-2 flex-wrap gap-1">
            <span class="inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
              {{ deck.heroName }}
            </span>
            <span v-if="deck.isActive" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
            <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              Inactive
            </span>
          </div>
        </div>
        
        <!-- Status indicator -->
        <div class="flex items-center space-x-2 hidden sm:flex">
          <span
            :class="[
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
              {
                'bg-green-100 text-green-800': !hasConflicts && deck.isActive,
                'bg-yellow-100 text-yellow-800': hasConflicts && deck.isActive,
                'bg-gray-100 text-gray-600': !deck.isActive
              }
            ]"
          >
            {{ getStatusText() }}
          </span>
        </div>
      </div>

      <!-- Tags and metadata -->
      <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
        <div class="flex items-center space-x-4">
          <span>{{ totalCards }} cards</span>
          <span v-if="hasConflicts" class="text-yellow-600 font-medium">
            {{ conflictCount }} conflict{{ conflictCount !== 1 ? 's' : '' }}
          </span>
        </div>
        <!-- Show status on mobile -->
        <div class="sm:hidden">
          <span
            :class="[
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              {
                'bg-green-100 text-green-800': !hasConflicts && deck.isActive,
                'bg-yellow-100 text-yellow-800': hasConflicts && deck.isActive,
                'bg-gray-100 text-gray-600': !deck.isActive
              }
            ]"
          >
            {{ getStatusText() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Action buttons bar -->
    <div class="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
      <!-- Mobile layout: Stack buttons vertically -->
      <div class="sm:hidden space-y-2">
        <div class="flex items-center space-x-2">
          <button
            @click="toggleExpanded"
            class="flex-1 inline-flex items-center justify-center py-2 px-3 text-sm text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 rounded-md bg-white"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {{ isExpanded ? 'Hide Cards' : 'View Cards' }}
          </button>
          
          <button
            v-if="hasConflicts"
            @click="showConflicts"
            class="flex-1 inline-flex items-center justify-center py-2 px-3 text-sm text-yellow-600 hover:text-yellow-700 transition-colors border border-yellow-300 rounded-md bg-white"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Conflicts
          </button>
        </div>
        
        <!-- Toggle active/inactive - full width on mobile -->
        <button
          @click="toggleActive"
          class="w-full inline-flex items-center justify-center py-3 px-4 text-sm font-medium rounded-md transition-colors"
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
      </div>

      <!-- Desktop layout: Horizontal -->
      <div class="hidden sm:flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="toggleExpanded"
            class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            {{ isExpanded ? 'Hide Cards' : 'View Cards' }}
          </button>
          
          <button
            v-if="hasConflicts"
            @click="showConflicts"
            class="inline-flex items-center text-sm text-yellow-600 hover:text-yellow-700 transition-colors"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            View Conflicts
          </button>
        </div>
        
        <!-- Toggle active/inactive -->
        <button
          @click="toggleActive"
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
      </div>
    </div>

    <!-- Expandable card list -->
    <div v-if="isExpanded" class="border-t border-gray-200 bg-gray-50">
      <div class="px-4 sm:px-6 py-4">
        <h5 class="text-sm font-medium text-gray-900 mb-3">Deck Cards ({{ totalCards }})</h5>
        <div class="max-h-64 overflow-y-auto space-y-2">
          <div
            v-for="card in deck.deckCards"
            :key="card.id"
            class="flex justify-between items-start sm:items-center py-2 px-3 rounded-md transition-colors"
            :class="getCardConflictClass(card)"
          >
            <div class="flex items-start sm:items-center flex-1 min-w-0">
              <div class="flex-1 min-w-0">
                <span class="font-medium text-gray-900 text-sm block truncate">{{ card.cardName }}</span>
                <div class="flex items-center space-x-2 mt-1 sm:mt-0 sm:inline">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    ×{{ card.quantity }}
                  </span>
                  <span v-if="card.cardType" class="text-xs text-gray-500 capitalize">
                    {{ card.cardType }}
                  </span>
                </div>
              </div>
            </div>
            <div v-if="getCardConflict(card)" class="flex items-center ml-2 flex-shrink-0">
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span class="hidden sm:inline">{{ getCardConflict(card) }}</span>
                <span class="sm:hidden">!</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface DeckCardData {
  id: number
  deckId: number
  cardCode: string
  cardName: string
  quantity: number
  cardType: string
  packCode: string
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
const emit = defineEmits(['toggle-active', 'show-conflicts'])

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
</script>