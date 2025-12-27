<script setup>
import defaultProfile from '@/assets/images/banner.png'

// Props
const props = defineProps({
  chats: { type: Array, required: true },
})

// Emits 정의 (부모에게 클릭 알림)
const emit = defineEmits(['item-click'])

function formatTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

// 클릭 시 부모에게 채팅방 객체 전달
function handleItemClick(chat) {
  emit('item-click', chat)
}
</script>

<template>
  <ul class="divide-y divide-gray-100">
    <li
        v-for="chat in chats"
        :key="chat.roomId"
        class="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
        @click="handleItemClick(chat)"
    >
      <div class="relative flex-shrink-0">
        <img
            :src="chat?.roomImage ? chat?.roomImage + '?t=' + Date.now() : defaultProfile"
            alt="프로필"
            class="w-14 h-14 rounded-2xl object-cover bg-gray-100 shadow-sm"
        />
        <div v-if="chat.isSecret" class="absolute -bottom-1 -right-1 bg-gray-700 text-white p-1 rounded-full text-[10px]">
          🔒
        </div>
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
            {{ chat.isParticipated ? chat.lastMessage || '참여 중입니다' : '참여하지 않은 채팅방입니다.' }}
          </p>
        </div>
      </div>
    </li>
  </ul>
</template>