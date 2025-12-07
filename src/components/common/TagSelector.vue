<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  tags: {
    type: Array,
    required: true,
  },
  filter: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:filter'])
</script>

<template>
  <div class="flex gap-[0.3rem]">
    <button
      v-for="tag in props.tags"
      :key="tag"
      class="whitespace-nowrap rounded-[0.5rem] border px-2 py-1 text-12 transition semibold"
      :class="
        filter === tag.value
          ? 'bg-main border-main text-white'
          : 'bg-white border-gray-200 text-black'
      "
      @click="emit('update:filter', tag.value)"
    >
      {{ tag.label }}
    </button>
  </div>
</template>

<style scoped></style>
