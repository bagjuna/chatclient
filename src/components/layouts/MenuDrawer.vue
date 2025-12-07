<script setup>
import router from '@/router'
import { Icon } from '@iconify/vue'

const emit = defineEmits(['close'])
</script>

<template>
  <div class="fixed top-0 right-0 h-screen w-56 bg-gray-100 shadow-custom flex flex-col">
    <div class="h-[56px] flex items-center justify-center mt-3">
      <h3 class="semibold text-16 text-black">Menu</h3>
      <Icon
        icon="material-symbols:close-rounded"
        class="w-6 h-6 absolute right-4"
        @click="emit('close')"
      />
    </div>

    <div>
      <div
        class="border-b border-gray-200 px-4 py-3"
        @click="(router.push({ name: 'setting' }), emit('close'))"
      >
        <p class="semibold text-14 text-black">설정</p>
      </div>

      <div
        class="border-b border-gray-200 px-4 py-3"
        @click="(router.push({ name: 'announceList' }), emit('close'))"
      >
        <p class="semibold text-14 text-black">공고 리스트</p>
      </div>

      <div
        class="border-b border-gray-200 px-4 py-3"
        @click="(router.push({ name: 'festivalList' }), emit('close'))"
      >
        <p class="semibold text-14 text-black">축제 리스트</p>
      </div>

      <div
        class="border-b border-gray-200 px-4 py-3"
        @click="
          (router.push({ name: 'noticeList', query: { page: 1, q: undefined } }), emit('close'))
        "
      >
        <p class="semibold text-14 text-black">공지사항</p>
      </div>
      <div
        class="border-b border-gray-200 px-4 py-3"
        @click="(router.push({ name: 'article', query: { page: 1, q: undefined } }), emit('close'))"
      >
        <p class="semibold text-14 text-black">관련 뉴스</p>
      </div>

      <div class="border-b border-gray-200 px-4 py-3"
           @click="(router.push({ name: 'chatbot' }), emit('close'))"
      >
        <p class="semibold text-14 text-black">챗봇</p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
