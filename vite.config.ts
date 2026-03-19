import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'fluidos_web_profesional',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
})
