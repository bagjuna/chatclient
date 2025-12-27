import api from '@/api/indexApi.js'

const BASE_URL = '/api/chat/room'

export default {
    // 채팅방 목록 조회
    async getChatRoomList(params) {
        const res = await api.get(`${BASE_URL}/group/list`, {
                params: params
            }
        )
        return res
    },

    // 내가 속한 채팅방 목록 조회
    async getMyChatRoomList() {
        const res = await api.get(`${BASE_URL}/my/rooms`)
        return res
    },


}