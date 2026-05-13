import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// =====================================================
//  LTT Frontend - Vite Production Configuration
//  ضع هذا الملف مكان vite.config.ts في كل تطبيق Frontend
// =====================================================

const SERVER_IP = '192.168.1.50';
const API_PORT = '8080';
const API_BASE_URL = `http://${SERVER_IP}:${API_PORT}`;

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // Base path - use absolute path for production
  base: '/',

  // Server settings for production preview
  server: {
    host: '0.0.0.0',
    port: 20147, // أو 5173 للتطبيق الآخر
    strictPort: true,
  },

  // Production build settings
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2022',
    cssMinify: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },

  // Environment variables to expose to client
  define: {
    __API_URL__: JSON.stringify(API_BASE_URL),
    __APP_ENV__: JSON.stringify('production'),
  },

  // Prevent serving source maps in production
  esbuild: {
    drop: ['console', 'debugger'],
  },

  // Preview configuration (used by vite preview)
  preview: {
    host: '0.0.0.0',
    port: 20147,
    strictPort: true,
    cors: true,
  },
});
