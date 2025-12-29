import axios from 'axios';
// ⚠️ 주의: 여기서 store를 바로 import해서 쓰면 Pinia 초기화 전이라 에러날 수 있음
// 대신 로컬스토리지나 window 객체를 활용하는 게 안전합니다.

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    withCredentials: true, // ★ 핵심: 쿠키(Refresh Token) 주고받기 필수
});

// 1. 요청 인터셉터
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')

        // 토큰이 필요 없는 요청들 (화이트리스트)
        const isAuthRequest =
            config.url.includes('/auth/login') ||
            config.url.includes('/auth/signup') ||
            config.url.includes('/auth/password') ||
            config.url.includes('/email') ||
            config.url.includes('/kakao-login')

        // 토큰이 있고, 인증이 필요한 요청이면 헤더에 추가
        if (token && !isAuthRequest) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error),
)


// 2. 응답 인터셉터 (재발급 로직 핵심)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // 401 에러(토큰 만료)가 발생했고, 아직 재시도를 안 했다면
        console.log("응답 인터셉터에서 잡힌 에러:", error.response);
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // 무한 루프 방지 플래그

            try {
                // [STEP 1] AccessToken 재발급 요청
                // 주의: api.post 대신 쌩 axios 사용 (인터셉터 안 타게)
                const response = await axios.post(`${BASE_URL}/api/auth/reissue`, {}, {
                    withCredentials: true, // 쿠키(Refresh Token) 실어 보내기
                });

                // [STEP 2] 백엔드에서 받은 새 토큰 저장
                // 백엔드 응답 구조: { accessToken: "...", ... } 라고 가정
                const newAccessToken = response.data.accessToken;

                if (!newAccessToken) {
                    throw new Error("AccessToken이 응답에 없습니다.");
                }

                localStorage.setItem('accessToken', newAccessToken);

                // [STEP 3] 실패했던 원래 요청의 헤더를 새 토큰으로 교체
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                // [STEP 4] 원래 요청의 _retry 플래그 제거 (선택 사항)
                delete originalRequest._retry;

                // [STEP 5] 필요시 사용자 정보도 갱신
                localStorage.setItem('email', response.data.email || '');
                localStorage.setItem('name', response.data.name || '');
                // [STEP 6] 원래 요청 재시도
                return api(originalRequest);

            } catch (reissueError) {
                // [STEP 5] 재발급 실패 (Refresh Token도 만료됨) -> 강제 로그아웃
                console.warn("세션이 만료되었습니다. 다시 로그인해주세요.");

                // 스토어 대신 로컬스토리지 직접 삭제 (순환 참조 방지)
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                localStorage.removeItem('email');
                localStorage.removeItem('name');

                // 라우터 이동보다 window.location이 더 확실함 (앱 새로고침 효과)
                alert("세션이 만료되었습니다.");
                window.location.href = '/login';

                return Promise.reject(reissueError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;