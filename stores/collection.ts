import { defineStore } from 'pinia'

interface CollectionItem {
  id: number
  packCode: string
  packName: string
  quantity: number
}

interface MarvelChampionsPack {
  code: string
  name: string
  type: string
  released: string
}

interface CollectionState {
  collection: CollectionItem[]
  availablePacks: MarvelChampionsPack[]
  isLoading: boolean
  error: string | null
}

export const useCollectionStore = defineStore('collection', {
  state: (): CollectionState => ({
    collection: [],
    availablePacks: [],
    isLoading: false,
    error: null
  }),

  getters: {
    ownedPacks: (state) => state.collection.filter(item => item.quantity > 0),
    
    totalPacks: (state) => state.collection.reduce((sum, item) => sum + item.quantity, 0),
    
    getPackQuantity: (state) => (packCode: string) => {
      const pack = state.collection.find(item => item.packCode === packCode)
      return pack ? pack.quantity : 0
    },

    ownsPack: (state) => (packCode: string) => {
      return state.getPackQuantity(packCode) > 0
    }
  },

  actions: {
    async fetchCollection() {
      this.isLoading = true
      this.error = null

      try {
        const { data } = await $fetch<{ collection: CollectionItem[] }>('/api/collection')
        this.collection = data.collection
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to fetch collection'
      } finally {
        this.isLoading = false
      }
    },

    async fetchAvailablePacks() {
      this.isLoading = true

      try {
        // Fetch pack data from local database instead of external API
        const { data } = await $fetch<{ packs: MarvelChampionsPack[] }>('/api/packs')
        this.availablePacks = data.packs
      } catch (error: any) {
        console.error('Failed to fetch available packs:', error)
        this.error = 'Failed to fetch available packs from database'
      } finally {
        this.isLoading = false
      }
    },

    async updateCollection(updates: { packCode: string; quantity: number }[]) {
      this.isLoading = true
      this.error = null

      try {
        const { data } = await $fetch<{ collection: CollectionItem[] }>('/api/collection', {
          method: 'PUT',
          body: { updates }
        })

        this.collection = data.collection
        return { success: true }
      } catch (error: any) {
        this.error = error.data?.message || 'Failed to update collection'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async addPack(packCode: string, quantity: number = 1) {
      const existingPack = this.collection.find(item => item.packCode === packCode)
      
      if (existingPack) {
        return this.updateCollection([
          { packCode, quantity: existingPack.quantity + quantity }
        ])
      } else {
        const pack = this.availablePacks.find(p => p.code === packCode)
        if (!pack) {
          this.error = 'Pack not found'
          return { success: false, error: this.error }
        }

        return this.updateCollection([
          { packCode, quantity }
        ])
      }
    },

    async removePack(packCode: string, quantity: number = 1) {
      const existingPack = this.collection.find(item => item.packCode === packCode)
      
      if (!existingPack) {
        this.error = 'Pack not in collection'
        return { success: false, error: this.error }
      }

      const newQuantity = Math.max(0, existingPack.quantity - quantity)
      return this.updateCollection([
        { packCode, quantity: newQuantity }
      ])
    }
  }
})