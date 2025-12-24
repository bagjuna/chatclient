<script setup>
import {RouterView, useRoute} from 'vue-router'
import {computed} from "vue";
import TopNavigationBar from '@/components/layouts/TopNavigationBar.vue'
import BottomNavigationBar from '@/components/layouts/BottomNavigationBar.vue'

const route = useRoute()

const bgMap = {
  ivory: 'bg-ivory',
  gray: 'bg-[#F9FAFB]',
}

const bgColor = computed(() => bgMap[route.meta.bg] || 'bg-white')
const isChatRoom = computed(() => route.path.includes('/chat-room/'));

</script>

<template>
  <div class="font-sans flex justify-center text-black w-full h-dvh overflow-hidden">

    <div
        class="relative w-full h-dvh md:max-w-[365px] flex flex-col overflow-hidden"
        :class="bgColor"
    >
      <TopNavigationBar v-if="!isChatRoom" />

      <div class="pt-[56px] pb-[60px] flex-1 min-h-0 flex flex-col items-stretch overflow-hidden">
        <RouterView/>
      </div>

      <BottomNavigationBar/>
    </div>
  </div>
</template>
