<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'button' },
  color: { type: String, default: 'main' },
  disabled: Boolean,
})

const classes = computed(() => {
  if (props.disabled) {
    return 'bg-gray-300 text-white cursor-not-allowed'
  }

  switch (props.color) {
    case 'main':
      return 'bg-green-500 hover:bg-green-600 text-white'
    case 'yellow':
      return 'bg-amber-300 text-black'
    case 'gray':
      return 'bg-gray-200 text-black'
    case 'gray-300':
      return 'bg-gray-300 text-white'
    case 'blue':
      return 'bg-blue-500 hover:bg-blue-600 text-white'
    case 'green':
      return 'bg-emerald-500 hover:bg-emerald-600 text-white'
    default:
      return 'bg-gray-100 text-black'
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'mx-auto w-[340px] h-[40px] flex items-center justify-center rounded-xl font-semibold text-20 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300',
      classes,
    ]"
  >
    <slot />
  </button>
</template>
