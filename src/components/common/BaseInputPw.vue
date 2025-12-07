<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  id: { type: String, required: true },
  placeholder: { type: String, default: '' },
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="w-full flex items-center border rounded-2xl p-3 text-black">
    <Icon icon="lucide:lock" class="w-5 h-5 mr-2 flex-shrink-0" />

    <input
      :id="id"
      type="password"
      class="flex-1 outline-none bg-transparent placeholder-gray-200"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
