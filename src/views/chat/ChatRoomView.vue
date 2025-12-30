<script setup>
import { onMounted, onUnmounted, ref, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useChatRoomStore } from '@/stores/chatRoomStore.js'; // 경로 확인
import defaultProfile from '@/assets/images/banner.png'; // 이미지 경로 확인

// 라우터에서 roomId 가져오기 (Props로 받아도 됨)
const route = useRoute();
const roomId = route.params.roomId; // 또는 props.roomId
// 스토어 연결
const store = useChatRoomStore();

// 입력창 상태
const newMessage = ref('');
const chatAreaRef = ref(null); // 스크롤용 ref

// --- 라이프사이클 ---
onMounted(() => {
  // 방 입장 (API 호출 + 소켓 연결 모두 수행)
  store.enterRoom(roomId);
});

onUnmounted(() => {
  // 방 퇴장 (소켓 연결 해제)
  store.disconnect();
});

// --- 기능 ---
const handleSendMessage = () => {
  if (!newMessage.value.trim()) return;
  store.sendMessage(roomId, newMessage.value);
  newMessage.value = ''; // 입력창 초기화
};

// --- 스크롤 자동 이동 ---
// 메시지가 추가되면 스크롤을 맨 아래로 이동
watch(
    () => store.messages.length,
    async () => {
      await nextTick();
      scrollToBottom();
    }
);

const scrollToBottom = () => {
  const chatArea = document.querySelector('.chat-area');
  if (chatArea) {
    chatArea.scrollTop = chatArea.scrollHeight;
  }
};

// 날짜 포맷 (템플릿용)
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  return new Date(dateString).toLocaleDateString('ko-KR', options);
};
</script>

<template>
<!--  <div class="flex flex-col h-[100dvh] bg-white relative z-[50]">-->
    <div class="flex flex-col h-full bg-white relative z-[50]">
      <div class="flex-none bg-white border-b z-10 w-full">
        <div class="flex items-center justify-between px-4 pb-3 pt-4 md:pt-6">

          <div class="flex items-center gap-3 min-w-0"> <button @click="$router.back()" class="text-gray-600 p-1 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

            <h1 class="font-bold text-lg truncate">{{ store.roomInfo.roomName }}</h1>
          </div>

          <h2 class="font-bold text-lg whitespace-nowrap ml-4">
            {{ store.roomInfo.participantCnt }} 명
          </h2>

        </div>
      </div>

      <main class="flex-1 overflow-y-auto p-4 pb-24 bg-slate-50 chat-area">
        <div v-for="(messagesInDate, date) in store.groupedMessages" :key="date">
          <div class="my-6 text-center">
            <span class="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                {{ formatDate(date) }}
            </span>
          </div>

          <div v-for="msg in messagesInDate" :key="msg.id" class="mb-4 flex flex-col">

            <div v-if="msg.senderEmail !== store.myEmail" class="flex items-end self-start max-w-[75%]">
              <div class="mr-2 flex-shrink-0 h-9 w-9 rounded-full bg-gray-300 overflow-hidden border border-gray-200">
                <img :src="defaultProfile" class="w-full h-full object-cover" />
              </div>

              <div class="flex flex-col items-start">
                <p class="text-sm text-gray-900 mb-1">
                  {{ msg.senderName }}
                </p>
                <div class="rounded-2xl rounded-tl-none bg-white px-4 py-2 shadow-sm border border-gray-100">
                  <p class="text-sm text-gray-800 break-words leading-relaxed">{{ msg.message }}</p>
                </div>
              </div>

              <div class="ml-2 flex flex-col items-start justify-end flex-shrink-0 mb-1">
              <span v-if="msg.unreadCount > 0" class="text-[10px] font-bold text-yellow-500 mb-0.5">
                {{ msg.unreadCount }}
              </span>
                <span class="text-[10px] text-gray-400">
                {{ new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
              </span>
              </div>
            </div>

            <div v-else class="flex items-end self-end max-w-[75%] justify-end">

              <div class="mr-2 flex flex-col items-end justify-end flex-shrink-0 mb-1">
              <span v-if="msg.unreadCount > 0" class="text-[10px] font-bold text-yellow-500 mb-0.5">
                {{ msg.unreadCount }}
              </span>
                <span class="text-[10px] text-gray-400">
                {{ new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
              </span>
              </div>

              <div class="rounded-2xl rounded-tr-none bg-green-500 px-4 py-2 text-white shadow-md">
                <p class="text-sm break-words leading-relaxed">{{ msg.message }}</p>
              </div>
            </div>

          </div>
        </div>
      </main>

    <footer class="flex-none w-full bg-white p-3 border-t pb-4 md:pb-6 z-20 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div class="flex items-center gap-2">
        <input
            v-model="newMessage"
            type="text"
            placeholder="메시지를 입력하세요"
            @keyup.enter="handleSendMessage"
            class="flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-200 transition"
        />
        <button
            @click="handleSendMessage"
            :disabled="!newMessage.trim()"
            class="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white transition hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.chat-area::-webkit-scrollbar {
  width: 8px;
}

.chat-area::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-area::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.chat-area::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.read-status {
  position: absolute;
  top: 6px;
  right: 12px;
  font-size: 0.75rem;
  color: #a3a3a3;
}
</style>

