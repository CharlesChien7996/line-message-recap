import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署時使用 repository 名稱作為 base path
  // 本地開發時使用 '/'
  base: process.env.GITHUB_ACTIONS ? '/line-message-recap/' : '/',
})
