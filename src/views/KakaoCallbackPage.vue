<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore.js'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const message = ref('카카오 로그인 처리 중입니다...')

onMounted(async () => {
  const code = route.query.code?.toString()

  if (!code) {
	message.value = '인가 코드가 없어 로그인 화면으로 이동합니다.'
	await router.replace({ name: 'login' })
	return
  }

  const ok = await authStore.kakaoLoginApi(code)

  if (ok && authStore.kakaoflag === 'NEW_USER') {
	await router.replace({ name: 'signup' })
	return
  }

  if (ok) {
	await router.replace({ name: 'home' })
	return
  }

  message.value = authStore.error || '로그인 처리에 실패해 로그인 화면으로 이동합니다.'
  await router.replace({ name: 'login' })
})
</script>

<template>
  <section class="w-full h-full flex items-center justify-center px-6 bg-white">
	<p class="text-14 text-gray-500 text-center">{{ message }}</p>
  </section>
</template>

