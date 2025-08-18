<template>
  <footer class="bg-gray-800 mt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Links -->
        <div>
          <h4 class="text-sm font-semibold text-white mb-4">Links</h4>
          <ul class="space-y-2">
            <li>
              <NuxtLink to="/about" class="text-sm text-gray-300 hover:text-red-400 transition-colors">
                About
              </NuxtLink>
            </li>
            <li>
              <a 
                href="https://marvelcdb.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="text-sm text-gray-300 hover:text-red-400 transition-colors"
              >
                MarvelCDB
              </a>
            </li>
          </ul>
        </div>

        <!-- Creator -->
        <div>
          <h4 class="text-sm font-semibold text-white mb-4">Creator</h4>
          <p class="text-sm text-gray-300">
            Created by 
            <a 
              href="https://marvelcdb.com/user/profile/4394/OrangeViking" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              OrangeViking
            </a>
          </p>
        </div>

        <!-- Legal -->
        <div class="md:col-span-2 lg:col-span-1">
          <h4 class="text-sm font-semibold text-white mb-4">Legal</h4>
          <p class="text-xs text-gray-400 leading-relaxed">
            The information presented on this site about Marvel Champions: The Card Game, both literal and graphical, is copyrighted by Fantasy Flight Games. This website is not produced, endorsed, supported, or affiliated with Fantasy Flight Games.
          </p>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-600 mt-8 pt-8">
        <div class="flex flex-col sm:flex-row justify-between items-center">
          <p class="text-xs text-gray-400">
            © {{ currentYear }} MarvelCDC. All rights reserved.
          </p>
          <p class="text-xs text-gray-400 mt-2 sm:mt-0">
            A deck collection management tool for Marvel Champions LCG
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>