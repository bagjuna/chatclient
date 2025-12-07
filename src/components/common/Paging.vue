<script setup>
import { Icon } from '@iconify/vue'
import { computed, defineEmits, defineProps } from 'vue'

const props = defineProps({
  totalPages: Number,
  currentPage: Number,
})

const emit = defineEmits(['goTo'])

const blockSize = 5

const blockIndex = computed(() => Math.floor((props.currentPage - 1) / blockSize))

const blockStart = computed(() => blockIndex.value * blockSize + 1)

const blockEnd = computed(() => Math.min(blockStart.value + blockSize - 1, props.totalPages))

const pages = computed(() => {
  const len = Math.max(0, blockEnd.value - blockStart.value + 1)
  return Array.from({ length: len }, (_, i) => blockStart.value + i)
})

const goTo = (p) => {
  emit('goTo', p)
}
</script>

<template>
  <div class="flex gap-2 items-center">
    <button :disabled="props.currentPage === 1" @click="goTo(props.currentPage - 1)">
      <Icon icon="material-symbols:arrow-back-ios-new-rounded" class="size-4" />
    </button>

    <button
      v-for="p in pages"
      :key="p"
      :class="{ 'text-green': p === props.currentPage }"
      @click="goTo(p)"
      class="medium text-18"
    >
      {{ p }}
    </button>

    <button :disabled="props.currentPage === props.totalPages" @click="goTo(props.currentPage + 1)">
      <icon icon="material-symbols:arrow-forward-ios-rounded" class="size-4" />
    </button>
  </div>
</template>

<style scoped></style>
