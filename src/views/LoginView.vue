<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const auth = useAuthStore()
const email = ref('')
const password = ref('')

async function onSubmit() {
  auth.error = ''

  if (!email.value) {
    auth.error = '이메일을 입력해주세요.'
    return
  }
  if (!password.value) {
    auth.error = '비밀번호를 입력해주세요.'
    return
  }

  const ok = await auth.loginUser({ email: email.value, password: password.value })
  if (ok) await router.replace('/')
}

</script>

<template>
  <div class="w-full h-full bg-white p-3">
    <! 안내 문구 -->
    <div class="text-center mb-10">
      <h1 class="text-24 font-bold mb-2">로그인</h1>
      <p class="text-14 text-gray-400">이메일과 비밀번호를 입력해 주세요.</p>
    </div>
    <!-- 로그인 폼 -->
    <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
      <BaseInput
        id="email"
        v-model="email"
        type="email"
        label="이메일"
        placeholder="이메일을 입력해주세요."
        autocomplete="email"
      />

      <BaseInput
        id="password"
        v-model="password"
        type="password"
        label="비밀번호"
        placeholder="비밀번호를 입력해 주세요."
        autocomplete="current-password"
      />

      <p v-if="auth.error" role="alert" class="text-red font-bold text-10 -mt-2 mb-1">
        {{ auth.error }}
      </p>

      <BaseButton type="submit" color="blue">
        {{ auth.loading ? '로그인 중...' : '로그인' }}
      </BaseButton>
    </form>



    <!-- 하단 링크 -->
    <nav class="mt-10 flex justify-center gap-3 text-16 text-black">
      <RouterLink to="/find-password">비밀번호 찾기</RouterLink>
      <span> · </span>
      <RouterLink to="/signup">회원가입</RouterLink>
    </nav>
  </div>
</template>

<style scoped></style>
