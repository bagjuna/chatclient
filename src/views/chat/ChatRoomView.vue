<script setup>
import { reactive, onMounted, onUnmounted, computed, nextTick, ref } from 'vue';
import Stomp from 'webstomp-client';
import SockJS from 'sockjs-client/dist/sockjs'
import axios from 'axios';

// 1. Props 정의
const props = defineProps({
  roomId: {
    type: [Number, String],
    required: true,
  },
});

// 2. 상태 관리 (State)
const state = reactive({
  chatRoom: {
    bussinessName: '로딩중...', // 초기값
    memberBadge: '',
    sosType: '',
    isOwner: false,
    isComplete: false,
    partnerImage: '', // 상대방 이미지 URL
  },
  user: {
    memberEmail: 'myuser@example.com', // [중요] 실제 로그인한 유저 이메일로 교체 필요 (Pinia/Vuex 등에서 가져오기)
  },
  messages: [], // 채팅 메시지 리스트
  newMessage: '', // 입력창 데이터
  stompClient: null, // STOMP 클라이언트 객체
});

// 기본 프로필 이미지 (이미지가 없을 경우)
const defaultProfile = 'https://via.placeholder.com/50';

// 3. Computed: 메시지 날짜별 그룹화 (템플릿에서 사용됨)
const groupedMessages = computed(() => {
  const groups = {};
  state.messages.forEach((msg) => {
    // 날짜 포맷 (YYYY-MM-DD) 추출
    const dateStr = new Date(msg.createdAt).toISOString().split('T')[0];
    if (!groups[dateStr]) {
      groups[dateStr] = [];
    }
    groups[dateStr].push(msg);
  });
  return groups;
});

// 4. 날짜 포맷 함수 (템플릿에서 사용됨)
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  return new Date(dateString).toLocaleDateString('ko-KR', options);
};

// 텍스트 매핑 (sosType 등)
const sosTypeKorean = computed(() => {
  // 예시 로직
  return state.chatRoom.sosType === 'URGENT' ? '긴급' : '일반';
});

const completionButtonText = computed(() => {
  return state.chatRoom.isComplete ? '완료됨' : '완료하기';
});

// 5. 스크롤 하단 이동 함수
const chatAreaRef = ref(null); // main 태그에 ref="chatAreaRef" 추가 필요 (템플릿 수정 필요)
const scrollToBottom = async () => {
  await nextTick();
  const chatArea = document.querySelector('.chat-area');
  if (chatArea) {
    chatArea.scrollTop = chatArea.scrollHeight;
  }
};

// 6. API: 채팅 기록 가져오기
const loadChatHistory = async () => {
  try {
    const response = await axios.get(`/api/chat/history/${props.roomId}`);
    // 백엔드에서 받은 데이터가 시간순 정렬되어 있다고 가정
    state.messages = response.data;
    scrollToBottom();
  } catch (error) {
    console.error('채팅 기록 로드 실패:', error);
  }
};

// 7. WebSocket (STOMP) 연결 설정
const connectWebSocket = () => {
  // SockJS 엔드포인트 (백엔드 WebSocketConfig의 registry.addEndpoint("/ws-stomp") 와 일치해야 함)
  const socket = new SockJS('http://localhost:8080/api/connect');

  state.stompClient = Stomp.over(socket);

  // 디버그 로그 끄기 (원하면 주석 해제)
  // state.stompClient.debug = () => {};

  state.stompClient.connect(
      {}, // Header (JWT 토큰 등이 필요하면 여기에 추가: { Authorization: 'Bearer ...' })
      (frame) => {
        console.log('STOMP Connected:', frame);

        // 구독 (Subscribe): 백엔드 StompController의 @SendTo("/topic/{roomId}") 와 일치
        state.stompClient.subscribe(`/topic/${props.roomId}`, (message) => {
          const receivedMsg = JSON.parse(message.body);

          // 실시간 메시지 수신 시 리스트에 추가
          // 수신된 메시지에 createdAt이 없다면 현재 시간 추가
          if(!receivedMsg.createdAt) receivedMsg.createdAt = new Date().toISOString();

          state.messages.push(receivedMsg);
          scrollToBottom();

          // 내가 보낸 메시지가 아니라면 읽음 처리 API 호출 (선택 사항)
          if (receivedMsg.senderEmail !== state.user.memberEmail) {
            markAsRead();
          }
        });
      },
      (error) => {
        console.error('STOMP Connection Error:', error);
      }
  );
};

// 8. 메시지 전송
const sendMessage = () => {
  if (!state.newMessage.trim() || !state.stompClient) return;

  const chatMessageDto = {
    roomId: props.roomId,
    senderEmail: state.user.memberEmail,
    message: state.newMessage,
    // createdAt은 백엔드에서 처리하거나 여기서 보낼 수 있음
  };

  try {
    // 발행 (Publish): 백엔드 @MessageMapping("/{roomId}") -> prefix 설정에 따라 /app/{roomId} 또는 /pub/{roomId}
    // 일반적인 Spring Boot 설정에서는 /app 또는 /pub을 prefix로 둡니다.
    // 만약 백엔드 설정에 prefix가 없다면 그냥 `/${props.roomId}` 입니다.
    state.stompClient.send(`/pub/${props.roomId}`, {}, JSON.stringify(chatMessageDto));

    state.newMessage = ''; // 입력창 초기화
  } catch (error) {
    console.error('메시지 전송 실패:', error);
  }
};

