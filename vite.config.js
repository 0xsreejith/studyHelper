import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        '**/.venv/**',
        '**/venv/**',
        '**/server/.venv/**',
        '**/server/venv/**',
        '**/__pycache__/**',
        '**/.qodo/**'
      ]
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ['pdfjs-dist']
        }
      }
    }
  }
})
