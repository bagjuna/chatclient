<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore.js'
import BaseButton from '@/components/common/BaseButton.vue'

const authStore = useAuthStore()

const profileImage = ref(localStorage.getItem('profileImage') || '')
const selectedFileName = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const fileInputRef = ref(null)

const userName = computed(() => authStore.name || localStorage.getItem('name') || '-')
const userEmail = computed(() => authStore.email || localStorage.getItem('email') || '-')
const avatarFallback = computed(() => {
  const text = userName.value || ''
  return text.trim().charAt(0) || '?'
})

function openFilePicker() {
  fileInputRef.value?.click()
}

function handleFileChange(event) {
  const file = event.target.files?.[0]

  errorMessage.value = ''
  successMessage.value = ''

  if (!file) return

  if (!file.type.startsWith('image/')) {
    errorMessage.value = '이미지 파일만 업로드할 수 있어요.'
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    errorMessage.value = '이미지는 5MB 이하만 업로드할 수 있어요.'
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    profileImage.value = String(reader.result || '')
    selectedFileName.value = file.name
    localStorage.setItem('profileImage', profileImage.value)
    successMessage.value = '프로필 이미지가 변경되었어요.'
  }
  reader.onerror = () => {
    errorMessage.value = '이미지 파일을 읽는 중 오류가 발생했어요.'
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <section class="w-full h-full overflow-y-auto p-4 bg-white">
    <div class="rounded-2xl border border-gray-200 p-4">
      <h2 class="semibold text-16 text-black">내 정보</h2>

      <div class="mt-5 flex items-center gap-4">
        <div
          v-if="profileImage"
          class="w-20 h-20 rounded-full bg-cover bg-center border border-gray-200"
          :style="{ backgroundImage: `url(${profileImage})` }"
        />
        <div
          v-else
          class="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center semibold text-24 text-gray-500"
        >
          {{ avatarFallback }}
        </div>

        <div class="flex-1 min-w-0">
          <p class="semibold text-14 text-black truncate">{{ userName }}</p>
          <p class="medium text-12 text-gray-500 truncate">{{ userEmail }}</p>
        </div>
      </div>

      <div class="mt-6">
        <BaseButton color="main" class="w-full max-w-[340px] h-10 text-14" @click="openFilePicker">
          이미지 변경
        </BaseButton>
        <input
          id="profile-image-input"
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileChange"
        />

        <p v-if="selectedFileName" class="mt-2 text-12 text-gray-500 truncate">
          선택한 파일: {{ selectedFileName }}
        </p>
        <p v-if="errorMessage" class="mt-2 text-12 text-red">{{ errorMessage }}</p>
        <p v-if="successMessage" class="mt-2 text-12 text-green-600">{{ successMessage }}</p>
      </div>
    </div>
  </section>
</template>

