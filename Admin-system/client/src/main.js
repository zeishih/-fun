import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 引入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 引入Vue Router
import router from './router'

// 引入Pinia状态管理
import { createPinia } from 'pinia'
const pinia = createPinia()

const app = createApp(App)

// 使用插件
app.use(ElementPlus, {
  locale: zhCn
})
app.use(router)
app.use(pinia)

app.mount('#app')
