import { createApp } from 'vue'
import './css/base.css'
import App from './App.vue'
import router from './router/index.js'
import { reveal } from './lib/useReveal.js'

const app = createApp(App)
app.use(router)
app.directive('reveal', reveal)
app.mount('#app')
