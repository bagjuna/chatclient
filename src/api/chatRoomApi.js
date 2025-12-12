import api from '@/api/index.js'

const BASE_URL = '/chat/room'

export default {
    // 채팅방 목록 조회
    async getChatRoomList() {
        const res = await api.get(`${BASE_URL}/group/list`)
        return res
    },


}