<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Burger menu button -->
        <div class="flex items-center">
          <button
            @click="toggleMenu"
            class="inline-flex items-center justify-center p-3 sm:p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500 transition-all duration-200"
          >
            <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path
                :class="{
                  hidden: isMenuOpen,
                  block: !isMenuOpen
                }"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                :class="{
                  block: isMenuOpen,
                  hidden: !isMenuOpen
                }"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          
          <!-- App title - clickable to go to dashboard -->
          <NuxtLink
            to="/"
            class="ml-4 text-xl font-bold text-gray-900 hover:text-red-600 transition-colors duration-200"
          >
            <!-- Full title on desktop, short on mobile -->
            <span class="hidden sm:inline">Marvel Champions Deck Collection</span>
            <span class="sm:hidden">MarvelCDC</span>
          </NuxtLink>
        </div>

        <!-- User profile section -->
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-700">{{ user?.username }}</span>
          <button
            @click="logout"
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Slide-out menu -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      leave-active-class="transition-opacity duration-200 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-show="isMenuOpen"
        class="fixed inset-0 z-50"
        @click="closeMenu"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        
        <!-- Menu panel -->
        <Transition
          enter-active-class="transition-transform duration-300 ease-out"
          leave-active-class="transition-transform duration-200 ease-in"
          enter-from-class="-translate-x-full"
          enter-to-class="translate-x-0"
          leave-from-class="translate-x-0"
          leave-to-class="-translate-x-full"
        >
          <div v-show="isMenuOpen" class="fixed inset-y-0 left-0 w-72 sm:w-64 bg-white shadow-lg" @click.stop>
            <nav class="mt-16 px-6 sm:px-4 space-y-2">
              <NuxtLink
                to="/"
                class="block py-4 sm:py-2 px-4 text-base sm:text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-md transition-colors duration-200"
                @click="closeMenu"
              >
                Dashboard
              </NuxtLink>
              <NuxtLink
                to="/collection"
                class="block py-4 sm:py-2 px-4 text-base sm:text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-md transition-colors duration-200"
                @click="closeMenu"
              >
                My Collection
              </NuxtLink>
              <NuxtLink
                to="/conflicts"
                class="block py-4 sm:py-2 px-4 text-base sm:text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-md transition-colors duration-200"
                @click="closeMenu"
              >
                Conflicts
              </NuxtLink>
            </nav>
          </div>
        </Transition>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const isMenuOpen = ref(false)
const { user, logout } = useSession()

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>