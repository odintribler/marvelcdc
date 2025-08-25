<template>
  <div class="px-4 sm:px-0">
    <!-- Import deck section -->
    <div class="bg-gradient-to-br from-red-50 to-red-100 shadow-sm sm:rounded-xl mb-6 sm:mb-8 border border-red-200">
      <div class="px-6 py-6 sm:p-8">
        <div class="flex items-start space-x-4 mb-6">
          <div class="flex-shrink-0">
            <div class="flex items-center justify-center h-12 w-12 rounded-xl bg-red-500 shadow-sm">
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Import Deck from MarvelCDB
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              Copy and paste any MarvelCDB deck URL to add it to your collection. We'll automatically detect conflicts with your existing collection.
            </p>
            
            <div class="space-y-4">
              <div class="flex flex-col sm:flex-row gap-3">
                <div class="flex-1">
                  <input
                    v-model="importUrl"
                    type="url"
                    placeholder="https://marvelcdb.com/decklist/view/..."
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm placeholder-gray-400 transition-all duration-200"
                    :disabled="isImporting"
                    @keydown.enter="handleImport"
                  />
                </div>
                <button
                  @click="handleImport"
                  :disabled="!importUrl.trim() || isImporting"
                  class="px-6 py-3 bg-red-600 text-white font-medium text-sm rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center whitespace-nowrap"
                >
                  <span v-if="!isImporting" class="flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Import Deck
                  </span>
                  <span v-else class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </span>
                </button>
              </div>
              
              <!-- Messages -->
              <div v-if="importError" class="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex">
                  <svg class="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="text-sm text-red-700">{{ importError }}</div>
                </div>
              </div>
              
              <div v-if="importSuccess" class="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex">
                  <svg class="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="text-sm text-green-700">{{ importSuccess }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Deck collection grid -->
    <div>
      <div class="flex justify-between items-start mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">My Decks</h2>
          <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
            <span>{{ activeDecks.length }} Active</span>
            <span>{{ inactiveDecks.length }} Inactive</span>
            <span v-if="hasConflicts" class="text-yellow-600">
              {{ conflictCount }} Conflicts
            </span>
          </div>
        </div>
        
        <!-- Layout toggle -->
        <div class="flex items-center space-x-2 flex-shrink-0 ml-4">
          <span class="text-sm text-gray-500 hidden sm:inline">View:</span>
          <div class="bg-gray-100 p-1 rounded-lg">
            <button
              @click="viewMode = 'cards'"
              :class="[
                'px-3 py-2 sm:px-3 sm:py-1 text-sm font-medium rounded-md transition-colors',
                viewMode === 'cards' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
              title="Card View"
            >
              <svg class="w-4 h-4 sm:mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span class="hidden sm:inline">Cards</span>
            </button>
            <button
              @click="viewMode = 'table'"
              :class="[
                'px-3 py-2 sm:px-3 sm:py-1 text-sm font-medium rounded-md transition-colors',
                viewMode === 'table' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
              title="Table View"
            >
              <svg class="w-4 h-4 sm:mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span class="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-12">
        <svg class="animate-spin h-12 w-12 text-red-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600">Loading your decks...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="decks.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A10.003 10.003 0 0124 26c4.21 0 7.813 2.602 9.288 6.286" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No decks yet</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by importing a deck from MarvelCDB.</p>
      </div>

      <!-- Card view -->
      <div v-else-if="viewMode === 'cards'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        <DeckCard
          v-for="deck in decks"
          :key="deck.id"
          :deck="deck"
          :conflicts="getConflictsForDeck(deck.id)"
          @toggle-active="handleToggleActive"
          @show-conflicts="handleShowConflicts"
          @delete-deck="handleDeleteDeck"
        />
      </div>

      <!-- Table view -->
      <div v-else>
        <!-- Mobile: Card-style list -->
        <div class="sm:hidden space-y-3">
          <div
            v-for="deck in decks"
            :key="deck.id"
            class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          >
            <!-- Mobile deck item -->
            <div 
              class="p-4 cursor-pointer"
              @click="toggleDeckExpansion(deck.id)"
            >
              <div class="flex items-start space-x-3">
                <!-- Hero thumbnail -->
                <img 
                  :src="`https://marvelcdb.com/bundles/cards/${deck.heroCode}.png`" 
                  :alt="deck.heroName"
                  class="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm flex-shrink-0"
                  @error="onImageError"
                />
                
                <!-- Deck info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                      <a 
                        v-if="deck.deckUrl" 
                        :href="deck.deckUrl" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="text-sm font-medium text-gray-900 hover:text-red-600 transition-colors block truncate"
                        @click.stop
                      >
                        {{ deck.name }}
                      </a>
                      <div v-else class="text-sm font-medium text-gray-900 truncate">{{ deck.name }}</div>
                      <div class="text-xs text-gray-500 mt-1">
                        {{ deck.heroName }} • {{ getTotalCards(deck) }} cards
                      </div>
                    </div>
                    <svg 
                      :class="[
                        'h-5 w-5 text-gray-400 transform transition-transform duration-200 flex-shrink-0 ml-2',
                        expandedDeckIds.has(deck.id) ? 'rotate-180' : ''
                      ]" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  <!-- Status and actions row -->
                  <div class="flex items-center justify-between mt-3">
                    <div class="flex items-center space-x-2">
                      <span 
                        :class="[
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          deck.isActive 
                            ? (getConflictsForDeck(deck.id).length > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')
                            : 'bg-gray-100 text-gray-600'
                        ]"
                      >
                        {{ getStatusText(deck) }}
                      </span>
                      <span v-if="getConflictsForDeck(deck.id).length > 0" class="text-xs text-yellow-600 font-medium">
                        {{ getConflictsForDeck(deck.id).length }} conflict{{ getConflictsForDeck(deck.id).length !== 1 ? 's' : '' }}
                      </span>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex items-center space-x-1">
                      <button
                        v-if="getConflictsForDeck(deck.id).length > 0"
                        @click.stop="handleShowConflicts(deck.id)"
                        class="p-2 text-yellow-600 hover:text-yellow-700 transition-colors"
                        title="View Conflicts"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </button>
                      <button
                        @click.stop="handleToggleActive(deck.id, !deck.isActive)"
                        :class="[
                          'px-3 py-1 text-xs font-medium rounded transition-colors',
                          deck.isActive 
                            ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200' 
                            : 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
                        ]"
                      >
                        {{ deck.isActive ? 'Deactivate' : 'Activate' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Expanded deck details for mobile -->
            <div v-if="expandedDeckIds.has(deck.id)" class="border-t border-gray-200 bg-gray-50 p-4">
              <div class="space-y-4">
                <!-- Deck Cards Section -->
                <div>
                  <h5 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Deck Cards ({{ getTotalCards(deck) }})
                  </h5>
                  <div class="max-h-64 overflow-y-auto space-y-3">
                    <!-- Cards grouped by faction -->
                    <div v-for="group in getSortedCardGroups(deck)" :key="group.title" class="border rounded-md overflow-hidden" :class="getFactionColorClasses(group.faction)">
                      <div class="px-3 py-2 border-b" :class="getFactionColorClasses(group.faction)">
                        <h6 class="text-xs font-semibold uppercase tracking-wider flex items-center">
                          <span 
                            class="w-2 h-2 rounded-full mr-2"
                            :class="getFactionDotClass(group.faction)"
                          ></span>
                          {{ group.title }} ({{ group.cards.length }})
                        </h6>
                      </div>
                      <div class="bg-white">
                        <!-- Card type groups within faction -->
                        <div v-for="typeGroup in group.cardTypeGroups" :key="typeGroup.title" class="border-t first:border-t-0 border-gray-100">
                          <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                            <h6 class="text-xs font-medium text-gray-700 uppercase tracking-wider">
                              {{ typeGroup.title }} ({{ typeGroup.cards.length }})
                            </h6>
                          </div>
                          <div
                            v-for="card in typeGroup.cards"
                            :key="card.id"
                            class="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 transition-colors"
                          >
                            <div class="flex items-center space-x-2 flex-1 min-w-0">
                              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 flex-shrink-0">
                                ×{{ card.quantity }}
                              </span>
                              <span class="font-medium text-gray-900 text-sm">{{ card.cardName }}</span>
                            </div>
                            <div v-if="getCardConflict(card)" class="flex items-center ml-2 flex-shrink-0">
                              <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span class="hidden sm:inline">{{ getCardConflict(card) }}</span>
                                <span class="sm:hidden">Need {{ getCardConflictQuantity(card) }}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Conflicts Section (if any) -->
                <div v-if="getConflictsForDeck(deck.id).length > 0" class="border-t border-gray-200 pt-4">
                  <h5 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <svg class="w-4 h-4 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Card Conflicts ({{ getConflictsForDeck(deck.id).length }})
                  </h5>
                  <div class="space-y-2">
                    <div v-for="conflict in getConflictsForDeck(deck.id)" :key="conflict.cardCode" class="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div>
                        <h6 class="font-medium text-gray-900 text-sm">{{ conflict.cardName }}</h6>
                        <p class="text-sm text-gray-600 mt-1">
                          Need {{ conflict.totalNeeded }}, Own {{ conflict.totalOwned }}, 
                          Missing {{ conflict.conflictQuantity }}
                        </p>
                      </div>
                      <div v-if="conflict.conflictingDecks?.length" class="mt-2">
                        <p class="text-sm text-gray-600">Used in:</p>
                        <ul class="text-sm text-gray-800 mt-1">
                          <li v-for="deckName in conflict.conflictingDecks" :key="deckName" class="flex items-center">
                            <span class="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></span>
                            {{ deckName }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Desktop: Traditional table -->
        <div class="hidden sm:block bg-white shadow sm:rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deck
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Hero
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Cards
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Conflicts
                  </th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <template v-for="deck in decks" :key="deck.id">
                  <tr 
                    class="hover:bg-gray-50 transition-colors cursor-pointer"
                    @click="toggleDeckExpansion(deck.id)"
                  >
                    <!-- Deck name with hero thumbnail -->
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <img 
                          :src="`https://marvelcdb.com/bundles/cards/${deck.heroCode}.png`" 
                          :alt="deck.heroName"
                          class="w-10 h-10 rounded-lg object-cover border border-gray-200 shadow-sm mr-3 flex-shrink-0"
                          @error="onImageError"
                        />
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center">
                            <a 
                              v-if="deck.deckUrl" 
                              :href="deck.deckUrl" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              class="text-sm font-medium text-gray-900 hover:text-red-600 transition-colors truncate"
                              @click.stop
                            >
                              {{ deck.name }}
                            </a>
                            <div v-else class="text-sm font-medium text-gray-900 truncate">{{ deck.name }}</div>
                            <svg 
                              :class="[
                                'ml-2 h-4 w-4 text-gray-400 transform transition-transform duration-200 flex-shrink-0',
                                expandedDeckIds.has(deck.id) ? 'rotate-180' : ''
                              ]" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                          <div class="text-sm text-gray-500">{{ deck.heroName }}</div>
                        </div>
                      </div>
                    </td>
                  
                  <!-- Hero -->
                  <td class="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {{ deck.heroName }}
                    </span>
                  </td>
                  
                  <!-- Card count -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                    {{ getTotalCards(deck) }} cards
                  </td>
                  
                  <!-- Status -->
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      :class="[
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                        deck.isActive 
                          ? (getConflictsForDeck(deck.id).length > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800')
                          : 'bg-gray-100 text-gray-600'
                      ]"
                    >
                      {{ getStatusText(deck) }}
                    </span>
                  </td>
                  
                  <!-- Conflicts -->
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                    <span v-if="getConflictsForDeck(deck.id).length > 0" class="text-yellow-600 font-medium">
                      {{ getConflictsForDeck(deck.id).length }} conflict{{ getConflictsForDeck(deck.id).length !== 1 ? 's' : '' }}
                    </span>
                    <span v-else class="text-gray-400">None</span>
                  </td>
                  
                  <!-- Actions -->
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2">
                      <button
                        v-if="getConflictsForDeck(deck.id).length > 0"
                        @click.stop="handleShowConflicts(deck.id)"
                        class="text-yellow-600 hover:text-yellow-700 transition-colors"
                        title="View Conflicts"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </button>
                      <button
                        @click.stop="handleToggleActive(deck.id, !deck.isActive)"
                        :class="[
                          'px-3 py-1 text-xs font-medium rounded transition-colors',
                          deck.isActive 
                            ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200' 
                            : 'text-green-700 bg-green-50 hover:bg-green-100 border border-green-200'
                        ]"
                      >
                        {{ deck.isActive ? 'Deactivate' : 'Activate' }}
                      </button>
                    </div>
                  </td>
                </tr>
                
                <!-- Expanded deck details row -->
                <tr v-if="expandedDeckIds.has(deck.id)" class="bg-gray-50">
                  <td colspan="6" class="px-6 py-4">
                    <div class="space-y-4">
                      <!-- Deck Cards Section -->
                      <div>
                        <h5 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                          <svg class="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                          Deck Cards ({{ getTotalCards(deck) }})
                        </h5>
                        <div class="max-h-64 overflow-y-auto space-y-3">
                          <!-- Cards grouped by faction -->
                          <div v-for="group in getSortedCardGroups(deck)" :key="group.title" class="border rounded-md overflow-hidden" :class="getFactionColorClasses(group.faction)">
                            <div class="px-3 py-2 border-b" :class="getFactionColorClasses(group.faction)">
                              <h6 class="text-xs font-semibold uppercase tracking-wider flex items-center">
                                <span 
                                  class="w-2 h-2 rounded-full mr-2"
                                  :class="getFactionDotClass(group.faction)"
                                ></span>
                                {{ group.title }} ({{ group.cards.length }})
                              </h6>
                            </div>
                            <div class="bg-white">
                              <!-- Card type groups within faction -->
                              <div v-for="typeGroup in group.cardTypeGroups" :key="typeGroup.title" class="border-t first:border-t-0 border-gray-100">
                                <div class="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                                  <h6 class="text-xs font-medium text-gray-700 uppercase tracking-wider">
                                    {{ typeGroup.title }} ({{ typeGroup.cards.length }})
                                  </h6>
                                </div>
                                <div
                                  v-for="card in typeGroup.cards"
                                  :key="card.id"
                                  class="flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 transition-colors"
                                >
                                  <div class="flex items-center space-x-2 flex-1 min-w-0">
                                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 flex-shrink-0">
                                      ×{{ card.quantity }}
                                    </span>
                                    <span class="font-medium text-gray-900 text-sm">{{ card.cardName }}</span>
                                  </div>
                                  <div v-if="getCardConflict(card)" class="flex items-center ml-2 flex-shrink-0">
                                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                      <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                      {{ getCardConflict(card) }}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Conflicts Section (if any) -->
                      <div v-if="getConflictsForDeck(deck.id).length > 0" class="border-t border-gray-200 pt-4">
                        <h5 class="text-sm font-medium text-gray-900 mb-3 flex items-center">
                          <svg class="w-4 h-4 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Card Conflicts ({{ getConflictsForDeck(deck.id).length }})
                        </h5>
                        <div class="space-y-2">
                          <div v-for="conflict in getConflictsForDeck(deck.id)" :key="conflict.cardCode" class="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                            <div class="flex justify-between items-start">
                              <div>
                                <h6 class="font-medium text-gray-900 text-sm">{{ conflict.cardName }}</h6>
                                <p class="text-sm text-gray-600">
                                  Need {{ conflict.totalNeeded }}, Own {{ conflict.totalOwned }}, 
                                  Missing {{ conflict.conflictQuantity }}
                                </p>
                              </div>
                            </div>
                            <div v-if="conflict.conflictingDecks?.length" class="mt-2">
                              <p class="text-sm text-gray-600">Used in:</p>
                              <ul class="text-sm text-gray-800 mt-1">
                                <li v-for="deckName in conflict.conflictingDecks" :key="deckName" class="flex items-center">
                                  <span class="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-2"></span>
                                  {{ deckName }}
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Conflict Modal -->
    <div v-if="showConflictModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen p-2 sm:p-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeConflictModal"></div>
        
        <div class="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-sm max-h-[90vh] flex flex-col">
          <div class="bg-white px-4 pt-4 pb-2 flex-shrink-0">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 class="text-base leading-6 font-medium text-gray-900">
                  Conflicts ({{ selectedConflicts.length }})
                </h3>
              </div>
              <button
                @click="closeConflictModal"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
            
          <!-- Single column conflicts list with categories -->
          <div class="flex-1 overflow-y-auto px-4 py-4">
            <div class="space-y-3 text-xs leading-tight">
              <!-- Hero conflicts -->
              <div v-if="getHeroConflicts().length > 0" class="space-y-1">
                <h6 class="font-bold text-gray-800 text-xs uppercase tracking-wider">Hero ({{ getHeroConflicts().length }})</h6>
                <div class="space-y-0.5">
                  <div v-for="conflict in getHeroConflicts()" :key="conflict.cardName" class="space-y-0.5">
                    <div class="flex">
                      <span class="w-4 text-right mr-2 font-medium text-red-600">{{ conflict.conflictQuantity }}×</span>
                      <span class="flex-1 text-gray-800 leading-none">{{ conflict.cardName }}</span>
                    </div>
                    <div v-if="getConflictUsageText(conflict)" class="ml-6 text-xs text-gray-500">
                      {{ getConflictUsageText(conflict) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Aspect conflicts -->
              <div v-if="getAspectConflicts().length > 0" class="space-y-1">
                <h6 class="font-bold text-gray-800 text-xs uppercase tracking-wider">{{ getAspectName() }} ({{ getAspectConflicts().length }})</h6>
                <div class="space-y-0.5">
                  <div v-for="conflict in getAspectConflicts()" :key="conflict.cardName" class="space-y-0.5">
                    <div class="flex">
                      <span class="w-4 text-right mr-2 font-medium text-red-600">{{ conflict.conflictQuantity }}×</span>
                      <span class="flex-1 text-gray-800 leading-none">{{ conflict.cardName }}</span>
                    </div>
                    <div v-if="getConflictUsageText(conflict)" class="ml-6 text-xs text-gray-500">
                      {{ getConflictUsageText(conflict) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Basic conflicts -->
              <div v-if="getBasicConflicts().length > 0" class="space-y-1">
                <h6 class="font-bold text-gray-800 text-xs uppercase tracking-wider">Basic ({{ getBasicConflicts().length }})</h6>
                <div class="space-y-0.5">
                  <div v-for="conflict in getBasicConflicts()" :key="conflict.cardName" class="space-y-0.5">
                    <div class="flex">
                      <span class="w-4 text-right mr-2 font-medium text-red-600">{{ conflict.conflictQuantity }}×</span>
                      <span class="flex-1 text-gray-800 leading-none">{{ conflict.cardName }}</span>
                    </div>
                    <div v-if="getConflictUsageText(conflict)" class="ml-6 text-xs text-gray-500">
                      {{ getConflictUsageText(conflict) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-3 py-2 sm:px-6 sm:py-3 flex-shrink-0 flex justify-between items-center">
            <div class="text-sm text-gray-600">
              <span class="font-medium">{{ selectedConflicts.length }}</span> card<span class="hidden sm:inline">{{ selectedConflicts.length !== 1 ? 's' : '' }} need{{ selectedConflicts.length === 1 ? 's' : '' }} attention</span><span class="sm:hidden">s</span>
            </div>
            <button
              @click="closeConflictModal"
              class="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen p-2 sm:p-4">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeDeleteModal"></div>
        
        <div class="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all w-full max-w-sm">
          <div class="bg-white px-4 pt-5 pb-4">
            <div class="flex items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="ml-3 text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Delete Deck
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete "{{ deckToDelete?.name }}"? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              @click="confirmDelete"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Delete
            </button>
            <button
              type="button"
              @click="closeDeleteModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
// Protected by global auth middleware
import { sortCardsByFaction, getFactionColorClasses, sortConflictsByFaction } from '~/utils/cardSorting'

const decksStore = useDecksStore()
const { user } = useSession()

// Import functionality
const importUrl = ref('')
const isImporting = ref(false)
const importError = ref('')
const importSuccess = ref('')

// View mode
const viewMode = ref('cards')

// Conflict modal
const showConflictModal = ref(false)
const selectedConflicts = ref([])
const currentDeckName = ref('')

// Delete modal
const showDeleteModal = ref(false)
const deckToDelete = ref(null)

// Table view expansion
const expandedDeckIds = ref(new Set())

// Computed properties
const decks = computed(() => decksStore.decks)
const activeDecks = computed(() => decksStore.activeDecks)
const inactiveDecks = computed(() => decksStore.inactiveDecks)
const hasConflicts = computed(() => decksStore.hasConflicts)
const conflictCount = computed(() => decksStore.conflicts.length)
const isLoading = computed(() => decksStore.isLoading)

const getConflictsForDeck = (deckId: number) => {
  return decksStore.getConflictsForDeck(deckId)
}

// Methods
const handleImport = async () => {
  if (!importUrl.value.trim()) return

  isImporting.value = true
  importError.value = ''
  importSuccess.value = ''

  const result = await decksStore.importDeck(importUrl.value)
  
  if (result.success) {
    importSuccess.value = 'Deck imported successfully!'
    importUrl.value = ''
    
    if (result.conflicts && result.conflicts.length > 0) {
      importSuccess.value += ` Note: ${result.conflicts.length} card conflicts detected.`
    }
  } else {
    importError.value = result.error || 'Failed to import deck'
  }

  isImporting.value = false
}

const handleToggleActive = async (deckId: number, isActive: boolean) => {
  await decksStore.toggleDeckActive(deckId, isActive)
}

const handleShowConflicts = (deckId: number) => {
  const deck = decks.value.find(d => d.id === deckId)
  currentDeckName.value = deck?.name || ''
  selectedConflicts.value = getConflictsForDeck(deckId)
  showConflictModal.value = true
}

const closeConflictModal = () => {
  showConflictModal.value = false
  selectedConflicts.value = []
  currentDeckName.value = ''
}

const handleDeleteDeck = (deckId: number) => {
  const deck = decks.value.find(d => d.id === deckId)
  deckToDelete.value = deck
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deckToDelete.value = null
}

const confirmDelete = async () => {
  if (deckToDelete.value) {
    await decksStore.deleteDeck(deckToDelete.value.id)
    closeDeleteModal()
  }
}

// Helper methods for conflict grouping in modal
const getHeroConflicts = () => {
  return selectedConflicts.value.filter(conflict => 
    conflict.faction === 'hero'
  )
}

const getAspectConflicts = () => {
  return selectedConflicts.value.filter(conflict => 
    conflict.faction && ['aggression', 'justice', 'leadership', 'protection'].includes(conflict.faction.toLowerCase())
  )
}

const getBasicConflicts = () => {
  return selectedConflicts.value.filter(conflict => 
    conflict.faction === 'basic' || conflict.faction === null || conflict.faction === ''
  )
}

const getLeftAspectConflicts = () => {
  const aspectConflicts = getAspectConflicts()
  return aspectConflicts.slice(0, Math.ceil(aspectConflicts.length / 2))
}

const getRightAspectConflicts = () => {
  const aspectConflicts = getAspectConflicts()
  return aspectConflicts.slice(Math.ceil(aspectConflicts.length / 2))
}

const getAspectName = () => {
  const aspectConflict = getAspectConflicts()[0]
  if (aspectConflict?.faction) {
    const faction = aspectConflict.faction.toLowerCase()
    return faction.charAt(0).toUpperCase() + faction.slice(1)
  }
  return 'Aspect'
}

// Filter out current deck from conflicting decks list
const getOtherConflictingDecks = (conflict: any) => {
  if (!conflict.conflictingDecks || !currentDeckName.value) {
    return conflict.conflictingDecks || []
  }
  return conflict.conflictingDecks.filter((deckName: string) => deckName !== currentDeckName.value)
}

// Get conflict usage text - either other decks or not in collection
const getConflictUsageText = (conflict: any) => {
  // If totalOwned is 0, card is not in collection
  if (conflict.totalOwned === 0) {
    return 'Not in collection'
  }
  
  // Otherwise show other decks using this card
  const otherDecks = getOtherConflictingDecks(conflict)
  if (otherDecks.length > 0) {
    return `Used in: ${otherDecks.join(', ')}`
  }
  
  return null
}

// Helper methods for table view
const getTotalCards = (deck: any) => {
  return deck.deckCards?.reduce((sum: number, card: any) => sum + card.quantity, 0) || 0
}

const getStatusText = (deck: any) => {
  if (!deck.isActive) return 'Inactive'
  const conflicts = getConflictsForDeck(deck.id)
  if (conflicts.length > 0) return 'Conflicts'
  return 'Ready'
}

const onImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

// Table expansion functions
const toggleDeckExpansion = (deckId: number) => {
  if (expandedDeckIds.value.has(deckId)) {
    expandedDeckIds.value.delete(deckId)
  } else {
    expandedDeckIds.value.add(deckId)
  }
}

// Helper functions for table expanded view
const getCardConflict = (card: any) => {
  const conflicts = getConflictsForDeck(card.deckId)
  const conflict = conflicts.find(c => 
    c.cardCodes?.includes(card.cardCode) || c.cardName === card.cardName
  )
  return conflict ? `Need ${conflict.conflictQuantity} more` : null
}

const getCardConflictClass = (card: any) => {
  return getCardConflict(card) ? 'bg-yellow-50 border border-yellow-200' : 'bg-white border border-gray-100'
}

// Card sorting helper
const getSortedCardGroups = (deck: any) => {
  if (!deck.deckCards || deck.deckCards.length === 0) {
    return []
  }
  return sortCardsByFaction(deck.deckCards, deck.heroCode)
}

const getFactionDotClass = (faction: string | null) => {
  const dotClasses: { [key: string]: string } = {
    aggression: 'bg-red-500',
    justice: 'bg-yellow-500',
    leadership: 'bg-blue-500',
    protection: 'bg-green-500',
    basic: 'bg-gray-500',
    hero: 'bg-purple-500'
  }
  
  if (!faction) return dotClasses.hero
  return dotClasses[faction] || dotClasses.basic
}

const getCardConflictQuantity = (card: any) => {
  const conflicts = getConflictsForDeck(card.deckId)
  const conflict = conflicts.find(c => 
    c.cardCodes?.includes(card.cardCode) || c.cardName === card.cardName
  )
  return conflict ? conflict.conflictQuantity : 0
}

// Helper function for conflict modal
const getSortedConflictGroups = () => {
  if (!selectedConflicts.value || selectedConflicts.value.length === 0) {
    return []
  }
  return sortConflictsByFaction(selectedConflicts.value)
}

// Load data on mount
onMounted(() => {
  decksStore.fetchDecks()
})
</script>