<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'
import { Icon } from '@iconify/vue'
import MenuDrawer from './MenuDrawer.vue'

const route = useRoute()
const router = useRouter()
const pageTitle = computed(() => route.meta.title || '')

const isDrawerOpen = ref(false)
const back = computed(() => route.meta.back || '')

const goBack = () => {
  if (back.value) router.push({ name: back.value })
  else router.go(-1)
}
</script>

<template>
  <div
    class="flex flex-col justify-center bg-white h-[56px] w-full fixed top-0 z-50 md:max-w-[375px] md:mx-auto"
  >
    <div
      v-if="route.path === '/login'"
      class="flex items-center justify-between relative w-full"
    ></div>

    <div
      v-else-if="pageTitle === '회원가입' || pageTitle === '비밀번호 찾기'"
      class="flex items-center justify-between relative w-full"
    >
      <button class="ml-4" @click="goBack">
        <Icon icon="material-symbols:arrow-back-ios-rounded" class="w-6 h-6" />
      </button>
      <h3 class="bold text-16 absolute left-1/2 -translate-x-1/2 text-black">{{ pageTitle }}</h3>
    </div>

    <div
      v-else-if="pageTitle === '경상났네'"
      class="px-4 flex items-center justify-end w-full gap-3"
    >
      <h3 class="bold text-16 absolute left-1/2 -translate-x-1/2 text-black">{{ pageTitle }}</h3>

      <RouterLink to="/notifications">
        <div class="text-gray-400 flex flex-col items-center">
          <Icon icon="material-symbols:notifications-rounded" class="w-[24px] h-auto" />
        </div>
      </RouterLink>
      <button @click="isDrawerOpen = true">
        <Icon icon="material-symbols:menu-rounded" class="w-[24px] h-auto" />
      </button>
    </div>

    <div v-else class="flex items-center justify-between relative w-full">
      <button class="ml-4" @click="goBack">
        <Icon icon="material-symbols:arrow-back-ios-rounded" class="w-6 h-6" />
      </button>
      <h3 class="bold text-16 absolute left-1/2 -translate-x-1/2 text-black">{{ pageTitle }}</h3>

      <div class="flex items-center mr-4 gap-3">
        <RouterLink to="/notifications">
          <div class="text-gray-400 flex flex-col items-center">
            <Icon icon="material-symbols:notifications-rounded" class="w-[24px] h-auto" />
          </div>
        </RouterLink>
        <button @click="isDrawerOpen = true">
          <Icon icon="material-symbols:menu-rounded" class="w-[24px] h-auto" />
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div
        :class="[
          'fixed inset-0 z-[60]',
          isDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none',
        ]"
      >
        <!-- Backdrop Fade -->
        <Transition name="fade">
          <div
            v-show="isDrawerOpen"
            class="fixed inset-0 bg-black/40"
            @click.self="isDrawerOpen = false"
          />
        </Transition>

        <!-- Drawer Slide -->
        <Transition name="slide-x">
          <MenuDrawer
            v-show="isDrawerOpen"
            class="fixed top-0 right-0 h-screen w-64 bg-white shadow-lg"
            @close="isDrawerOpen = false"
          />
        </Transition>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* Backdrop Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Drawer Slide */
.slide-x-enter-active,
.slide-x-leave-active {
  transition: transform 280ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.slide-x-enter-from,
.slide-x-leave-to {
  transform: translateX(100%);
}

/* Performance hint for smoother animations */
.slide-x-enter-active,
.slide-x-leave-active {
  will-change: transform;
}
.fade-enter-active,
.fade-leave-active {
  will-change: opacity;
}
</style>
