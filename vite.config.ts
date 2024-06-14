import { defineConfig } from 'vite';
import { fileURLToPath, URL } from "node:url";
import { resolve, dirname } from "node:path";
import svgLoader from 'vite-svg-loader';
import vue from '@vitejs/plugin-vue';
import vueI18n from '@intlify/vite-plugin-vue-i18n';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    svgLoader(),
    vueI18n({
      include: resolve(dirname(fileURLToPath(import.meta.url)), './src/lang/**'),
      runtimeOnly: false
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5000
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
});
