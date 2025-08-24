<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 py-8">
    <div class="container mx-auto px-4 max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p class="text-gray-600">Manage your account information and preferences</p>
      </div>

      <!-- Profile Form -->
      <div class="bg-white rounded-xl shadow-lg p-8">
        <form @submit.prevent="updateProfile" class="space-y-6">
          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              placeholder="Enter your username"
            />
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              placeholder="Enter your email address"
            />
            <div v-if="profile?.pendingEmail" class="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p class="text-sm text-yellow-800">
                <strong>Pending email change:</strong> {{ profile.pendingEmail }}
                <br>
                Please check your email to verify this change.
              </p>
              <button
                type="button"
                @click="resendVerification"
                :disabled="resendingVerification"
                class="mt-2 text-sm text-yellow-700 hover:text-yellow-900 underline disabled:opacity-50"
              >
                {{ resendingVerification ? 'Sending...' : 'Resend verification email' }}
              </button>
            </div>
          </div>

          <!-- First Name -->
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              id="firstName"
              v-model="form.firstName"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              placeholder="Enter your first name (optional)"
            />
          </div>

          <!-- Last Name -->
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              id="lastName"
              v-model="form.lastName"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              placeholder="Enter your last name (optional)"
            />
          </div>

          <!-- MarvelCDB Profile -->
          <div>
            <label for="marvelcdbProfile" class="block text-sm font-medium text-gray-700 mb-2">
              MarvelCDB Profile URL
            </label>
            <input
              id="marvelcdbProfile"
              v-model="form.marvelcdbProfile"
              type="url"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              placeholder="https://marvelcdb.com/user/profile/..."
            />
            <p class="mt-1 text-sm text-gray-500">
              Link to your MarvelCDB profile (optional)
            </p>
          </div>

          <!-- Update Button -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              :disabled="updating"
              class="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {{ updating ? 'Updating...' : 'Update Profile' }}
            </button>
            
            <NuxtLink
              to="/"
              class="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
            >
              Cancel
            </NuxtLink>
          </div>
        </form>

        <!-- Success/Error Messages -->
        <div v-if="message" class="mt-6">
          <div 
            :class="[
              'p-4 rounded-lg',
              messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            ]"
          >
            {{ message }}
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="bg-white rounded-xl shadow-lg p-8 mt-8 border-2 border-red-200">
        <h3 class="text-lg font-bold text-red-600 mb-4">Danger Zone</h3>
        <p class="text-gray-600 mb-4">
          Account deletion is permanent and cannot be undone. All your data including decks, collections, and profile information will be permanently deleted.
        </p>
        <button
          @click="showDeleteConfirm = true"
          class="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Delete Account
        </button>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl max-w-md w-full p-6">
          <h3 class="text-lg font-bold text-red-600 mb-4">Confirm Account Deletion</h3>
          <p class="text-gray-600 mb-6">
            This action cannot be undone. All your data will be permanently deleted.
            <br><br>
            Type <strong>DELETE</strong> to confirm:
          </p>
          <input
            v-model="deleteConfirmation"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
            placeholder="Type DELETE to confirm"
          />
          <div class="flex gap-3">
            <button
              @click="deleteAccount"
              :disabled="deleteConfirmation !== 'DELETE' || deleting"
              class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ deleting ? 'Deleting...' : 'Delete Account' }}
            </button>
            <button
              @click="showDeleteConfirm = false; deleteConfirmation = ''"
              class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
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
definePageMeta({
  middleware: 'auth' as any
})

const { fetchProfile, deleteAccount: deleteAccountSession } = useSession()

const profile = ref<any>(null)
const form = reactive({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  marvelcdbProfile: ''
})

const updating = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const resendingVerification = ref(false)
const showDeleteConfirm = ref(false)
const deleteConfirmation = ref('')
const deleting = ref(false)

// Load profile data
onMounted(async () => {
  try {
    const { data } = await $fetch('/api/profile') as any
    profile.value = data.profile
    
    // Populate form with existing data
    form.username = profile.value?.username || ''
    form.email = profile.value?.email || ''
    form.firstName = profile.value?.firstName || ''
    form.lastName = profile.value?.lastName || ''
    form.marvelcdbProfile = profile.value?.marvelcdbProfile || ''
  } catch (error) {
    console.error('Failed to load profile:', error)
    message.value = 'Failed to load profile data'
    messageType.value = 'error'
  }
})

async function updateProfile() {
  if (updating.value) return
  
  updating.value = true
  message.value = ''
  
  try {
    const { data, message: responseMessage } = await $fetch('/api/profile', {
      method: 'PUT',
      body: {
        username: form.username,
        email: form.email,
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        marvelcdbProfile: form.marvelcdbProfile || null
      }
    })
    
    profile.value = data.profile
    message.value = responseMessage
    messageType.value = 'success'
    
    // Profile updated successfully
  } catch (error: any) {
    console.error('Profile update error:', error)
    message.value = error.data?.message || 'Failed to update profile'
    messageType.value = 'error'
  } finally {
    updating.value = false
  }
}

async function resendVerification() {
  if (resendingVerification.value) return
  
  resendingVerification.value = true
  
  try {
    const { message: responseMessage } = await $fetch('/api/profile/resend-email-verification', {
      method: 'POST'
    })
    
    message.value = responseMessage
    messageType.value = 'success'
  } catch (error: any) {
    console.error('Resend verification error:', error)
    message.value = error.data?.message || 'Failed to send verification email'
    messageType.value = 'error'
  } finally {
    resendingVerification.value = false
  }
}

async function deleteAccount() {
  if (deleting.value || deleteConfirmation.value !== 'DELETE') return
  
  deleting.value = true
  
  try {
    // Use the session composable method which handles logout properly
    const result = await deleteAccountSession()
    
    if (result.success) {
      // The deleteAccountSession method will handle logout and redirect to login
      // No need to do anything else here
    } else {
      message.value = result.error || 'Failed to delete account'
      messageType.value = 'error'
      showDeleteConfirm.value = false
      deleteConfirmation.value = ''
    }
  } catch (error: any) {
    console.error('Account deletion error:', error)
    message.value = 'Failed to delete account'
    messageType.value = 'error'
    showDeleteConfirm.value = false
    deleteConfirmation.value = ''
  } finally {
    deleting.value = false
  }
}
</script>