// src/api/chatRoomApi.js
import api from '@/api/indexApi.js'

export default {
    // 1. 이전 채팅 내역 조회
    async getChatHistory(roomId) {
        // indexApi의 인터셉터가 토큰을 자동으로 넣어줍니다.
        const res = await api.get(`/api/chat/history/${roomId}`);
        return res.data;
    },

    // 1-2. 채팅방 참여자 정보 조회
    async getParticipants(roomId) {
        const res = await api.get(`/api/chat/room/${roomId}/participants`);
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
    },

    // 4. 비밀번호 채팅방 입장 요청
    async joinSecretChat(roomId, password) {
        const res = await api.post(`/api/chat/room/secret/${roomId}/join`, {password});
        return res;
    },

    // 5. 채팅방 생성
    async createGroupChat({ roomName, maxParticipantCnt, isSecret, password }
    ) {
        const res = await api.post(`/api/chat/room/group/create`, {
            roomName,
            maxParticipantCnt,
            isSecret,
            password
        });
        return res;
    }
}