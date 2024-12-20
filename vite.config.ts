import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Access-Control-Allow-Origin': '*'
    }
  },
  preview: {
    port: 5173,
    host: true,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  // Configuración para servir archivos estáticos
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // Configuración para manejar archivos grandes
    rollupOptions: {
      output: {
        manualChunks: undefined,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.br') || 
              assetInfo.name.endsWith('.wasm') || 
              assetInfo.name.endsWith('.js') || 
              assetInfo.name.endsWith('.data')) {
            return 'Build/[name]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      },
    },
    // Asegurarse de que los archivos .br se copien sin procesar
    copyPublicDir: true,
  },
  // Incluir tipos de archivos adicionales
  assetsInclude: ['**/*.br', '**/*.wasm', '**/*.unityweb', '**/*.data'],
});
