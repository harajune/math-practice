import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 静的SPA。Cloudflare Pages へ dist をデプロイする。
export default defineConfig({
  plugins: [react()],
  base: './',
})
