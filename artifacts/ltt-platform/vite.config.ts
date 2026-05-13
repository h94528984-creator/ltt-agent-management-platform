import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// =====================================================
//  LTT Management Platform - Vite Configuration
//  جاهز للنشر على Netlify
// =====================================================
//  API calls ستستخدم:
//  VITE_API_URL = "/.netlify/functions" (Netlify)
//  أو VITE_API_URL = "/api" (Netlify redirects)
// =====================================================

export default defineConfig({
  plugins: [react(), tailwindcss()],

  base: '/',

  server: {
    host: '0.0.0.0',
    port: 5173,
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

  define: {
    // استخدم VITE_API_URL من Environment Variables
    // القيمة الافتراضية: "/api" (لأن Netlify يعيد توجيهها)
    __API_URL__: JSON.stringify(process.env.VITE_API_URL || '/api'),
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});
