<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Marvel Champions Deck Collection
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              Username
            </label>
            <div class="mt-1">
              <input
                id="username"
                v-model="form.username"
                :disabled="isLoading"
                type="text"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="form.password"
                :disabled="isLoading"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
            <div v-if="showResendVerification" class="mt-2">
              <NuxtLink 
                to="/register" 
                class="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Resend verification email
              </NuxtLink>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isLoading">Sign in</span>
              <span v-else class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            </button>
          </div>

          <div class="text-center space-y-2">
            <p class="text-sm text-gray-600">
              <NuxtLink to="/forgot-password" class="font-medium text-red-600 hover:text-red-500">
                Forgot your password?
              </NuxtLink>
            </p>
            <p class="text-sm text-gray-600">
              Don't have an account?
              <NuxtLink to="/register" class="font-medium text-red-600 hover:text-red-500">
                Sign up here
              </NuxtLink>
            </p>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="absolute bottom-0 left-0 right-0">
      <AuthFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { login } = useSession()

const form = reactive({
  username: '',
  password: ''
})

const isLoading = ref(false)
const error = ref('')
const showResendVerification = ref(false)

const handleLogin = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  error.value = ''
  showResendVerification.value = false

  try {
    const result = await login(form)
    
    if (result.success) {
      // Navigate to dashboard
      await navigateTo('/', { replace: true })
    } else {
      error.value = result.error || 'Login failed'
      // Show resend verification link if email not verified
      if (error.value.includes('Email not verified')) {
        showResendVerification.value = true
      }
      isLoading.value = false
    }
  } catch (err: any) {
    error.value = err.message || 'An unexpected error occurred'
    // Show resend verification link if email not verified
    if (error.value.includes('Email not verified')) {
      showResendVerification.value = true
    }
    isLoading.value = false
  }
}
</script>