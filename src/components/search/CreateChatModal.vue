<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  visible: Boolean,
})

const emit = defineEmits(['close', 'create'])

// 폼 데이터 상태
const formData = reactive({
  roomName: '',
  maxParticipantCnt: 10,
  isSecret: false,
  password: ''
})

// 모달이 열릴 때마다 폼 초기화
watch(() => props.visible, (newVal) => {
  if (newVal) {
    formData.roomName = ''
    formData.maxParticipantCnt = 10
    formData.isSecret = false
    formData.password = ''
  }
})

function onSubmit() {
  if (!formData.roomName.trim()) {
    return alert('채팅방 이름을 입력해주세요.')
  }
  if (formData.isSecret && !formData.password.trim()) {
    return alert('비밀방은 비밀번호가 필수입니다.')
  }

  // 부모에게 데이터 전달
  emit('create', { ...formData })
}
</script>

<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white rounded-lg p-6 w-[320px] shadow-xl">
      <h3 class="text-lg font-bold mb-4">채팅방 만들기</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">방 이름</label>
          <input
              v-model="formData.roomName"
              type="text"
              class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="예: 축구하실 분"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">최대 인원</label>
          <input
              v-model="formData.maxParticipantCnt"
              type="number"
              min="2" max="100"
              class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div class="flex items-center gap-2">
          <input
              id="secret-check"
              v-model="formData.isSecret"
              type="checkbox"
              class="w-4 h-4 text-blue-600 rounded"
          />
          <label for="secret-check" class="text-sm text-gray-700 cursor-pointer">비밀 채팅방으로 설정</label>
        </div>

        <div v-if="formData.isSecret" class="animate-fade-in">
          <label class="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
          <input
              v-model="formData.password"
              type="password"
              class="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              placeholder="비밀번호 입력"
          />
        </div>
      </div>

      <div class="flex gap-2 justify-end mt-6">
        <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded"
        >
          취소
        </button>
        <button
            @click="onSubmit"
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
        >
          만들기
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>