// 읽음 처리 API
const markAsRead = async () => {
  try {
    await axios.post(`/api/chat/room/${props.roomId}/read`);
  } catch (e) {
    console.error(e);
  }
};

// 모달 관련 (더미 함수)
const isCompleteModalVisible = ref(false);
const openCompleteModal = () => { isCompleteModalVisible.value = true; };
const closeCompleteModal = () => { isCompleteModalVisible.value = false; };
const handleSosComplete = () => { /* 완료 로직 */ closeCompleteModal(); };

// 라이프사이클 훅
onMounted(() => {
  // 1. 채팅방 정보 로드 (필요하다면 API 호출 추가)
  // 2. 채팅 기록 로드
  loadChatHistory();
  // 3. 소켓 연결
  connectWebSocket();
});

onUnmounted(() => {
  // 컴포넌트 해제 시 소켓 연결 종료
  if (state.stompClient && state.stompClient.connected) {
    state.stompClient.disconnect();
  }
});
</script>


<template>
  <div class="flex flex-col h-full mx-[-1rem] mt-[-1rem]">
    <div class="fixed w-full md:max-w-[365px]">
      <div class="flex items-end border-t bg-white px-4 pt-2 pb-1 shadow-sm gap-1">
        <h1 class="text-18 font-bold">{{ state.chatRoom.bussinessName }}</h1>
        <p class="text-14 text-gradient semibold">{{ state.chatRoom.memberBadge }}</p>
      </div>
      <div class="border-b bg-white px-4 pb-2">
        <div class="flex items-center justify-between">
          <div class="flex space-x-2">
            <div class="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-600">요청중</div>
            <span
                v-if="state.chatRoom.sosType"
                class="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-600"
            >
              {{ sosTypeKorean }}
            </span>
          </div>
          <button
              v-if="state.chatRoom.isOwner"
              @click="openCompleteModal"
              :disabled="state.chatRoom.isComplete"
              class="rounded-md px-4 py-2 text-sm font-bold text-white transition-colors"
              :class="{
              'bg-rose-500 hover:bg-rose-600': !state.chatRoom.isComplete,
              'bg-gray-400 cursor-not-allowed': state.chatRoom.isComplete,
            }"
          >
            {{ completionButtonText }}
          </button>
        </div>
      </div>
    </div>

    <main
        class="chat-area flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden p-4 pt-[5rem] mb-[-3.5rem]"
    >
      <div v-for="(messagesInDate, date) in groupedMessages" :key="date">
        <div class="my-4 text-center text-sm text-gray-500">
          {{ formatDate(messagesInDate[0].createdAt) }}
        </div>

        <div v-for="msg in messagesInDate" :key="msg.id" class="mb-4 flex flex-col">
          <div v-if="msg.senderEmail !== state.user.memberEmail" class="flex items-end self-start">
            <div
                class="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm"
            >
              <img
                  :src="
                  state.chatRoom.partnerImage
                    ? state.chatRoom.partnerImage + '?t=' + Date.now()
                    : defaultProfile
                "
                  alt="프로필"
                  class="w-12 h-12 rounded-md object-cover bg-gray-100 flex-shrink-0"
              />
            </div>
            <div class="max-w-xs rounded-2xl rounded-bl-none bg-white p-3 shadow-md md:max-w-md">
              <p class="text-base text-gray-800">{{ msg.content }}</p>
            </div>
            <p class="ml-2 text-xs text-gray-400">
              {{
                new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })
              }}
            </p>
          </div>

          <div v-else class="flex items-end self-end">
            <div v-if="msg.isRead === 0" class="mr-2 text-xs font-bold text-yellow-500">1</div>
            <p class="mr-2 text-xs text-gray-400">
              {{
                new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: 'numeric',
                  minute: '2-digit',
                })
              }}
            </p>
            <div
                class="max-w-xs rounded-2xl rounded-br-none bg-main p-3 text-white shadow-md md:max-w-md"
            >
              <p class="text-base">{{ msg.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <footer class="border-t bg-white p-4 fixed bottom-0 md:max-w-[365px] w-full">
      <div class="flex items-center gap-2">
        <input
            v-model="state.newMessage"
            type="text"
            placeholder="메시지 보내기"
            @keyup.enter="sendMessage"
            class="flex-1 rounded-full border-none bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <button
            @click="sendMessage"
            :disabled="!state.newMessage.trim()"
            class="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </footer>
  </div>
<!--  <chatCompleteModal-->
<!--      :show="isCompleteModalVisible"-->
<!--      :members="chatMembers"-->
<!--      @close="closeCompleteModal"-->
<!--      @confirm="handleSosComplete"-->
<!--  />-->
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

