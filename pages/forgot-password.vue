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
        <!-- Success State -->
        <div v-if="emailSent" class="text-center space-y-6">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">Check Your Email</h3>
            <p class="mt-2 text-sm text-gray-600">
              If an account with that email exists, we've sent you a password reset link.
            </p>
          </div>
          <div class="space-y-3">
            <button
              @click="emailSent = false; form.email = ''"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Send Another Reset Email
            </button>
            <NuxtLink
              to="/login"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Back to Login
            </NuxtLink>
          </div>
        </div>

        <!-- Form State -->
        <form v-else @submit.prevent="handleForgotPassword" class="space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
            <p class="mt-2 text-sm text-gray-500">
              We'll send you a link to reset your password.
            </p>
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
              <span v-if="!isLoading">Send Reset Link</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
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

const { forgotPassword } = useSession()

const form = reactive({
  email: ''
})

const isLoading = ref(false)
const error = ref('')
const success = ref('')
const emailSent = ref(false)

const isFormValid = computed(() => {
  return form.email.includes('@') && form.email.length > 0
})

const handleForgotPassword = async () => {
  if (isLoading.value || !isFormValid.value) return
  
  isLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await forgotPassword(form.email)
    
    if (result.success) {
      emailSent.value = true
      success.value = result.message || 'Password reset email sent!'
    } else {
      error.value = result.error || 'Failed to send password reset email'
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred'
  } finally {
    isLoading.value = false
  }
}
</script>