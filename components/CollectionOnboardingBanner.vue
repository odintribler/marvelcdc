<template>
  <div class="mb-6">
    <!-- Onboarding Banner -->
    <div class="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg shadow-sm">
      <div class="px-6 py-4">
        <!-- Header -->
        <div class="flex items-start justify-between">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-lg font-medium text-gray-900">
                Set Up Your Collection
              </h3>
              <p class="text-sm text-gray-600 mt-1">
                Track your physical Marvel Champions packs to see which decks you can build and detect conflicts.
              </p>
            </div>
          </div>
          <div class="flex-shrink-0">
            <button
              @click="dismissBanner"
              class="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="mt-4">
          <p class="text-sm text-gray-700 mb-3">Choose the option that best matches your collection:</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Core Set + Some Heroes -->
            <button
              @click="setupCoreAndHeroes"
              class="flex items-center p-3 text-left bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">Core + Heroes</p>
                <p class="text-xs text-gray-600">Core set + some hero packs</p>
              </div>
            </button>

            <!-- Most Packs -->
            <button
              @click="setupMostPacks"
              class="flex items-center p-3 text-left bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            >
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">Most Packs</p>
                <p class="text-xs text-gray-600">I own almost everything</p>
              </div>
            </button>

            <!-- Just Starting -->
            <button
              @click="setupJustStarting"
              class="flex items-center p-3 text-left bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">Just Starting</p>
                <p class="text-xs text-gray-600">Core set only</p>
              </div>
            </button>

            <!-- Manual Selection -->
            <button
              @click="setupManual"
              class="flex items-center p-3 text-left bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">Manual Setup</p>
                <p class="text-xs text-gray-600">I'll choose myself</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Progress indicator (shown after initial setup) -->
        <div v-if="showProgress && !isDismissed" class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600">Collection Progress</span>
            <span class="font-medium text-gray-900">{{ ownedPacksCount }} of {{ totalAvailablePacks }} packs</span>
          </div>
          <div class="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const collectionStore = useCollectionStore()

// Props
interface Props {
  forceDismissed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  forceDismissed: false
})

// Local state
const isDismissed = ref(false)
const hasUserInteracted = ref(false)

// Computed properties
const ownedPacksCount = computed(() => collectionStore.ownedPacks.length)
const totalAvailablePacks = computed(() => collectionStore.availablePacks.length)
const isCollectionEmpty = computed(() => ownedPacksCount.value === 0)
const showProgress = computed(() => hasUserInteracted.value && ownedPacksCount.value > 0)

const progressPercentage = computed(() => {
  if (totalAvailablePacks.value === 0) return 0
  return Math.round((ownedPacksCount.value / totalAvailablePacks.value) * 100)
})

const shouldShowBanner = computed(() => {
  // Don't show if forcibly dismissed by parent
  if (props.forceDismissed) return false
  
  // Don't show if user dismissed it
  if (isDismissed.value) return false
  
  // Show if collection is empty and user hasn't interacted yet
  if (isCollectionEmpty.value && !hasUserInteracted.value) return true
  
  // Show progress tracker if user has interacted but collection is still small
  if (hasUserInteracted.value && ownedPacksCount.value > 0 && ownedPacksCount.value < 5) return true
  
  return false
})

// Methods
const dismissBanner = () => {
  isDismissed.value = true
}

const markUserInteraction = () => {
  hasUserInteracted.value = true
}

const setupCoreAndHeroes = async () => {
  markUserInteraction()
  
  // Get core sets and first few hero packs
  const corePacks = collectionStore.availablePacks.filter(pack => pack.type === 'core')
  const heroPacks = collectionStore.availablePacks.filter(pack => pack.type === 'hero').slice(0, 3)
  
  const updates = [
    ...corePacks.map(pack => ({ packCode: pack.code, quantity: 1 })),
    ...heroPacks.map(pack => ({ packCode: pack.code, quantity: 1 }))
  ]
  
  await collectionStore.updateCollection(updates)
}

const setupMostPacks = async () => {
  markUserInteraction()
  
  // Add one of each pack except scenario packs
  const packsToAdd = collectionStore.availablePacks.filter(pack => pack.type !== 'scenario')
  
  const updates = packsToAdd.map(pack => ({ packCode: pack.code, quantity: 1 }))
  
  await collectionStore.updateCollection(updates)
}

const setupJustStarting = async () => {
  markUserInteraction()
  
  // Add only core sets
  const corePacks = collectionStore.availablePacks.filter(pack => pack.type === 'core')
  
  const updates = corePacks.map(pack => ({ packCode: pack.code, quantity: 1 }))
  
  await collectionStore.updateCollection(updates)
}

const setupManual = () => {
  markUserInteraction()
  dismissBanner()
}

// Watch for collection changes to auto-dismiss when user has a substantial collection
watch(ownedPacksCount, (newCount) => {
  if (newCount >= 5 && hasUserInteracted.value) {
    // Auto-dismiss after 5 seconds when user has 5+ packs
    setTimeout(() => {
      if (ownedPacksCount.value >= 5) {
        isDismissed.value = true
      }
    }, 5000)
  }
})
</script>