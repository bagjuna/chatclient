import { ref } from 'vue'
import { defineStore } from 'pinia'
import {postLogin, deleteUser, kakaoLogin, postSignup} from '@/api/authApi.js'

export const useAuthStore = defineStore('Auth', () => {
  const accessToken = ref(localStorage.getItem('accessToken') || null)
  // const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const email = ref(localStorage.getItem('email') || null)
  const name = ref(localStorage.getItem('name') || null)
  const loading = ref(false)
  const error = ref('')
  const kakakoEmail = ref('')
  const kakaoflag = ref('')

  // TODO 카카오 로그인
  const kakaoLoginApi = async (code) => {
    loading.value = true
    error.value = ''

    try {
      const res = await kakaoLogin(code)
      const { member_email, flag, accessToken, member } = res

      console.log('⭐⭐ flag:', flag)
      kakaoflag.value = flag
      console.log('🐎🐎🐎🐎🐎🐎🐎', kakaoflag.value)

      if (flag === 'NEW_USER') {
        kakakoEmail.value = member_email
        console.log('⭐⭐⭐⭐ 피니아 kakaoEmail:', kakakoEmail)
      }

      if (!accessToken || !member) {
        error.value = '로그인 응답이 올바르지 않습니다.'
        return false
      }

      //기존 로그인
      accessToken.value = accessToken
      localStorage.setItem('accessToken', accessToken)

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


  // 회원가입
  const signup = async (payload) => {
    loading.value = true
    error.value = ''

    try {
        const res = await postSignup(payload)
        console.log('🚀 회원가입 응답:', res)

        if (res.status !== 200 || !res.data) {
            error.value = '회원가입에 실패했습니다.'
            return false
        }

        return true
    }catch (error) {
        console.error('❌ 회원가입 에러', error)
        error.value = '회원가입 중 오류가 발생했습니다.'
        return false
    }finally {
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
      console.log('🚀 로그인 응답:', res)

      // 방어 코드: 데이터가 없으면 실패 처리
      if (res.status !== 200 || !res.data) {
        error.value = '로그인에 실패했습니다.'
        return false
      }

      const { accessToken: newAccessToken, name: newName, email: newEmail } = res.data

      if (!newAccessToken || !newName || !newEmail) {
        error.value = '로그인 응답이 올바르지 않습니다.'
        return false
      }

      accessToken.value = newAccessToken
      name.value = newName
      email.value = newEmail

      // 로컬 스토리지 저장
      localStorage.setItem('accessToken', newAccessToken)
      localStorage.setItem('name', newName)
      localStorage.setItem('email', newEmail)

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
    email.value = null
    name.value = null
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
    name,
    loading,
    error,
    kakaoflag,
    signup,
    loginUser,
    logoutUser,
    withdrawUser,
    kakaoLoginApi,
    kakakoEmail,
  }
})
