import { ref } from 'vue'
import { defineStore } from 'pinia'
import { postLogin, deleteUser, kakaoLogin } from '@/api/auth.js'

export const useAuthStore = defineStore('Auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const loading = ref(false)
  const error = ref('')
  const kakakoEmail = ref('')
  const kakaoflag = ref('')

  //카카오 로그인
  const kakaoLoginApi = async (code) => {
    loading.value = true
    error.value = ''
    try {
      const res = await kakaoLogin(code)
      const { member_email, flag, access_token, refresh_token, member } = res

      console.log('⭐⭐ flag:', flag)
      kakaoflag.value = flag
      console.log('🐎🐎🐎🐎🐎🐎🐎', kakaoflag.value)

      if (flag === 'NEW_USER') {
        kakakoEmail.value = member_email
        console.log('⭐⭐⭐⭐ 피니아 kakaoEmail:', kakakoEmail)
      }

      if (!access_token || !refresh_token || !member) {
        error.value = '로그인 응답이 올바르지 않습니다.'
        return false
      }

      //기존 로그인
      accessToken.value = access_token
      refreshToken.value = refresh_token
      user.value = member
      localStorage.setItem('accessToken', access_token)
      localStorage.setItem('refreshToken', refresh_token)
      localStorage.setItem('user', JSON.stringify(member))

      return true
    } catch (err) {
      console.error('❌ 로그인 에러', err)

      const status = err.response?.status
      if (status && String(status).startsWith('4')) {
        error.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
      } else if (status && String(status).startsWith('5')) {
        error.value = '서버 오류로 로그인할 수 없습니다.'
      } else {
        error.value = '네트워크 오류로 로그인할 수 없습니다.'
      }

      return false
    } finally {
      loading.value = false
    }
  }

  // 로그인
  const loginUser = async (payload) => {
    loading.value = true
    error.value = ''

    try {
      // res = { code, message, data }
      const res = await postLogin(payload)

      if (res.code !== 200 || !res.data) {
        error.value = res.message || '로그인에 실패했습니다.'
        return false
      }

      const { access_token, refresh_token, member } = res.data

      if (!access_token || !refresh_token || !member) {
        error.value = '로그인 응답이 올바르지 않습니다.'
        return false
      }

      accessToken.value = access_token
      refreshToken.value = refresh_token
      user.value = member

      localStorage.setItem('accessToken', access_token)
      localStorage.setItem('refreshToken', refresh_token)
      localStorage.setItem('user', JSON.stringify(member))

      return true
    } catch (err) {
      console.error('❌ 로그인 에러', err)

      const status = err.response?.status
      if (status && String(status).startsWith('4')) {
        error.value = '이메일 또는 비밀번호가 올바르지 않습니다.'
      } else if (status && String(status).startsWith('5')) {
        error.value = '서버 오류로 로그인할 수 없습니다.'
      } else {
        error.value = '네트워크 오류로 로그인할 수 없습니다.'
      }

      return false
    } finally {
      loading.value = false
    }
  }

  // 로그아웃
  const logoutUser = () => {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    localStorage.clear()
  }

  // 회원 탈퇴
  const withdrawUser = async () => {
    loading.value = true
    error.value = ''
    try {
      const res = await deleteUser()
      if (res.code === 200) {
        // 토큰/유저 정보 초기화
        accessToken.value = null
        refreshToken.value = null
        user.value = null
        localStorage.clear()
        return true
      } else {
        error.value = res.message || '회원 탈퇴에 실패했습니다.'
        return false
      }
    } catch (err) {
      console.error('❌ 회원탈퇴 에러', err)
      error.value = '회원 탈퇴 중 오류가 발생했습니다.'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    accessToken,
    refreshToken,
    user,
    loading,
    error,
    kakaoflag,
    loginUser,
    logoutUser,
    withdrawUser,
    kakaoLoginApi,
    kakakoEmail,
  }
})
