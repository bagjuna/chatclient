import { createRouter, createWebHistory } from 'vue-router'
import chat from '@/router/chat.js'
import user from "@/router/user.js";
import call from "@/router/call.js";
import profile from "@/router/profile.js";

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
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/views/NotificationsView.vue'),
      meta: {
        title: '알림',
      },
    },
    {
      path: '/search',
        name: 'search',
        component: () => import('@/views/search/SearchView.vue')
    },
      ...profile,
    ...call,
    ...user,
    ...chat,
  ],
})


const PUBLIC_ROUTES = new Set(['login', 'kakao-login', 'find-password', 'signup'])

router.beforeEach((to, from, next) => {
  const accessToken = localStorage.getItem('accessToken')
  const toName = to.name?.toString()


  const isPublic = toName ? PUBLIC_ROUTES.has(toName) : false

  // 1) Not authenticated -> block private pages
  if (!accessToken && !isPublic) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // 2) Authenticated -> block auth pages (go home)
  if (accessToken && isPublic && toName !== 'find-password') {
    return next({ name: 'home' })
  }

  return next()
})

export default router
