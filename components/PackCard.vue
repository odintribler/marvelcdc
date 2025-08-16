<template>
  <div class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
    <div class="flex justify-between items-start mb-3">
      <div>
        <h4 class="text-sm font-medium text-gray-900">{{ pack.name }}</h4>
        <p class="text-xs text-gray-500">{{ formatReleaseDate(pack.released) }}</p>
      </div>
      <span
        class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
        :class="getTypeClass(pack.type)"
      >
        {{ capitalize(pack.type) }}
      </span>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <button
          @click="decrementQuantity"
          :disabled="quantity <= 0"
          class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>
        
        <div class="w-12 text-center">
          <span class="text-lg font-semibold text-gray-900">{{ quantity }}</span>
        </div>
        
        <button
          @click="incrementQuantity"
          :disabled="quantity >= 9"
          class="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      <div class="text-right">
        <div class="text-xs text-gray-500">Owned</div>
        <div 
          class="text-sm font-medium"
          :class="quantity > 0 ? 'text-green-600' : 'text-gray-400'"
        >
          {{ quantity === 0 ? 'None' : `${quantity} ${quantity === 1 ? 'copy' : 'copies'}` }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Pack {
  code: string
  name: string
  type: string
  released: string
}

interface Props {
  pack: Pack
  quantity: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  updateQuantity: [packCode: string, quantity: number]
}>()

const incrementQuantity = () => {
  if (props.quantity < 9) {
    emit('updateQuantity', props.pack.code, props.quantity + 1)
  }
}

const decrementQuantity = () => {
  if (props.quantity > 0) {
    emit('updateQuantity', props.pack.code, props.quantity - 1)
  }
}

const getTypeClass = (type: string) => {
  switch (type) {
    case 'core':
      return 'bg-red-100 text-red-800'
    case 'hero':
      return 'bg-blue-100 text-blue-800'
    case 'campaign':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const formatReleaseDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short' 
  })
}
</script>