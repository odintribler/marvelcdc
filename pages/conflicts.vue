<template>
  <div class="px-4 sm:px-0">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Card Conflicts</h1>
      <p class="mt-2 text-sm text-gray-600">
        Resolve conflicts when multiple active decks need more copies of a card than you own.
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-12">
      <svg class="animate-spin h-12 w-12 text-red-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-gray-600">Calculating conflicts...</p>
    </div>

    <!-- No conflicts -->
    <div v-else-if="conflicts.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No conflicts found!</h3>
      <p class="mt-1 text-sm text-gray-500">All your active decks can be built with your current collection.</p>
      <div class="mt-6">
        <NuxtLink to="/" class="btn-primary">
          Back to Dashboard
        </NuxtLink>
      </div>
    </div>

    <!-- Conflicts list -->
    <div v-else>
      <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">
              {{ conflicts.length }} card conflict{{ conflicts.length !== 1 ? 's' : '' }} detected
            </h3>
            <div class="mt-2 text-sm text-yellow-700">
              <p>You need more copies of these cards than you currently own. Deactivate some decks to resolve conflicts.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Conflict cards -->
      <div class="space-y-6">
        <div
          v-for="conflict in conflicts"
          :key="conflict.cardName"
          class="bg-white shadow sm:rounded-lg border border-yellow-200"
        >
          <div class="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-0">
            <!-- Card image column -->
            <div class="lg:p-6 p-4 lg:border-r border-gray-200 flex justify-center lg:justify-start">
              <div class="card-image-container">
                <img
                  :src="getCardImageUrl(conflict.cardCodes[0])"
                  :alt="conflict.cardName"
                  :class="[
                    'card-image rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200',
                    { 'rotated-card': conflict.cardType === 'player_side_scheme' }
                  ]"
                  @error="handleImageError"
                  @load="handleImageLoad"
                />
                <div
                  v-if="imageLoaded[conflict.cardCodes[0]] === false"
                  class="card-image-fallback rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-4"
                >
                  <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p class="text-sm font-medium text-gray-600">{{ conflict.cardName }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ conflict.cardCodes[0] }}</p>
                </div>
              </div>
            </div>

            <!-- Content column -->
            <div class="px-4 py-5 sm:p-6">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">{{ conflict.cardName }}</h3>
                  <p class="text-sm text-gray-500">Card Code: {{ conflict.cardCodes[0] }}</p>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-red-600">-{{ conflict.conflictQuantity }}</div>
                  <div class="text-sm text-gray-500">cards short</div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div class="bg-blue-50 p-3 rounded">
                  <div class="text-xl font-semibold text-blue-900">{{ conflict.totalNeeded }}</div>
                  <div class="text-sm text-blue-600">Total Needed</div>
                </div>
                <div class="bg-green-50 p-3 rounded">
                  <div class="text-xl font-semibold text-green-900">{{ conflict.totalOwned }}</div>
                  <div class="text-sm text-green-600">You Own</div>
                </div>
                <div class="bg-red-50 p-3 rounded">
                  <div class="text-xl font-semibold text-red-900">{{ conflict.conflictQuantity }}</div>
                  <div class="text-sm text-red-600">Missing</div>
                </div>
              </div>

              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-2">Used in these decks:</h4>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="deckName in conflict.conflictingDecks"
                    :key="deckName"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {{ deckName }}
                  </span>
                </div>
              </div>

              <!-- Quick resolve button -->
              <div class="mt-4 pt-4 border-t border-gray-200">
                <button
                  @click="showResolveModal(conflict)"
                  class="btn-secondary text-sm"
                >
                  Resolve Conflict
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bulk actions -->
      <div class="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div class="flex space-x-4">
          <button
            @click="refreshConflicts"
            :disabled="isLoading"
            class="btn-secondary"
          >
            Refresh Conflicts
          </button>
          <NuxtLink to="/" class="btn-primary">
            Back to Dashboard
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Resolve Conflict Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Resolve Conflict: {{ selectedConflict?.cardName }}
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Select which decks to deactivate to resolve this conflict. You need to free up {{ selectedConflict?.conflictQuantity }} copies.
            </p>

            <div class="space-y-2">
              <label
                v-for="deckName in selectedConflict?.conflictingDecks"
                :key="deckName"
                class="flex items-center"
              >
                <input
                  v-model="selectedDecksToDeactivate"
                  type="checkbox"
                  :value="deckName"
                  class="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span class="ml-2 text-sm text-gray-900">{{ deckName }}</span>
              </label>
            </div>
          </div>

          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="resolveConflict"
              :disabled="selectedDecksToDeactivate.length === 0 || isResolving"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {{ isResolving ? 'Resolving...' : 'Deactivate Selected' }}
            </button>
            <button
              @click="closeModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Protected by global auth middleware

