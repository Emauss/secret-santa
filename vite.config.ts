import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Each family has its own mode/env file: .env.gorczynscy, .env.okroj
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    base: env.BASE_PATH || '/',
    build: {
      outDir: 'build',
    },
    plugins: [react(), tailwindcss()],
  };
});
