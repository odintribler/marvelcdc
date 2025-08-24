<template>
  <div
    v-if="showBeta"
    class="fixed top-0 right-0 z-50 bg-red-600 text-white text-lg font-bold px-12 py-3 shadow-xl"
    style="transform: rotate(45deg); transform-origin: 100% 0%; margin-top: 60px; margin-right: -35px; min-width: 120px; text-align: center;"
  >
    BETA
  </div>
</template>

<script setup lang="ts">
// Use server-side environment variable check for Railway compatibility
const showBeta = process.env.SHOW_BETA_RIBBON === 'true'
</script>