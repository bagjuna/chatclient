<script setup>
import { ref, watch } from 'vue'

// Props & Emits
const props = defineProps({
  selected: {
    type: String,
    default: '전체', // 기본값
  },
})
const emit = defineEmits(['update:selected'])

// State
const selectedLocal = ref(props.selected)

// 카테고리 목록
const categories = ['전체', '일대일', '단체', '안 읽은 채팅방']

// Watch
watch(
  () => props.selected,
  (v) => {
    selectedLocal.value = v
  },
)

// Methods
function selectCategory(category) {
  selectedLocal.value = category
  emit('update:selected', selectedLocal.value)
}
</script>

<template>
  <div class="flex gap-2 overflow-x-auto bg-white border-b px-3 py-2">
    <button
      v-for="category in categories"
      :key="category"
      type="button"
      class="whitespace-nowrap rounded-full border px-4 py-1 text-14 transition"
      :class="
        selectedLocal === category
          ? 'bg-main border-main text-white'
          : 'bg-white border-gray-300 text-black'
      "
      :aria-pressed="selectedLocal === category"
      @click="selectCategory(category)"
    >
      {{ category }}
    </button>
  </div>
</template>

<style scoped></style>
