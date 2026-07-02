import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        // Keep Vite compatible without relying on Node path/url types.
        return id
      }
      return null
    },
  }
}

export default defineConfig({
  plugins: [figmaAssetResolver(), react(), tailwindcss()],
  server: {
    proxy: {
      '/tasks': { target: 'http://127.0.0.1:8082', changeOrigin: true },
      '/auth': { target: 'http://127.0.0.1:8081', changeOrigin: true },
      '/otp': { target: 'http://127.0.0.1:8082', changeOrigin: true },
      '/ai': { target: 'http://127.0.0.1:8082', changeOrigin: true },
      '/admin/users': { target: 'http://127.0.0.1:8081', changeOrigin: true },
      '/admin': { target: 'http://127.0.0.1:8082', changeOrigin: true },
      '/files': { target: 'http://127.0.0.1:8082', changeOrigin: true },
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})

