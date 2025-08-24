<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <BetaRibbon />
    <AppHeader />
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
// Auth initialization is handled by middleware
</script>