<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="w-full flex-1 min-h-0 flex flex-col overflow-hidden">
    <div
      class="w-full flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden px-4 pt-4 pb-[34px]"
    >
      <RouterView />
    </div>
  </div>
</template>
