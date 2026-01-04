// src/stores/chatRoomStore.js
import { defineStore } from 'pinia';
import {ref, shallowRef, computed, reactive} from 'vue';
import chatRoomApi from '@/api/chatRoomApi.js';
import SockJS from 'sockjs-client/dist/sockjs';
import { Client } from '@stomp/stompjs';

export const useChatRoomStore = defineStore('chatRoom', () => {
    // --- State ---
    const messages = ref([]);      // 채팅 메시지 리스트
    const roomInfo = reactive({
        roomId: null,
        roomName: '',
        isSecret: false,
        participantCnt: 0,
    });
    const stompClient = shallowRef(null);
    const isConnected = ref(false);
    const myEmail = ref(localStorage.getItem('email') || ''); // 내 이메일 정보
    const myName = ref(localStorage.getItem('name') || '');

    const lastReadMap = ref({}); // 예: { 'email1': 100, 'email2': 105 }

    const isReconnecting = ref(false); // 재연결 시도 중인지 여부

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
            // 1-2 . 참여자 정보 설정
            const participants = await chatRoomApi.getParticipants(roomId);

            setParticipantsInfo(participants);
            // 1-2. 읽음 처리 (HTTP)
            // await chatRoomApi.readChatMessage(roomId);

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
        stompClient.value = new Client({
            // 1. SockJS 연결 팩토리
            webSocketFactory: () => new SockJS('http://localhost:8080/api/connect'),

            // 2. 헤더 설정 (토큰 등)
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },

            // 3. 자동 재연결 설정 (5초) - 이거 하나면 재연결 로직 끝!
            reconnectDelay: 5000,

            // 4. 연결 성공 시 실행될 콜백
            onConnect: (frame) => {
                isConnected.value = true;
                console.log('소켓 연결 성공:', frame);

                // [구독]
                stompClient.value.subscribe(`/topic/${roomId}`, (tick) => {
                    const receivedMsg = JSON.parse(tick.body);
                    console.log('수신된 메시지:', receivedMsg);
                    onMessageReceived(receivedMsg, roomId);

                });

                // [입장 직후 읽음 처리 로직]
                if (messages.value.length > 0) {
                    const lastMessage = messages.value[messages.value.length - 1];
                    const lastMessageId = lastMessage.messageId || lastMessage.id;

                    if (lastMessageId) {
                        const readPayload = {
                            messageType: 'READ',
                            roomId: roomId,
                            senderEmail: myEmail.value,
                            senderName: myName.value,
                            messageId: lastMessageId
                        };
                        console.log("🚀 입장 직후 읽음 처리 전송:", readPayload);

                        stompClient.value.publish({
                            destination: `/pub/${roomId}`,
                            body: JSON.stringify(readPayload)
                        });
                    }
                }
            },

            // 5. 연결 끊김/에러 핸들링
            onStompError: (frame) => {
                console.error('브로커 에러:', frame.headers['message']);
                console.error('세부 내용:', frame.body);
                isConnected.value = false;
            },
            onWebSocketClose: () => {
                console.log('연결이 끊어졌습니다. (재연결 대기 중...)');
                isConnected.value = false;
            }
        });

        // [변경 5] 설정 끝났으니 연결 시작!
        stompClient.value.activate();

    };

    // 2-2. 참여자 정보 설정 함수
    const setParticipantsInfo = (participants) => {
        console.log("참여자 정보 설정:", participants);
        participants.forEach(p => {
            // p.member.email: 사용자 이메일
            // p.lastReadMessageId: 마지막 읽은 ID
            lastReadMap.value[p.email] = p.lastReadMessageId || 0;
        });
    };

    // 3. 메시지 수신 처리
    const onMessageReceived = (msg, roomId) => {
        console.log("🔥 소켓 수신 데이터:", msg); // 로그 필수!

        // [중요] 필드명 messageType 으로 통일
        const type = msg.messageType;

        if (type === 'TALK' || type === 'IMAGE') {
            // (A) 날짜 처리 (백엔드에서 문자열로 오는지 배열로 오는지 확인 필요)
            if (!msg.createdAt) msg.createdAt = new Date().toISOString();
            // 1. 메시지 추가
            messages.value.push(msg);

            // 2. [기존] 보낸 사람의 커서 업데이트 (본인이 보낸 거니까)
            handleReadReceipt(msg.senderEmail, msg.messageId);

            // 3. [🔥핵심 추가] 혹시 이미 다른 사람들이 이 메시지를 읽은 상태인가? (Race Condition 방지)
            // lastReadMap에 저장된 모든 사람들의 커서와 비교합니다.
            for (const [readerEmail, lastReadId] of Object.entries(lastReadMap.value)) {
                // 조건: 누군가의 커서가 이 메시지보다 뒤에 있고 + 그 사람이 보낸 게 아니라면
                if (msg.messageId <= lastReadId && msg.senderEmail !== readerEmail) {
                    if (msg.unreadCount > 0) {
                        msg.unreadCount--; // 즉시 차감
                        console.log(`♻️ 뒤늦게 온 메시지 보정: ${readerEmail}님이 이미 ${msg.messageId}번을 읽었습니다.`);
                    }
                }
            }

            // 🔥 4. 내가 받은 메시지라면, 즉시 "나 읽었어!" 라고 답장 보내기
            // 조건: 내가 보낸 메시지가 아닐 때만 (나는 이미 읽은 상태니까)
            if (msg.senderEmail !== myEmail.value) {
                const targetId = msg.messageId || msg.id;

                if (targetId) {
                    const readPayload = {
                        messageType: 'READ',
                        roomId: roomId,
                        senderEmail: myEmail.value,
                        senderName: myName.value,
                        messageId: targetId
                    };

                    stompClient.value.publish({
                        destination: `/pub/${roomId}`,
                        body: JSON.stringify(readPayload)
                    });

                    // (선택) 내 화면에서도 내 커서를 즉시 업데이트 (소켓 응답 기다리지 않고 반영)
                    // handleReadReceipt(myEmail.value, targetId);
                }
            }

        } else if (type === 'READ') { // 읽음 신호 처리
            // (C) UI 숫자 깎기
            // 서버에서 "누가(senderId), 몇번 메시지까지(messageId) 읽었는지" 보내줘야 함
            handleReadReceipt(msg.senderEmail, msg.messageId);

        }
        else if (type === 'ENTER') {
            messages.value.push({
                isSystem: true,
                content: msg.message, // DTO에 message 필드에 내용이 있는지 확인
                createdAt: new Date().toISOString()
            });
        }
    };

    const messageRead = (msg,roomId) => {
        if (msg.senderEmail !== myEmail.value) {
            const targetId = msg.messageId || msg.id;

            if (targetId) {
                const readPayload = {
                    messageType: 'READ',
                    roomId: roomId,
                    senderEmail: myEmail.value,
                    senderName: myName.value,
                    messageId: targetId
                };

                stompClient.value.publish({
                    destination: `/pub/${roomId}`,
                    body: JSON.stringify(readPayload)
                });

                // (선택) 내 화면에서도 내 커서를 즉시 업데이트 (소켓 응답 기다리지 않고 반영)
                // handleReadReceipt(myEmail.value, targetId);
            }
        }
    }


    const handleReadReceipt = (readerEmail, newReadMessageId) => {
        // 1. 이 사람이 이전에 어디까지 읽었는지 확인
        const previousReadId = lastReadMap.value[readerEmail] || 0;

        console.log(`[읽음처리] ${readerEmail}: ${previousReadId} -> ${newReadMessageId}`);

        if (newReadMessageId <= previousReadId) {
            return;
        }

        // 3. "그 사이(Gap)"에 있는 메시지들만 골라서 숫자 깎기
        messages.value.forEach((m) => {
            if (m.messageId > previousReadId && m.messageId <= newReadMessageId) {

                // 조건 1: unreadCount가 0보다 커야 함
                // 조건 2: "읽은 사람(reader)"이 "메시지 보낸 사람(sender)"과 다를 때만 깎아야 함!
                // (이유: 보낸 사람은 이미 서버에서 카운트 제외하고 보냈기 때문)
                if (m.unreadCount > 0 && m.senderEmail !== readerEmail) {
                    m.unreadCount--;
                    console.log(`   └ 메시지(ID:${m.messageId}) 숫자 감소! (By ${readerEmail})`);
                }
            }
        });

        // 4. 이 사람의 최신 위치 갱신
        lastReadMap.value[readerEmail] = newReadMessageId;
    };

    //



    // 4. 메시지 전송
    const sendMessage = (roomId, content) => {
        if (!content.trim() || !stompClient.value || !isConnected.value) return;

        const chatMessageDto = {
            messageType: 'TALK',
            roomId: roomId,
            senderEmail: myEmail.value,
            senderName: myName.value,
            message: content,
        };
        // 발행 (Publish)
        stompClient.value.publish({
            destination: `/pub/${roomId}`,
            body: JSON.stringify(chatMessageDto)
        });

    };

    // 5. 방 퇴장 (연결 종료)
    const disconnect = () => {
        if (stompClient.value) {
            stompClient.value.deactivate(); // disconnect 대신 deactivate 사용
            stompClient.value = null;
            isConnected.value = false;
            console.log('소켓 연결 종료');
        }
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
