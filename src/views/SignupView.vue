
<script setup>
import { reactive, ref } from 'vue';
import BaseInput from "@/components/common/BaseInput.vue";
import BaseButton from "@/components/common/BaseButton.vue";
import {useRouter} from "vue-router";
import {useAuthStore} from "@/stores/authStore.js";


const router = useRouter()
const auth = useAuthStore()
const name = ref('')
const email = ref('')
const password = ref('')

async function onSubmit() {
  auth.error = ''

  if(!name.value) {
    auth.error = '이름을 입력해주세요.'
    return
  }

  if (!email.value) {
    auth.error = '이메일을 입력해주세요.'
    return
  }

  if (!password.value || password.value.length < 4) {
    auth.error = '비밀번호를 4자 이상 입력해주세요.'
    return
  }

  const ok = await auth.signup({name: name.value, email: email.value, password: password.value })
  if (ok) await router.replace('/')
}


</script>

<template>
  <div class="w-full h-full bg-white p-3">
    <! 안내 문구 -->
    <div class="text-center mb-10">
      <h1 class="text-24 font-bold mb-2">회원가입</h1>
      <p class="text-14 text-gray-400">이름, 이메일과 비밀번호를 입력해 주세요.</p>
    </div>
    <!-- 로그인 폼 -->
    <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
      <BaseInput
          id="name"
          v-model="name"
          type="text"
          label="이름"
          placeholder="이름을 입력해주세요."
          autocomplete="name"
      />
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
        {{ auth.loading ? '회원가입 중...' : '회원가입' }}
      </BaseButton>
    </form>



    <!-- 하단 링크 -->
    <nav class="mt-10 flex justify-center gap-3 text-16 text-black">
      <RouterLink to="/find-password">비밀번호 찾기</RouterLink>
      <span> · </span>
      <RouterLink to="/login">로그인</RouterLink>
    </nav>
  </div>
</template>
