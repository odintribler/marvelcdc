<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Marvel Champions Deck Collection
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Reset your password
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Invalid Token State -->
        <div v-if="!token" class="text-center space-y-6">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Invalid Reset Link</h3>
            <p class="mt-2 text-sm text-gray-600">
              This password reset link is invalid or has expired.
            </p>
          </div>
          <div class="space-y-3">
            <NuxtLink
              to="/forgot-password"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Request New Reset Link
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Back to Login
            </NuxtLink>
          </div>
        </div>

        <!-- Success State -->
        <div v-else-if="resetSuccess" class="text-center space-y-6">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Password Reset Successfully!</h3>
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

        <!-- Reset Form -->
        <form v-else @submit.prevent="handleResetPassword" class="space-y-6">
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                type="password"
                required
                minlength="6"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Enter your new password (6+ characters)"
              />
            </div>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div class="mt-1">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Confirm your new password"
              />
            </div>
          </div>

          <div v-if="success" class="text-green-600 text-sm">
            {{ success }}
          </div>
          
          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isLoading">Reset Password</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </span>
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Remember your password?
              <NuxtLink to="/login" class="font-medium text-red-600 hover:text-red-500">
                Sign in here
              </NuxtLink>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const route = useRoute()
const { resetPassword } = useSession()

const token = computed(() => route.query.token as string || null)

const form = reactive({
  password: '',
  confirmPassword: ''
})

const isLoading = ref(false)
const error = ref('')
const success = ref('')
const resetSuccess = ref(false)
const successMessage = ref('')

const isFormValid = computed(() => {
  return form.password.length >= 6 &&
         form.password === form.confirmPassword
})

const handleResetPassword = async () => {
  if (isLoading.value || !isFormValid.value || !token.value) return
  
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }
  
  isLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await resetPassword(token.value, form.password)
    
    if (result.success) {
      resetSuccess.value = true
      successMessage.value = result.message || 'Your password has been reset and you are now logged in!'
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigateTo('/', { replace: true })
      }, 3000)
    } else {
      error.value = result.error || 'Password reset failed'
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}
</script>