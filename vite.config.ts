import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// IMPORTANT: base path matches the GitHub Pages repo name so asset URLs resolve.
export default defineConfig({
  base: '/line-stock-web/',
  plugins: [vue()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
  },
})
