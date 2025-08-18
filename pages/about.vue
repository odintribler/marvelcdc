<template>
  <div class="px-4 sm:px-0">
    <div class="mb-6 sm:mb-8">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">About MarvelCDC</h1>
      <p class="mt-2 text-sm text-gray-600">
        Marvel Champions Deck Collection - A collection management tool for the Marvel Champions Living Card Game
      </p>
    </div>

    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="prose prose-gray max-w-none">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">What is MarvelCDC?</h2>
          <p class="text-gray-700 mb-6">
            MarvelCDC (Marvel Champions Deck Collection) is a web application designed to help Marvel Champions: The Card Game players manage their card collection and detect conflicts between multiple decks.
          </p>

          <h3 class="text-md font-semibold text-gray-900 mb-3">Key Features</h3>
          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li><strong>Collection Tracking:</strong> Keep track of which packs and expansions you own</li>
            <li><strong>Deck Import:</strong> Import decks directly from MarvelCDB using deck URLs</li>
            <li><strong>Conflict Detection:</strong> Automatically detect when multiple active decks require more copies of a card than you own</li>
            <li><strong>Deck Management:</strong> Organize your decks, activate/deactivate them as needed</li>
            <li><strong>Real-time Updates:</strong> Your collection and conflicts update automatically as you make changes</li>
          </ul>

          <h3 class="text-md font-semibold text-gray-900 mb-3">How to Use MarvelCDC</h3>
          <ol class="list-decimal list-inside text-gray-700 mb-6 space-y-3">
            <li>
              <strong>Set up your collection:</strong> Go to the Collection page and mark which Marvel Champions packs you own and how many copies of each.
            </li>
            <li>
              <strong>Import your decks:</strong> On the Dashboard, paste MarvelCDB deck URLs to import your favorite decks.
            </li>
            <li>
              <strong>Activate decks:</strong> Mark which decks you want to actively use. Only active decks are considered for conflict detection.
            </li>
            <li>
              <strong>Review conflicts:</strong> Check the Conflicts page to see if you have enough cards to build all your active decks simultaneously.
            </li>
            <li>
              <strong>Resolve conflicts:</strong> Deactivate decks or adjust your collection to resolve any conflicts.
            </li>
          </ol>

          <h3 class="text-md font-semibold text-gray-900 mb-3">Why Use MarvelCDC?</h3>
          <p class="text-gray-700 mb-4">
            If you're like many Marvel Champions players, you probably have multiple decks built and ready to play. But with a growing collection and limited copies of popular cards, it can be challenging to know which decks you can actually play at the same time.
          </p>
          <p class="text-gray-700 mb-6">
            MarvelCDC solves this problem by automatically calculating conflicts between your decks based on your actual card collection, saving you time and preventing the frustration of discovering missing cards when you sit down to play.
          </p>

          <h3 class="text-md font-semibold text-gray-900 mb-3">Data Integration</h3>
          <p class="text-gray-700 mb-6">
            MarvelCDC integrates with <a href="https://marvelcdb.com" target="_blank" rel="noopener noreferrer" class="text-red-600 hover:text-red-700">MarvelCDB</a>, the premier deck building site for Marvel Champions. You can import any public deck from MarvelCDB simply by pasting the deck URL.
          </p>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-3">
                <h4 class="text-sm font-medium text-blue-800">Getting Started Tip</h4>
                <p class="text-sm text-blue-700 mt-1">
                  Start by setting up your collection first, then import a few of your favorite decks to see the conflict detection in action!
                </p>
              </div>
            </div>
          </div>

          <h3 class="text-md font-semibold text-gray-900 mb-3">Open Source</h3>
          <p class="text-gray-700 mb-6">
            MarvelCDC is built with modern web technologies including Nuxt 3, Vue 3, and TypeScript. The application respects your privacy and stores your data securely.
          </p>

          <div class="border-t border-gray-200 pt-6">
            <p class="text-sm text-gray-500">
              Have questions or feedback? Feel free to reach out to <a href="https://marvelcdb.com/user/profile/4394/OrangeViking" target="_blank" rel="noopener noreferrer" class="text-red-600 hover:text-red-700">OrangeViking</a> on MarvelCDB.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// This page is public and doesn't require authentication
definePageMeta({
  auth: false
})

// Set page title
useHead({
  title: 'About - MarvelCDC',
  meta: [
    {
      name: 'description',
      content: 'Learn about MarvelCDC, a collection management tool for Marvel Champions: The Card Game that helps detect deck conflicts and manage your card collection.'
    }
  ]
})
</script>