<template>
  <div class="bg-gradient-to-br from-blue-50 to-indigo-100 shadow-sm sm:rounded-xl mb-6 sm:mb-8 border border-blue-200">
    <div class="px-6 py-6 sm:p-8">
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-500 shadow-sm">
            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <div class="flex-1">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Set up your collection first
              </h3>
              <p class="text-sm text-gray-600 mb-4">
                Before importing decks, tell us which Marvel Champions packs you own. This helps us accurately detect conflicts between your decks and collection.
              </p>
              
              <div class="flex flex-col sm:flex-row gap-3">
                <NuxtLink 
                  to="/collection"
                  class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium text-sm rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Packs to Collection
                </NuxtLink>
                
                <button
                  @click="dismiss"
                  class="inline-flex items-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Skip for now
                </button>
              </div>
            </div>
            
            <!-- Close button -->
            <button
              @click="dismiss"
              class="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 transition-colors ml-4"
              title="Dismiss"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Additional info -->
          <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div class="flex items-start">
              <svg class="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-xs text-blue-800">
                <strong>Why add your collection?</strong> When you import decks, we'll show you exactly which cards you're missing or need more copies of across all your active decks.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  dismiss: []
}>()

const dismiss = () => {
  emit('dismiss')
}
</script>