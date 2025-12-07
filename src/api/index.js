import axios from 'axios';

const api = axios.create({
  timeout: 10000,
});


// 요청 인터셉터
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 요청 인터셉터 (토큰 자동 추가)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')

    // 로그인/비밀번호찾기/회원가입/이메일 요청에는 토큰 안 붙임
    const isAuthRequest =
      config.url.includes('/auth/login') ||
      config.url.includes('/auth/password') ||
      (config.url.includes('/auth/member-info') && config.method === 'post') ||
      config.url.includes('/email') ||
      config.url.includes('/kakao-login')
    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

export default api;
