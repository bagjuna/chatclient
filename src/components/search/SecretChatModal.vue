<script setup>
import {ref} from 'vue'

const props = defineProps({
  visible: Boolean,
})

const emit = defineEmits(['close', 'confirm'])

const password = ref('')

function onConfirm() {
  if (!password.value) return alert('비밀번호를 입력해주세요.')
  emit('confirm', password.value)
  password.value = '' // 초기화
}

function onClose() {
  password.value = ''
  emit('close')
}
</script>

<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div class="bg-white rounded-lg p-6 w-[300px] shadow-lg">
        <h3 class="text-lg font-bold mb-4">비밀 채팅방 입장</h3>
        <p class="text-sm text-gray-600 mb-2">비밀번호를 입력하세요.</p>

        <input
            v-model="password"
            type="password"
            class="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:border-main"
            placeholder="비밀번호"
            @keyup.enter="onConfirm"
        />

        <div class="flex gap-2 justify-end">
          <button
              @click="onClose"
              class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded"
          >
            취소
          </button>
          <button
              @click="onConfirm"
              class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            확인
          </button>
        </div>
      </div>
    </div>
</template>