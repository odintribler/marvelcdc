<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Marvel Champions Deck Collection
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Email Verification
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center space-y-4">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg class="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p class="text-sm text-gray-600">Verifying your email...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="success" class="text-center space-y-6">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Email Verified Successfully!</h3>
            <p class="mt-2 text-sm text-gray-600">
              {{ successMessage }}
            </p>
          </div>
          <div>
            <button
              @click="navigateTo('/')"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        <!-- Error State -->
        <div v-else class="text-center space-y-6">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Verification Failed</h3>
            <p class="mt-2 text-sm text-gray-600">
              {{ error }}
            </p>
          </div>
          <div class="space-y-3">
            <NuxtLink
              to="/register"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Request New Verification
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Back to Login
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const { verifyEmail } = useSession()

const isLoading = ref(true)
const success = ref(false)
const error = ref('')
const successMessage = ref('')

onMounted(async () => {
  const token = route.query.token as string
  
  if (!token) {
    error.value = 'No verification token provided'
    isLoading.value = false
    return
  }

  try {
    const result = await verifyEmail(token)
    
    if (result.success) {
      success.value = true
      successMessage.value = result.message || 'Your email has been verified and you are now logged in!'
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigateTo('/', { replace: true })
      }, 3000)
    } else {
      error.value = result.error || 'Email verification failed'
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
})
</script>