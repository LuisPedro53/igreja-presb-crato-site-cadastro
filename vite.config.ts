import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Proxy para facilitar desenvolvimento: encaminha /api para o servidor Express https://servidor-igreja-site.onrender.com/
  server: {
    proxy: {
      '/api': {
        target: 'https://servidor-igreja-site.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
