import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import eslintPlugin from 'vite-plugin-eslint';
// import vueI18n from '@intlify/vite-plugin-vue-i18n';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    eslintPlugin({ cache: false }),
    // vueI18n({
    //   include: path.resolve(__dirname, './path/to/src/locales/**'),
    // }),
  ], // TODO: check update for the cache in eslint plugin
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
        @import "./src/assets/themes/blue.scss";
        @import "./src/assets/styles/variables.scss";
        @import "./src/assets/styles/mixins/mixins.scss";
    `,
      },
    },
  },
  define: {
    'process.env': process.env,
  },
});
