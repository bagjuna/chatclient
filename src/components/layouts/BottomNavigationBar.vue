<script setup>

import {RouterLink} from 'vue-router'
import {Icon} from '@iconify/vue'
import {useRoute} from 'vue-router'
import {computed} from 'vue'

const route = useRoute()

const hiddenPrefixes = [
// '/login',
// '/message',
// '/search',
// '/call',
// '/friends'
]
const hiddenRouteNames = ['announceDocsCheckList']

const isHidden = computed(
  () =>
    hiddenPrefixes.some((prefix) => route.path.startsWith(prefix)) ||
    route.matched.some((record) => hiddenRouteNames.includes(record.name)),
)
</script>
<template>
  <div v-if="!isHidden" class="w-full fixed bottom-0 md:max-w-[365px]">
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <RouterLink
        to="/search"
        class="w-16 h-16 rounded-full bg-green-500 flex justify-center items-center shadow-lg"
      >
        <Icon icon="material-symbols:search-rounded" class="w-8 h-8 text-white"/>
      </RouterLink>
    </div>

    <div class="relative h-[90px] w-full bg-transparent shadow-none border-none">
      <svg
        viewBox="0 0 365 90"
        preserveAspectRatio="none"
        class="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="-2" stdDeviation="4" flood-color="#000000"
                          flood-opacity="0.1"/>
          </filter>
        </defs>
        <path
          d="M0 20C0 8.95431 8.95431 0 20 0H142.5C150.5 0 156.417 4.23837 160.039 11.0343C167.311 24.6938 181.697 34 198 34C214.303 34 228.689 24.6938 235.961 11.0343C239.583 4.23837 245.5 0 253.5 0H345C356.046 0 365 8.95431 365 20V90H0V20Z"
          fill="white"
        ></path>
      </svg>

      <div class="relative pt-2 pb-[34px] flex justify-between items-center h-full z-10 px-3">
        <div class="flex items-center gap-9">
          <RouterLink to="/" class="flex flex-col items-center min-w-0">
            <div class="flex flex-col items-center"
                 :class="[route.path === '/' ? 'text-green-500' : 'text-gray-400']">
              <Icon icon="material-symbols:home-rounded" class="w-7 h-7"/>
              <p class="font-semibold text-xs mt-1">홈</p>
            </div>
          </RouterLink>

          <RouterLink to="/message" class="flex flex-col items-center min-w-0">
            <div class="flex flex-col items-center"
                 :class="[route.path.startsWith('/message') ? 'text-green-500' : 'text-gray-400']">
              <Icon icon="ic:round-message" class="w-7 h-7"/>
              <p class="font-semibold text-xs mt-1">메시지</p>
            </div>
          </RouterLink>
        </div>

        <div class="flex items-center gap-9">
          <RouterLink to="/call" class="flex flex-col items-center min-w-0">
            <div class="flex flex-col items-center"
                 :class="[route.path.startsWith('/call') ? 'text-green-500' : 'text-gray-400']">
              <Icon icon="material-symbols:call-outline" class="w-7 h-7"/>
              <p class="font-semibold text-xs mt-1">전화</p>
            </div>
          </RouterLink>
          <RouterLink to="/profile" class="flex flex-col items-center min-w-0">
            <div class="flex flex-col items-center"
                 :class="[route.path.startsWith('/favorites') ? 'text-green-500' : 'text-gray-400']">
              <Icon icon="iconamoon:profile" class="w-7 h-7"/>
              <p class="font-semibold text-xs mt-1">프로필</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

