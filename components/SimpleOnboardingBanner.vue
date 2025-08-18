<template>
  <div v-if="!isDismissed" class="mb-6">
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
            <!-- Just Starting -->
            <button
              @click="quickAction('just-starting')"
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
                <p class="text-xs text-gray-600">Core + Heroes packs</p>
              </div>
            </button>

            <!-- Mostly Campaigns -->
            <button
              @click="quickAction('mostly-campaigns')"
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
                <p class="text-sm font-medium text-gray-900">Mostly Campaigns</p>
                <p class="text-xs text-gray-600">Core + campaign boxes</p>
              </div>
            </button>

            <!-- Full Collection -->
            <button
              @click="quickAction('full-collection')"
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
                <p class="text-sm font-medium text-gray-900">Full Collection</p>
                <p class="text-xs text-gray-600">One of each pack</p>
              </div>
            </button>

            <!-- Manual Setup -->
            <button
              @click="quickAction('manual')"
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const collectionStore = useCollectionStore()

// Simple local state
const isDismissed = ref(false)

// Methods
const dismissBanner = () => {
  isDismissed.value = true
}

const scrollToSection = (sectionType: string) => {
  // Scroll to the relevant pack section
  const sectionMap = {
    'core': 'Core Set',
    'hero': 'Hero Packs', 
    'campaign': 'Campaign Boxes'
  }
  
  const targetText = sectionMap[sectionType as keyof typeof sectionMap]
  if (targetText) {
    // Find element containing the target text
    const elements = document.querySelectorAll('h4')
    for (const element of elements) {
      if (element.textContent?.includes(targetText)) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
      }
    }
  }
}

const quickAction = async (actionType: string) => {
  console.log('Quick action selected:', actionType)
  
  try {
    let updates: { packCode: string; quantity: number }[] = []
    let scrollTarget = ''

    switch (actionType) {
      case 'just-starting':
        // Add one Core Set only
        const corePacks = collectionStore.availablePacks.filter(pack => pack.type === 'core')
        updates = corePacks.map(pack => ({ packCode: pack.code, quantity: 1 }))
        scrollTarget = 'hero'
        break
        
      case 'mostly-campaigns':
        // Add one Core Set + all campaign boxes
        const corePacksForCampaigns = collectionStore.availablePacks.filter(pack => pack.type === 'core')
        const campaignPacks = collectionStore.availablePacks.filter(pack => pack.type === 'campaign')
        updates = [
          ...corePacksForCampaigns.map(pack => ({ packCode: pack.code, quantity: 1 })),
          ...campaignPacks.map(pack => ({ packCode: pack.code, quantity: 1 }))
        ]
        scrollTarget = 'campaign'
        break
        
      case 'full-collection':
        // Add one of each pack
        updates = collectionStore.availablePacks.map(pack => ({ packCode: pack.code, quantity: 1 }))
        scrollTarget = 'core'
        break
        
      case 'manual':
        // Just dismiss the banner
        dismissBanner()
        return
    }

    if (updates.length > 0) {
      await collectionStore.updateCollection(updates)
      
      // Wait a moment for the DOM to update, then scroll
      setTimeout(() => {
        scrollToSection(scrollTarget)
      }, 500)
    }
    
    dismissBanner()
  } catch (error) {
    console.error('Failed to setup collection:', error)
    // Don't dismiss banner on error so user can try again
  }
}
</script>