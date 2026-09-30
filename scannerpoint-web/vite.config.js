import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Port 5173 is one of the origins allowed by the backend's CorsConfig
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
})
