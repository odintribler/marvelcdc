<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Session management is handled by middleware and SSR
// No client-side auth initialization needed

// Set default meta and title
useSeoMeta({
  title: 'Marvel Champions Deck Collection',
  description: 'Manage your Marvel Champions LCG deck collection and track conflicts in real-time. Built to work seamlessly with MarvelCDB data.',
  ogTitle: 'Marvel Champions Deck Collection',
  ogDescription: 'The ultimate tool for managing your Marvel Champions LCG deck collection and tracking conflicts.',
  ogImage: 'https://marvelcdb.com/bundles/cards/01001.png',
  twitterCard: 'summary_large_image',
})
</script>
