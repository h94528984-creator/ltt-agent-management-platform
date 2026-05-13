import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// =====================================================
//  LTT Agent Inspection Form - Vite Configuration
//  جاهز للنشر على Netlify
// =====================================================

export default defineConfig({
  plugins: [react(), tailwindcss()],

  base: '/form/',

  server: {
    host: '0.0.0.0',
    port: 5174,
  },

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
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },

  define: {
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || '/api'),
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});
