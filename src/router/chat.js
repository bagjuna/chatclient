export default [
  {
    path: '/chat-room/:roomId',
    name: 'chat-room',
    component: () => import('@/views/ChatRoomView.vue'),
    props: true
  },
  // {
  //   path: 'find-password',
  //   name: 'find-password',
  //   component: () => import('@/views/FindPasswordView.vue'),
  //   meta: { title: '비밀번호 찾기' },
  // },
]
