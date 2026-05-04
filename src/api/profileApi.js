import api from '@/api/indexApi.js'

const BASE_URL = '/api/info'


// 프로필 이미지 조회
export const getProfileImage = async () => {
  const res = await api.get(`${BASE_URL}/profile-image`)
  return res.data
}

// 프로필 이미지 업로드 (multipart/form-data)
export const uploadProfileImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

    const res = await api.post(`${BASE_URL}/profile-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

