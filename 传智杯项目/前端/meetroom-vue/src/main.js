import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import SpecularButton from './components/SpecularButton.vue'
import LineSidebar from './components/LineSidebar.vue'
import './assets/styles.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.component('SpecularButton', SpecularButton)
app.component('LineSidebar', LineSidebar)
app.mount('#app')
