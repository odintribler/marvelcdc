<template>
  <footer class="bg-gray-800 mt-8">
    <div class="max-w-md mx-auto px-4 py-6">
      <div class="text-center space-y-4">
        <!-- Links -->
        <div class="flex justify-center space-x-6">
          <NuxtLink 
            to="/about" 
            class="text-sm text-gray-300 hover:text-red-400 transition-colors"
          >
            About
          </NuxtLink>
          <NuxtLink 
            to="/privacy-policy" 
            class="text-sm text-gray-300 hover:text-red-400 transition-colors"
          >
            Privacy Policy
          </NuxtLink>
          <a 
            href="https://marvelcdb.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="text-sm text-gray-300 hover:text-red-400 transition-colors"
          >
            MarvelCDB
          </a>
        </div>

        <!-- Creator -->
        <div class="text-sm text-gray-300">
          Created by 
          <a 
            href="https://marvelcdb.com/user/profile/4394/OrangeViking" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="text-red-400 hover:text-red-300 transition-colors"
          >
            OrangeViking
          </a>
        </div>

        <!-- Legal -->
        <div class="border-t border-gray-700 pt-4 space-y-2">
          <p class="text-xs text-gray-400 leading-relaxed">
            "The information presented on this site about Marvel Champions: The Card Game, both literal and graphical, is copyrighted by Fantasy Flight Games. This website is not produced, endorsed, supported, or affiliated with Fantasy Flight Games."
          </p>
          <p class="text-xs text-gray-500">
            © 2025 MarvelCDC. All rights reserved.
          </p>
          <p class="text-xs text-gray-500">
            A deck collection management tool for Marvel Champions LCG
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// No additional logic needed for this component
</script>