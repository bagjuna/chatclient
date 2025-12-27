
<script setup>
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useChatListStore } from '@/stores/chatListStroe.js'
import chatRoomApi from '@/api/chatRoomApi.js';

import ChatList from '@/components/search/ChatSearchList.vue'
import SecretChatModal from '@/components/search/SecretChatModal.vue'
import PublicChatModal from "@/components/search/PublicChatModal.vue";
import CreateChatModal from "@/components/search/CreateChatModal.vue";

const router = useRouter()
const chatStore = useChatListStore()
const { chatRoomList, loading, hasMore } = storeToRefs(chatStore)



// --- 상태 관리 ---
const searchText = ref('')
const selectedFilter = ref('전체')
const scrollContainer = ref(null) // 스크롤 감지할 div 참조

// 비밀번호 팝업 상태
const isSecretModalOpen = ref(false)
const targetSecretRoomId = ref(null)

// 공개방 입장 팝업 상태
const isPublicModalOpen = ref(false)
const targetPublicRoomId = ref(null)

// 생성 모달 상태
const isCreateModalOpen = ref(false)

// --- API 조회 로직 ---
// isReset: true면 검색조건 변경으로 인한 초기화, false면 스크롤로 인한 추가 로드
const fetchRooms = async (isReset = false) => {
  const params = {
    size: 10, // 한 번에 가져올 개수
    roomName: searchText.value || null,
  }

  // 필터 로직
  await chatStore.getChatRoomList(params, isReset)
}

// 검색어/필터 변경 시 -> 목록 초기화 및 새로 조회
watch([selectedFilter, searchText], () => {
  fetchRooms(true) // true: 초기화
})

// 마운트 시 초기 조회
onMounted(() => {
  fetchRooms(true)
})

// --- 무한 스크롤 이벤트 핸들러 ---
const onScroll = (e) => {
  const { scrollTop, clientHeight, scrollHeight } = e.target


  // 바닥에서 50px 정도 남았을 때 미리 로딩
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    // 로딩 중이 아니고, 더 가져올 데이터가 있을 때만 실행
    if (!loading.value && hasMore.value) {
      console.log("다음 페이지 로드...")
      fetchRooms(false) // false: 이어 붙이기
    }
  }
}

// --- 이벤트 핸들러 ---

// 1. 리스트 아이템 클릭 시
const onChatClick = (chat) => {
  if(chat.isParticipated) {
    // 일반방이면 바로 이동
    router.push(`/chat-room/${chat.roomId}`)
  }
  else if (chat.isSecret) {
    // 비밀방이면 팝업 열기
    targetSecretRoomId.value = chat.roomId
    isSecretModalOpen.value = true
  }else if(!chat.isSecret) {
    // 공개방이면 PublicModal 열기
    targetPublicRoomId.value = chat.roomId
    isPublicModalOpen.value = true
    console.log(`공개방(${targetPublicRoomId.value}) 입장 시도`)
  }
}

// 2-1. 비밀번호 입력 완료 시
const onPasswordConfirm = async (password) => {
  try {
    // TODO: 백엔드에 비밀번호 검증 API 호출 (예: /chat/join)
    await chatRoomApi.joinSecretChat(targetSecretRoomId.value, password)

    // 검증 성공 시 이동
    console.log(`방(${targetSecretRoomId.value}) 입장 시도, 비번: ${password}`)
    isSecretModalOpen.value = false
    router.push(`/chat-room/${targetSecretRoomId.value}`)

  } catch (error) {
    alert('비밀번호가 일치하지 않습니다.')
  }
}

// 2-2. 공개방 입장 확인 시 (모달에서 바로 처리)
const onPublicRoomConfirm = async () => {
  console.log(`공개방(${targetPublicRoomId.value}) 입장 확인`)
  await chatRoomApi.joinGroupChat(targetPublicRoomId.value)
  isPublicModalOpen.value = false
  router.push(`/chat-room/${targetPublicRoomId.value}`)
}

// 채팅방 생성 처리 함수
const onCreateChatConfirm = async (newRoomData) => {
  try {
    // API 호출 (백엔드 스펙에 맞게 파라미터 전달)
    // 예: POST /group/create
    const res = await chatRoomApi.createGroupChat({
      roomName: newRoomData.roomName,
      maxParticipantCnt: newRoomData.maxParticipantCnt,
      isSecret: newRoomData.isSecret,
      password: newRoomData.password
    })

    // 성공 시 모달 닫기
    isCreateModalOpen.value = false

    // 생성된 방의 ID를 받아서 바로 이동 (UX 상 이게 제일 자연스러움)
    // 백엔드 응답이 생성된 방 ID를 준다고 가정 (res.data.roomId 또는 res.data)
    const newRoomId = res.data?.roomId || res.data

    if (newRoomId) {
      console.log(`채팅방 생성 완료 -> 이동: ${newRoomId}`)
      router.push(`/chat-room/${newRoomId}`)
    } else {
      // ID를 안 준다면 목록 새로고침
      fetchRooms(true)
    }

  } catch (error) {
    console.error(error)
    alert('채팅방 생성에 실패했습니다.')
  }
}

</script>
<template>

  <div class="flex flex-col h-full bg-white">

    <div class="p-3 border-b bg-white">
      <input
          v-model="searchText"
          type="text"
          placeholder="채팅방 이름 검색..."
          class="w-full bg-gray-100 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
          @keyup.enter="fetchRooms(true)"
      />
    </div>

    <div
        ref="scrollContainer"
        class="flex-1 overflow-y-auto relative"
        @scroll="onScroll"
    >
      <button
          class="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 z-20"
          @click="isCreateModalOpen = true"
          aria-label="채팅방 만들기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-8 h-8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
      <div v-if="loading && chatRoomList.length === 0" class="absolute inset-0 flex items-center justify-center bg-white z-10">
        <span class="text-gray-400">Loading...</span>
      </div>

      <ChatList
          :chats="chatRoomList"
          @item-click="onChatClick"
      />

      <div v-if="loading && chatRoomList.length > 0" class="py-4 text-center">
        <span class="text-gray-400 text-sm">추가 로딩 중...</span>
      </div>

      <div v-if="!loading && chatRoomList.length === 0" class="text-center py-10 text-gray-500">
        검색 결과가 없습니다.
      </div>
    </div>

    <SecretChatModal
        :visible="isSecretModalOpen"
        @close="isSecretModalOpen = false"
        @confirm="onPasswordConfirm"
    />
    <PublicChatModal
        :visible="isPublicModalOpen"
        @close="isPublicModalOpen = false"
        @confirm="onPublicRoomConfirm"
    />
    <CreateChatModal
        :visible="isCreateModalOpen"
        @close="isCreateModalOpen = false"
        @create="onCreateChatConfirm"
    />
  </div>
</template>