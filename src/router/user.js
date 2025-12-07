export default [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/signup',
    name: 'signup',
    // component: () => import('@/views/SignupView.vue'),
    meta: { title: '회원가입' },
  },
  {
    path: '/find-password',
    name: 'find-password',
    // component: () => import('@/views/FindPasswordView.vue'),
    meta: { title: '비밀번호 찾기' },
  },
  {
    path: '/kakao-login',
    name: 'kakao-login',
    // component: () => import('@/views/KakaoCallbackPage.vue'),
  },
]
