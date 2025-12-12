import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api/homeApi.js'


export const useHomeStore = defineStore('home', () => {
    const loading = ref(false)
    const error = ref(null)

    // 백엔드 HomeResponse DTO에 맞춰 상태를 정의합니다.
    const homeData = ref({})

    const getHomeData = async () => {
        loading.value = true
        error.value = null
        try {
            const res = await api.getHome()
            // 백엔드에서 반환된 전체 객체를 homeData에 할당합니다.
            homeData.value = res?.data ?? {}
        } catch (e) {
            error.value = e
        } finally {
            loading.value = false
        }
    }

    // 컴포넌트에서 필요한 상태와 함수를 반환합니다.
    return { loading, error, homeData, getHomeData }
})
