import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/wayne-notes/',
  server: {
    // Vite 自動打開瀏覽器
    open: true,
  },
});
