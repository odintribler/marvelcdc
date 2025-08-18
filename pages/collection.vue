<template>
  <div class="px-4 sm:px-0">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">My Collection</h1>
      <p class="mt-2 text-sm text-gray-600">
        Select which Marvel Champions packs you own to track card availability.
      </p>
    </div>

    <!-- Collection Summary -->
    <div class="bg-white shadow sm:rounded-lg mb-8">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          Collection Summary
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div class="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <div class="text-xl sm:text-2xl font-bold text-blue-900">{{ totalPacks }}</div>
            <div class="text-xs sm:text-sm text-blue-600">Total Packs</div>
          </div>
          <div class="bg-green-50 p-3 sm:p-4 rounded-lg">
            <div class="text-xl sm:text-2xl font-bold text-green-900">{{ uniquePacksOwned }}</div>
            <div class="text-xs sm:text-sm text-green-600">Unique Packs Owned</div>
          </div>
          <div class="bg-red-50 p-3 sm:p-4 rounded-lg">
            <div class="text-xl sm:text-2xl font-bold text-red-900">{{ packsNotOwned }}</div>
            <div class="text-xs sm:text-sm text-red-600">Packs Not Owned</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pack Selection -->
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            Pack Selection
          </h3>
          <button
            @click="saveCollection"
            :disabled="isSaving"
            class="btn-primary"
          >
            <span v-if="!isSaving">Save Changes</span>
            <span v-else class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          </button>
        </div>

        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div class="text-sm text-red-600">{{ error }}</div>
        </div>

        <div v-if="successMessage" class="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div class="text-sm text-green-600">{{ successMessage }}</div>
        </div>

        <!-- Loading state -->
        <div v-if="isLoading" class="text-center py-12">
          <svg class="animate-spin h-8 w-8 text-red-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-600">Loading available packs...</p>
        </div>

        <!-- Pack categories -->
        <div v-else class="space-y-8">
          <!-- Core Set -->
          <div v-if="coreSetPacks.length > 0">
            <h4 class="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <span class="w-3 h-3 bg-red-600 rounded-full mr-2"></span>
              Core Set
              <span class="ml-2 text-sm font-normal text-gray-500">({{ coreSetPacks.length }} packs)</span>
            </h4>
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
              <PackTable
                :packs="coreSetPacks"
                :get-pack-quantity="getPackQuantity"
                @update-quantity="updatePackQuantity"
              />
            </div>
          </div>

          <!-- Hero Packs -->
          <div v-if="heroPacks.length > 0">
            <h4 class="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <span class="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
              Hero Packs
              <span class="ml-2 text-sm font-normal text-gray-500">({{ heroPacks.length }} packs)</span>
            </h4>
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
              <PackTable
                :packs="heroPacks"
                :get-pack-quantity="getPackQuantity"
                @update-quantity="updatePackQuantity"
              />
            </div>
          </div>

          <!-- Campaign Boxes -->
          <div v-if="campaignPacks.length > 0">
            <h4 class="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <span class="w-3 h-3 bg-purple-600 rounded-full mr-2"></span>
              Campaign Boxes
              <span class="ml-2 text-sm font-normal text-gray-500">({{ campaignPacks.length }} packs)</span>
            </h4>
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
              <PackTable
                :packs="campaignPacks"
                :get-pack-quantity="getPackQuantity"
                @update-quantity="updatePackQuantity"
              />
            </div>
          </div>

          <!-- Scenario Packs -->
          <div v-if="scenarioPacks.length > 0">
            <h4 class="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <span class="w-3 h-3 bg-yellow-600 rounded-full mr-2"></span>
              Scenario Packs
              <span class="ml-2 text-sm font-normal text-gray-500">({{ scenarioPacks.length }} packs)</span>
            </h4>
            <div class="bg-white border border-gray-200 rounded-lg shadow-sm">
              <PackTable
                :packs="scenarioPacks"
                :get-pack-quantity="getPackQuantity"
                @update-quantity="updatePackQuantity"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth is handled by global middleware

const collectionStore = useCollectionStore()

// Local state
const isSaving = ref(false)
const error = ref('')
const successMessage = ref('')
const pendingUpdates = ref(new Map())

// Computed properties
const collection = computed(() => collectionStore.collection)
const availablePacks = computed(() => collectionStore.availablePacks)
const ownedPacks = computed(() => collectionStore.ownedPacks)
const totalPacks = computed(() => collectionStore.totalPacks)
const isLoading = computed(() => collectionStore.isLoading)

// Pack categories
const coreSetPacks = computed(() => availablePacks.value.filter(pack => pack.type === 'core'))
const heroPacks = computed(() => availablePacks.value.filter(pack => pack.type === 'hero'))
const campaignPacks = computed(() => availablePacks.value.filter(pack => pack.type === 'campaign'))
const scenarioPacks = computed(() => availablePacks.value.filter(pack => pack.type === 'scenario'))

// Collection summary calculations
const uniquePacksOwned = computed(() => {
  return availablePacks.value.filter(pack => getPackQuantity(pack.code) > 0).length
})

const packsNotOwned = computed(() => {
  return availablePacks.value.filter(pack => getPackQuantity(pack.code) === 0).length
})

// Methods
const getPackQuantity = (packCode: string) => {
  // Check pending updates first
  if (pendingUpdates.value.has(packCode)) {
    return pendingUpdates.value.get(packCode)
  }
  return collectionStore.getPackQuantity(packCode)
}

const updatePackQuantity = (packCode: string, quantity: number) => {
  pendingUpdates.value.set(packCode, Math.max(0, quantity))
}

const saveCollection = async () => {
  if (pendingUpdates.value.size === 0) {
    successMessage.value = 'No changes to save'
    return
  }

  isSaving.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const updates = Array.from(pendingUpdates.value.entries()).map(([packCode, quantity]) => ({
      packCode,
      quantity
    }))

    const result = await collectionStore.updateCollection(updates)
    
    if (result.success) {
      successMessage.value = 'Collection updated successfully!'
      pendingUpdates.value.clear()
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } else {
      error.value = result.error || 'Failed to update collection'
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred'
  } finally {
    isSaving.value = false
  }
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    collectionStore.fetchCollection(),
    collectionStore.fetchAvailablePacks()
  ])
})
</script>