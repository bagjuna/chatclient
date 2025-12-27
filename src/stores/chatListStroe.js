import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/chatListApi.js'

export const useChatListStore = defineStore('chatList', () => {
    const loading = ref(false)
    const error = ref(null)

    const chatRoomList = ref([])

    // 페이징 상태 관리
    const currentPage = ref(1)
    const hasMore = ref(true) // 더 불러올 데이터가 있는지 여부

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
    const getChatRoomList = async (
        params, isReset = false
    ) => {
        if (loading.value) return // 이미 로딩 중이면 중복 호출 방지

        loading.value = true
        error.value = null

        // 검색 필터가 바뀌어서 새로 조회하는 경우 (isReset = true)
        if (isReset) {
            currentPage.value = 1
            chatRoomList.value = []
            hasMore.value = true
        }

        // 파라미터에 현재 페이지 번호 주입
        const requestParams = {...params, page: currentPage.value}

        try {
            const res = await api.getChatRoomList(requestParams)

            // res.data가 실제 백엔드의 PageResponseDTO 입니다.
            // 구조: { list: [...], total: 3, pageRequestDTO: {...} }
            const data = res.data
            const newItems = data.list || []

            if (isReset) {
                chatRoomList.value = newItems
            } else {
                // 기존 목록에 이어 붙이기
                chatRoomList.value = [...chatRoomList.value, ...newItems]
            }

            // 다음 페이지가 있는지 계산 (가져온 개수가 요청한 size보다 적으면 끝난 것)
            // 혹은 total 값과 비교해도 됩니다.
            if (newItems.length < (params.size || 10)) {
                hasMore.value = false
            } else {
                currentPage.value++ // 다음 호출을 위해 페이지 번호 증가
            }

            console.log('채팅방 목록 갱신:', chatRoomList.value)

        } catch (e) {
            error.value = e
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        hasMore,
        chatRoomList,
        getChatRoomList,
        getMyChatRoomList
    }
})