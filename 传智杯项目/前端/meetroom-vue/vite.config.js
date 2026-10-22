import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/meetroom': {
        target: process.env.API_TARGET || 'http://127.0.0.1:8888',
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
