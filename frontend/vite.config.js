import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const fromSrc = (path) => fileURLToPath(new URL(`./src/${path}`, import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@api': fromSrc('api'),
      '@components': fromSrc('components'),
      '@features': fromSrc('features'),
      '@hooks': fromSrc('hooks'),
      '@utils': fromSrc('utils'),
      '@': fromSrc(''),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setup.js',
    include: ['test/**/*.test.{js,jsx}'],
  }
})
