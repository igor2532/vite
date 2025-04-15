import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { API_URL } from './config';
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': `${API_URL}/api/...`,
    },
  },
})
