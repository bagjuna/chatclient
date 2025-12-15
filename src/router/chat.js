export default [
  {
    path: '/chat-room/:roomId',
    name: 'chat-room',
    component: () => import('@/views/chat/ChatRoomView.vue'),
    props: true
  },
  {
    path: '/my-chat-list',
    name: 'my-chat-list',
    component: () => import('@/views/chat/MyChatList.vue'),
  }

  // {
  //   path: 'find-password',
  //   name: 'find-password',
  //   component: () => import('@/views/FindPasswordView.vue'),
  //   meta: { title: '비밀번호 찾기' },
  // },
]
