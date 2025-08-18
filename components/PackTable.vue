<template>
  <div class="pack-table-container">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Pack Name
          </th>
          <th scope="col" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
            Type
          </th>
          <th scope="col" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
            Released
          </th>
          <th scope="col" class="px-3 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Quantity
          </th>
          <th scope="col" class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
            Status
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr
          v-for="pack in packs"
          :key="pack.code"
          class="hover:bg-gray-50 transition-colors"
        >
          <!-- Pack Name -->
          <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium text-gray-900">{{ pack.name }}</div>
            <!-- Show type and status on mobile when other columns are hidden -->
            <div class="md:hidden mt-1 flex items-center space-x-2">
              <span
                class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium"
                :class="getTypeClass(pack.type)"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full mr-1"
                  :class="getTypeDotClass(pack.type)"
                ></span>
                {{ capitalize(pack.type) }}
              </span>
              <!-- Show status on mobile -->
              <span class="sm:hidden text-xs font-medium" :class="getPackQuantity(pack.code) > 0 ? 'text-green-600' : 'text-gray-400'">
                <span class="w-1.5 h-1.5 rounded-full mr-1 inline-block" :class="getPackQuantity(pack.code) > 0 ? 'bg-green-500' : 'bg-gray-300'"></span>
                {{ getQuantity(pack.code) === 0 ? 'Not Owned' : `${getQuantity(pack.code)} ${getQuantity(pack.code) === 1 ? 'copy' : 'copies'}` }}
              </span>
            </div>
          </td>

          <!-- Type Badge -->
          <td class="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              :class="getTypeClass(pack.type)"
            >
              <span
                class="w-2 h-2 rounded-full mr-1"
                :class="getTypeDotClass(pack.type)"
              ></span>
              {{ capitalize(pack.type) }}
            </span>
          </td>

          <!-- Release Date -->
          <td class="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
            <div class="text-sm text-gray-900">{{ formatReleaseDate(pack.released) }}</div>
          </td>

          <!-- Quantity Controls -->
          <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
            <div class="flex items-center justify-center space-x-1 sm:space-x-2">
              <button
                @click="decrementQuantity(pack.code)"
                :disabled="getPackQuantity(pack.code) <= 0"
                class="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :aria-label="`Decrease quantity for ${pack.name}`"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              
              <input
                :value="getPackQuantity(pack.code)"
                @input="updateQuantityDirect(pack.code, $event)"
                @blur="validateQuantityInput(pack.code, $event)"
                type="number"
                min="0"
                max="9"
                class="w-12 h-8 sm:h-auto text-center text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                :aria-label="`Quantity for ${pack.name}`"
              />
              
              <button
                @click="incrementQuantity(pack.code)"
                :disabled="getPackQuantity(pack.code) >= 9"
                class="w-8 h-8 sm:w-7 sm:h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                :aria-label="`Increase quantity for ${pack.name}`"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </td>

          <!-- Status -->
          <td class="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
            <div 
              class="text-sm font-medium"
              :class="getPackQuantity(pack.code) > 0 ? 'text-green-600' : 'text-gray-400'"
            >
              <div class="flex items-center">
                <span
                  class="w-2 h-2 rounded-full mr-2"
                  :class="getPackQuantity(pack.code) > 0 ? 'bg-green-500' : 'bg-gray-300'"
                ></span>
                {{ getQuantity(pack.code) === 0 ? 'Not Owned' : `${getQuantity(pack.code)} ${getQuantity(pack.code) === 1 ? 'copy' : 'copies'}` }}
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
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
  packs: Pack[]
  getPackQuantity: (packCode: string) => number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  updateQuantity: [packCode: string, quantity: number]
}>()

const incrementQuantity = (packCode: string) => {
  const currentQuantity = props.getPackQuantity(packCode)
  if (currentQuantity < 9) {
    emit('updateQuantity', packCode, currentQuantity + 1)
  }
}

const decrementQuantity = (packCode: string) => {
  const currentQuantity = props.getPackQuantity(packCode)
  if (currentQuantity > 0) {
    emit('updateQuantity', packCode, currentQuantity - 1)
  }
}

const updateQuantityDirect = (packCode: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value) || 0
  const clampedValue = Math.max(0, Math.min(9, value))
  emit('updateQuantity', packCode, clampedValue)
}

const validateQuantityInput = (packCode: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value) || 0
  const clampedValue = Math.max(0, Math.min(9, value))
  
  // Update the input value to the clamped value if it was invalid
  if (value !== clampedValue) {
    target.value = clampedValue.toString()
    emit('updateQuantity', packCode, clampedValue)
  }
}

const getQuantity = (packCode: string) => {
  return props.getPackQuantity(packCode)
}

const getTypeClass = (type: string) => {
  switch (type) {
    case 'core':
      return 'bg-red-50 text-red-700 border border-red-200'
    case 'hero':
      return 'bg-blue-50 text-blue-700 border border-blue-200'
    case 'campaign':
      return 'bg-purple-50 text-purple-700 border border-purple-200'
    case 'scenario':
      return 'bg-yellow-50 text-yellow-700 border border-yellow-200'
    default:
      return 'bg-gray-50 text-gray-700 border border-gray-200'
  }
}

const getTypeDotClass = (type: string) => {
  switch (type) {
    case 'core':
      return 'bg-red-500'
    case 'hero':
      return 'bg-blue-500'
    case 'campaign':
      return 'bg-purple-500'
    case 'scenario':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
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