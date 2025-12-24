// src/api/chatRoomApi.js
import api from '@/api/indexApi.js'

export default {
    // 1. 이전 채팅 내역 조회
    async getChatHistory(roomId) {
        // indexApi의 인터셉터가 토큰을 자동으로 넣어줍니다.
        const res = await api.get(`/api/chat/history/${roomId}`);
        return res.data;
    },

    // 2. 메시지 읽음 처리
    async readChatMessage(roomId) {
        const res = await api.post(`/api/chat/room/${roomId}/read`);
        return res;
    },

    // 3. 채팅방 참여 요청
    async joinGroupChat(roomId) {
        const res = await api.post(`/api/chat/room/group/${roomId}/join`);
        return res;
    }
}