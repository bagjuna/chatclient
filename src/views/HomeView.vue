<script setup>

import {computed, onMounted} from "vue";
import {useHomeStore} from "@/stores/homeStore.js";
import {storeToRefs} from "pinia";


// Pinia 스토어를 사용합니다.
const homeStore = useHomeStore()

// Pinia 스토어의 상태를 Vue 컴포넌트에서 사용하도록 연결합니다.
const loading = computed(() => homeStore.loading)
const error = computed(() => homeStore.error)
const {homeData} = storeToRefs(homeStore);
// 컴포넌트가 마운트될 때 API를 호출합니다.
onMounted(async () => {
  await homeStore.getHomeData()
  if (homeStore.error) {
    console.error('❌ 홈 데이터 불러오기 실패')
  }
})

</script>

<template>
  <div>
    HomeView
  </div>
</template>
