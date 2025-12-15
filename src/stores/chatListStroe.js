import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/chatListApi.js'

export const useChatRoomStore = defineStore('chatRoom', () => {
    const loading = ref(false)
    const error = ref(null)

    const chatRoomList = ref([])

    // 내 채팅방 목록 조회
    const getMyChatRoomList = async () => {
        loading.value = true
        error.value = null
        try {
            const res = await api.getMyChatRoomList()
            chatRoomList.value = res.data ?? []
            console.log('내 채팅방 목록:', chatRoomList.value)
        } catch (e) {
            error.value = e
            throw e
        } finally {
            loading.value = false
        }
    }

    // 채팅방 목록 조회
    const getChatRoomList = async () => {
        loading.value = true
        error.value = null
        try {
            const res = await api.getChatRoomList()
            chatRoomList.value = res ?? []
            console.log('채팅방 목록:', chatRoomList.value)
        } catch (e) {
            error.value = e
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        chatRoomList,
        getChatRoomList,
        getMyChatRoomList
    }
})