<script setup>
const props = defineProps({
  roomId: {
    type: [Number, String], // 문자열도 받을 수 있도록 허용
    required: true,
  },
})



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

