// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/who-pooped/',
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
