import { createRouter, createWebHistory } from 'vue-router'
import chat from '@/router/chat.js'
import user from "@/router/user.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path : '/message',
      name : 'message',
      component : () => import('@/views/MessageView.vue')
    },
    ...user,
    ...chat,
  ],
})

export default router
