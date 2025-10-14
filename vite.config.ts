import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: false, // 🚫 Desactiva Hot Module Reload para evitar el error
  },
})
