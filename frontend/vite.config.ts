import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/tasks': { target: 'http://localhost:8082', changeOrigin: true },
      '/auth': { target: 'http://localhost:8081', changeOrigin: true },
      '/otp': { target: 'http://localhost:8082', changeOrigin: true },
      '/ai': { target: 'http://localhost:8082', changeOrigin: true },
      '/admin/users': { target: 'http://localhost:8081', changeOrigin: true },
      '/admin': { target: 'http://localhost:8082', changeOrigin: true },
    }
  }
})

