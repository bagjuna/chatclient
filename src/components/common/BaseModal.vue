<script setup>
import BaseButton from '@/components/common/BaseButton.vue'

const props = defineProps({
  show: { type: Boolean, default: false }, // 모달 표시 여부
  title: { type: String, default: '' }, // 제목 (옵션)
  message: { type: String, required: true }, // 메시지
  confirmText: { type: String, default: '확인' }, // 확인 버튼 텍스트
  cancelText: { type: String, default: '' }, // 취소 버튼 텍스트 (없으면 버튼 미표시)
  cancelColor: { type: String, default: 'gray-100' },
  type: { type: String, default: 'alert' }, // alert, confirm 등
})
const emit = defineEmits(['confirm', 'cancel', 'close'])
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40"
  >
    <div
      class="relative w-[330px] min-h-[200px] flex flex-col justify-between p-6 bg-white rounded-xl"
    >
      <!-- 닫기 버튼 -->
      <button @click="$emit('close')" class="absolute top-2 right-2 text-black">✕</button>

      <!-- 제목 -->
      <div v-if="title" class="text-lg font-bold text-center mb-2">
        {{ title }}
      </div>

      <!-- 메시지 -->
      <div class="flex flex-1 items-center justify-center">
        <p class="font-medium text-16 text-center whitespace-pre-line">
          {{ message }}
        </p>
      </div>

      <!-- 버튼 영역 -->
      <div class="flex justify-center gap-3 mt-4">
        <BaseButton
          v-if="cancelText"
          :color="cancelColor"
          class="w-[120px]"
          @click="$emit('cancel')"
        >
          {{ cancelText }}
        </BaseButton>
        <BaseButton color="main" class="w-[120px]" @click="$emit('confirm')">
          {{ confirmText }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
