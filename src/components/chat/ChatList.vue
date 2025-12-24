<script setup>
import { useRouter } from 'vue-router'
import defaultProfile from '@/assets/images/banner.png'

// Props
const props = defineProps({
  chats: {
    type: Array,
    required: true,
  },
})

// Emits
const emit = defineEmits(['select'])

// Router
const router = useRouter()

// 시각 포맷 (ISO → HH:mm)
function formatTime(timeStr) {
  const date = new Date(timeStr)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 특정 채팅방으로 이동
function goToChatRoom(roomId) {
  router.push(`/chat-room/${roomId}`)
  emit('select', roomId)
}
</script>
<template>
  <ul class="divide-y divide-gray-100">
    <li
        v-for="chat in chats"
        :key="chat.roomId"
        class="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
        @click="goToChatRoom(chat.roomId)"
    >
      <div class="relative flex-shrink-0">
        <img
            :src="chat?.roomImage ? chat?.roomImage + '?t=' + Date.now() : defaultProfile"
            alt="프로필"
            class="w-14 h-14 rounded-2xl object-cover bg-gray-100 shadow-sm"
        />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex justify-between items-center mb-1">
          <p class="font-bold text-[16px] text-gray-900 truncate">
            {{ chat.roomName || chat.name }}
          </p>
          <span class="text-[12px] text-gray-400 whitespace-nowrap ml-2">
            {{ formatTime(chat.lastMessageTime) }}
          </span>
        </div>

        <div class="flex justify-between items-end">
          <p class="text-[14px] text-gray-500 truncate pr-4">
            {{ chat.lastMessage || '메시지가 없습니다.' }}
          </p>

          <div
              v-if="chat.unReadCount > 0"
              class="min-w-[20px] h-[20px] px-1.5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-subtle"
          >
            {{ chat.unReadCount > 99 ? '99+' : chat.unReadCount }}
          </div>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
/* 텍스트가 너무 길 때 말줄임표 처리 */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 약간의 애니메이션 효과 (선택사항) */
@keyframes pulse-subtle {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
.animate-pulse-subtle {
  /* 새로운 메시지 강조를 원할 경우 추가 */
}
</style>
