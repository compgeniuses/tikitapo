import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('socket.io')) {
              return 'vendor-socket';
            }
            if (id.includes('@google/genai')) {
              return 'vendor-ai';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
