<script setup>
import {ref, onMounted, computed} from 'vue'
import ChatList from '@/components/chat/ChatList.vue'
import {useChatRoomStore} from '@/stores/chatListStroe.js'
import {storeToRefs} from 'pinia'


const chatStore = useChatRoomStore()
const {chatRoomList, loading} = storeToRefs(chatStore)




onMounted(async () => {
  await chatStore.getMyChatRoomList()
})


</script>

<template>
  <div class="flex flex-col h-full bg-white">
    <!-- 필터바 -->

    <!-- 채팅 목록 -->
    <div class="flex-1 overflow-y-auto">
      <ChatList :chats="chatRoomList"/>
    </div>
  </div>
</template>
