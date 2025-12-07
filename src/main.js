import './assets/main.css'

import './registerServiceWorker'

import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router/index.js'
import { createPinia } from 'pinia'

const app = createApp(App)



app.use(createPinia())
app.use(router)

app.mount('#app')