const decksStore = useDecksStore()

// Local state
const showModal = ref(false)
const selectedConflict = ref(null)
const selectedDecksToDeactivate = ref([])
const isResolving = ref(false)
const imageLoaded = ref({})
const imageFormat = ref({})

// Computed
const conflicts = computed(() => decksStore.conflicts)
const isLoading = computed(() => decksStore.isLoading)

// Methods
const refreshConflicts = async () => {
  await decksStore.calculateConflicts()
}

const showResolveModal = (conflict: any) => {
  selectedConflict.value = conflict
  selectedDecksToDeactivate.value = []
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedConflict.value = null
  selectedDecksToDeactivate.value = []
}

const resolveConflict = async () => {
  if (selectedDecksToDeactivate.value.length === 0) return

  isResolving.value = true

  try {
    // Find deck IDs by names (simplified - in production you'd store IDs)
    const decksToDeactivate = decksStore.decks
      .filter(deck => selectedDecksToDeactivate.value.includes(deck.name))
      .map(deck => deck.id)

    const result = await decksStore.resolveConflicts(decksToDeactivate)

    if (result.success) {
      closeModal()
      await refreshConflicts()
    }
  } catch (error) {
    console.error('Failed to resolve conflict:', error)
  } finally {
    isResolving.value = false
  }
}

// Card image methods
const getCardImageUrl = (cardCode: string) => {
  // MarvelCDB uses lowercase card codes for images
  const lowercaseCode = cardCode.toLowerCase()
  // Try PNG first, fallback to JPG handled in error handler
  const format = imageFormat.value[lowercaseCode] || 'png'
  return `https://marvelcdb.com/bundles/cards/${lowercaseCode}.${format}`
}

const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  const src = img.src

  // Extract card code from the image src
  const match = src.match(/\/([^\/]+)\.(png|jpg)$/)
  if (match) {
    const cardCode = match[1].toLowerCase()
    imageLoaded.value[cardCode] = true
  }
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  const src = img.src

  // Extract card code and current format from the image src
  const match = src.match(/\/([^\/]+)\.(png|jpg)$/)
  if (match) {
    const cardCode = match[1].toLowerCase()
    const currentFormat = match[2]

    // If PNG failed, try JPG
    if (currentFormat === 'png') {
      imageFormat.value[cardCode] = 'jpg'
      img.src = `https://marvelcdb.com/bundles/cards/${cardCode}.jpg`
      return // Don't hide the image, let it try JPG
    }

    // If JPG also failed, mark as failed and hide
    imageLoaded.value[cardCode] = false
    img.style.display = 'none'
  }
}

// Load conflicts on mount
onMounted(() => {
  decksStore.fetchDecks()
})
</script>

<style scoped>
.card-image-container {
  width: 150px;
  height: 225px;
  position: relative;
}


.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.card-image-fallback {
  width: 100%;
  height: 100%;
  min-height: 225px;
}


.rotated-card {
  transform: rotate(-90deg) scale(1.5);
  transform-origin: center;
  object-fit: contain;
  object-position: center;
  box-shadow: none !important;
  border-radius: 0 !important;
}

@media (max-width: 1024px) {
  .card-image-container {
    width: 120px;
    height: 180px;
  }


  .card-image-fallback {
    min-height: 180px;
  }

}
</style>