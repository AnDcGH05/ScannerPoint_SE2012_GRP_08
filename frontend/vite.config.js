import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During development every /api call is forwarded to the Spring Boot backend,
// so the browser never needs CORS and file links work the same way.
export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 1500 },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8081',
    },
  },
})
