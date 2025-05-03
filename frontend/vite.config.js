import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js', // Make sure Vite uses the PostCSS config
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5161',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
});
