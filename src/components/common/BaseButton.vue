<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'button' },
  color: { type: String, default: 'main' },
  disabled: Boolean,
})

const classes = computed(() => {
  console.log('Button props:', props.color, props.disabled)
  if (props.disabled) {
    return 'bg-gray-300 text-white cursor-not-allowed'
  }

  switch (props.color) {
    case 'main':
      return 'bg-main text-white'
    case 'yellow':
      return 'bg-yellow text-black'
    case 'gray':
      return 'bg-gray-200 text-black'
    case 'gray-300':
      return 'bg-gray-300 text-white'
    case 'blue':
      return 'bg-blue-200 text-white'
    case 'green':
      return 'bg-green-100 text-white'
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
      'mx-auto w-[340px] h-[40px] flex items-center justify-center rounded-xl font-semibold text-20 transition',
      classes,
    ]"
  >
    <slot />
  </button>
</template>
