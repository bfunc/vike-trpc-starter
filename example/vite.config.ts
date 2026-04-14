import { defineConfig } from 'vite';
import vike from 'vike/plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [vike(), react()],
  resolve: {
    alias: { $src: path.resolve(__dirname, '.') }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } }
  }
});
