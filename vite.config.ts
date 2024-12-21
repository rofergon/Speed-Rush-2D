import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Función para copiar archivos de Unity
function copyUnityFiles() {
  return {
    name: 'copy-unity-files',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.includes('/Build/') && req.url.endsWith('.br')) {
          res.setHeader('Content-Encoding', 'br');
          if (req.url.endsWith('.js.br')) {
            res.setHeader('Content-Type', 'application/javascript');
          } else if (req.url.endsWith('.wasm.br')) {
            res.setHeader('Content-Type', 'application/wasm');
          } else if (req.url.endsWith('.data.br')) {
            res.setHeader('Content-Type', 'application/octet-stream');
          }
        }
        next();
      });
    },
    buildStart() {
      const sourceDir = path.resolve(__dirname, 'public/Build');
      const targetDir = path.resolve(__dirname, 'dist/Build');
      
      if (fs.existsSync(sourceDir)) {
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.readdirSync(sourceDir).forEach(file => {
          fs.copyFileSync(
            path.join(sourceDir, file),
            path.join(targetDir, file)
          );
        });
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), copyUnityFiles()],
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
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.startsWith('Build/')) {
            return '[name]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      },
    },
    copyPublicDir: true,
  },
  assetsInclude: ['**/*.br', '**/*.wasm', '**/*.unityweb', '**/*.data']
});
