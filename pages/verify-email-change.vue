<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center py-8 px-4">
    <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
      <div class="text-center">
        <!-- Loading State -->
        <div v-if="verifying" class="space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <h2 class="text-xl font-bold text-gray-900">Verifying Email Change</h2>
          <p class="text-gray-600">Please wait while we verify your new email address...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="success" class="space-y-4">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-green-600">Email Successfully Changed!</h2>
          <p class="text-gray-600">Your email address has been successfully updated.</p>
          <NuxtLink
            to="/profile"
            class="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium mt-4"
          >
            Return to Profile
          </NuxtLink>
        </div>

        <!-- Error State -->
        <div v-else class="space-y-4">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-red-600">Verification Failed</h2>
          <p class="text-gray-600">{{ error || 'The verification link is invalid or has expired.' }}</p>
          <div class="space-y-2">
            <NuxtLink
              to="/profile"
              class="inline-block bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Go to Profile
            </NuxtLink>
            <br>
            <NuxtLink
              to="/"
              class="inline-block text-gray-600 hover:text-gray-800 underline"
            >
              Return to Dashboard
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { fetchProfile } = useSession()

const verifying = ref(true)
const success = ref(false)
const error = ref('')

onMounted(async () => {
  const token = route.query.token as string
  
  if (!token) {
    error.value = 'No verification token provided'
    verifying.value = false
    return
  }
  
  try {
    await $fetch('/api/profile/verify-email-change', {
      method: 'POST',
      body: { token }
    })
    
    success.value = true
    
    // Refresh session data
    await fetchProfile()
  } catch (err: any) {
    console.error('Email verification error:', err)
    error.value = err.data?.message || 'Verification failed'
  } finally {
    verifying.value = false
  }
})
</script>