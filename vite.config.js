import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), eslintPlugin({ cache: false }), crossOriginIsolation()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
        @import "./src/assets/styles/variables.scss";
        @import "./src/assets/styles/mixins.scss";
    `,
      },
    },
  },
  define: {
    'process.env': process.env,
  },
});
