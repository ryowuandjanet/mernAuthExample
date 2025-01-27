import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import process from 'node:process';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 載入環境變數
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
