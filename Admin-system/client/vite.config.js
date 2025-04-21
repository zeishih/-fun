import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,
    host: '0.0.0.0',
    proxy: {
      // 配置代理
      '/api/admin': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
