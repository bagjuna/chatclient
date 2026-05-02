export default [
    {
        "path": "/profile",
        "name": "profile",
        "component": () => import('@/views/profile/ProfileView.vue'),
    },
    {
        path: '/setting',
        name: 'setting',
        component: () => import('@/views/profile/SettingsView.vue'),
        meta: { title: '설정' },
    },
]
