import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: 'esnext',
  },
  resolve: {
    alias: {
      '@images': path.resolve(__dirname, 'src/images'),
    },
  },
});
