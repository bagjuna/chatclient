import api from './indexApi.js'

const BASE_URL = '/home'
export default {
  async getHome() {
    const res = await api.get('/test/authenticated')  // 수정된 부분
    return res
  }

}
