import { defineStore } from 'pinia'

interface DeckCard {
  id: number
  deckId: number
  cardCode: string
  cardName: string
  quantity: number
  cardType: string
  packCode: string
}

interface Deck {
  id: number
  name: string
  heroCode: string
  heroName: string
  isActive: boolean
  deckUrl?: string
  marvelcdbId?: number
  deckCards: DeckCard[]
}

interface CardConflict {
  cardCodes: string[]
  cardName: string
  totalNeeded: number
  totalOwned: number
  conflictQuantity: number
  conflictingDecks: string[]
}

interface DecksState {
  decks: Deck[]
  conflicts: CardConflict[]
  isLoading: boolean
  error: string | null
}

export const useDecksStore = defineStore('decks', {
  state: (): DecksState => ({
    decks: [],
    conflicts: [],
    isLoading: false,
    error: null
  }),

  getters: {
    activeDecks: (state) => state.decks.filter(deck => deck.isActive),
    inactiveDecks: (state) => state.decks.filter(deck => !deck.isActive),
    
    hasConflicts: (state) => state.conflicts.length > 0,
    
    getConflictsForDeck: (state) => (deckId: number) => {
      const deck = state.decks.find(d => d.id === deckId)
      if (!deck || !deck.isActive) return []
      
      return state.conflicts.filter(conflict => 
        deck.deckCards.some(card => 
          conflict.cardCodes.includes(card.cardCode) || card.cardName === conflict.cardName
        )
      )
    }
  },

  actions: {
    async fetchDecks() {
      this.isLoading = true
      this.error = null
      
      try {
        const { data } = await $fetch<{ decks: Deck[] }>('/api/decks')
        this.decks = data.decks
        await this.calculateConflicts()
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to fetch decks'
      } finally {
        this.isLoading = false
      }
    },

    async importDeck(url: string) {
      this.isLoading = true
      this.error = null

      try {
        const { data } = await $fetch<{ deck: Deck; conflicts: CardConflict[] }>('/api/import', {
          method: 'POST',
          body: { url }
        })

        this.decks.push(data.deck)
        this.conflicts = data.conflicts
        
        return { success: true, deck: data.deck, conflicts: data.conflicts }
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to import deck'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async toggleDeckActive(deckId: number, isActive: boolean) {
      const deck = this.decks.find(d => d.id === deckId)
      if (!deck) return

      try {
        await $fetch(`/api/decks/${deckId}`, {
          method: 'PUT',
          body: { isActive }
        })

        deck.isActive = isActive
        await this.calculateConflicts()
        
        return { success: true }
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to update deck'
        return { success: false, error: this.error }
      }
    },

    async deleteDeck(deckId: number) {
      try {
        await $fetch(`/api/decks/${deckId}`, {
          method: 'DELETE'
        })

        this.decks = this.decks.filter(d => d.id !== deckId)
        await this.calculateConflicts()
        
        return { success: true }
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to delete deck'
        return { success: false, error: this.error }
      }
    },

    async calculateConflicts() {
      try {
        const { data } = await $fetch<{ conflicts: CardConflict[] }>('/api/conflicts')
        this.conflicts = data.conflicts
      } catch (error: any) {
        console.error('Failed to calculate conflicts:', error)
      }
    },

    async resolveConflicts(conflictingDeckIds: number[]) {
      try {
        await $fetch('/api/conflicts/resolve', {
          method: 'POST',
          body: { deckIds: conflictingDeckIds }
        })

        // Update local deck states
        conflictingDeckIds.forEach(deckId => {
          const deck = this.decks.find(d => d.id === deckId)
          if (deck) deck.isActive = false
        })

        await this.calculateConflicts()
        return { success: true }
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to resolve conflicts'
        return { success: false, error: this.error }
      }
    }
  }
})