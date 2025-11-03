
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000','https://learning-language-website.onrender.com' // ← change if you use different port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})