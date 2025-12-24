// src/stores/chatRoomStore.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import chatRoomApi from '@/api/chatRoomApi.js';
import SockJS from 'sockjs-client/dist/sockjs';
import Stomp from 'webstomp-client'; // 또는 사용 중인 stomp 라이브러리

export const useChatRoomStore = defineStore('chatRoom', () => {
    // --- State ---
    const messages = ref([]);      // 채팅 메시지 리스트
    const roomInfo = ref({});      // 채팅방 정보 (상대방 프로필 등)
    const stompClient = ref(null); // 소켓 클라이언트
    const isConnected = ref(false);
    const myEmail = ref(localStorage.getItem('email') || ''); // 내 이메일 정보

    // --- Getters (Computed) ---
    // 날짜별 메시지 그룹화 (UI에서 쓰기 편하게 가공)
    const groupedMessages = computed(() => {
        const groups = {};
        messages.value.forEach((msg) => {
            const dateStr = new Date(msg.createdAt).toISOString().split('T')[0];
            if (!groups[dateStr]) {
                groups[dateStr] = [];
            }
            groups[dateStr].push(msg);
        });
        return groups;
    });

    // --- Actions ---

    // 1. 방 입장 (초기화)
    const enterRoom = async (roomId) => {
        messages.value = []; // 메시지 초기화
        myEmail.value = localStorage.getItem('email'); // 최신 이메일 갱신

        try {
            // 1-1. 이전 채팅 내역 불러오기 (HTTP)
            const history = await chatRoomApi.getChatHistory(roomId);
            messages.value = history;

            // 1-2. 읽음 처리 (HTTP)
            await chatRoomApi.readChatMessage(roomId);

            // 1-3. 소켓 연결
            connectWebSocket(roomId);
        } catch (error) {
            console.error('방 입장 실패:', error);
        }
    };

    // 2. 소켓 연결 로직
    const connectWebSocket = (roomId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        // 소켓 엔드포인트 설정
        const socket = new SockJS(`http://localhost:8080/api/connect?token=${token}`);
        stompClient.value = Stomp.over(socket);
        // stompClient.value.debug = () => {}; // 로그 끄려면 주석 해제

        stompClient.value.connect(
            { Authorization: `Bearer ${token}` }, // 헤더
            (frame) => {
                isConnected.value = true;
                console.log('소켓 연결 성공:', frame);

                // 구독 (Subscribe)
                stompClient.value.subscribe(`/topic/${roomId}`, (tick) => {
                    const receivedMsg = JSON.parse(tick.body);
                    onMessageReceived(receivedMsg, roomId);
                });
            },
            (error) => {
                console.error('소켓 연결 오류:', error);
                isConnected.value = false;
            }
        );
    };

    // 3. 메시지 수신 처리
    const onMessageReceived = (msg, roomId) => {
        if (!msg.createdAt) msg.createdAt = new Date().toISOString();
        messages.value.push(msg);

        // 내가 보낸 게 아니라면 읽음 처리 요청
        if (msg.senderEmail !== myEmail.value) {
            chatRoomApi.readChatMessage(roomId);
            // 주의: 너무 잦은 API 호출이 부담되면 Debounce 처리 고려
        }
    };

    // 4. 메시지 전송
    const sendMessage = (roomId, content) => {
        if (!content.trim() || !stompClient.value || !isConnected.value) return;

        const chatMessageDto = {
            roomId: roomId,
            senderEmail: myEmail.value,
            message: content,
        };

        // 발행 (Publish)
        stompClient.value.send(`/publish/${roomId}`, JSON.stringify(chatMessageDto), {});
    };

    // 5. 방 퇴장 (연결 종료)
    const disconnect = () => {
        if (stompClient.value && stompClient.value.connected) {
            stompClient.value.disconnect();
            console.log('소켓 연결 종료');
        }
        isConnected.value = false;
        messages.value = [];
    };

    return {
        messages,
        groupedMessages,
        roomInfo,
        myEmail,
        enterRoom,
        sendMessage,
        disconnect
    };
});