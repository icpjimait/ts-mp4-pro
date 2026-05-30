import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css' // 引入暗黑主题

const app = createApp(App)

app.use(ElementPlus)
app.mount('#app')

// 强制挂载暗黑模式类名
document.documentElement.classList.add('dark')
