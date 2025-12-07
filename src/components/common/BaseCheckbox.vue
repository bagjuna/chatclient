<script setup>
import { Icon } from '@iconify/vue'

defineProps({
  modelValue: Boolean,
  label: String,
})

defineEmits(['update:modelValue'])
</script>

<template>
  <label class="flex items-center gap-2 cursor-pointer select-none">
    <div
      class="w-5 h-5 flex items-center justify-center rounded-full transition-colors"
      :class="modelValue ? 'bg-blue' : 'bg-gray-200'"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <Icon icon="material-symbols:check" class="text-white w-4 h-4" />
    </div>
    <span class="text-14 text-gray-400">
      {{ label }}
    </span>
  </label>
</template>
