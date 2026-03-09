import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/auth/github/callback': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/api/auth': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/api/user': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
        },
        '/api/images/generate-background': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
        '/api/tasks': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
        },
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
        }
      }
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
