/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from "node:url";
import { resolve, dirname } from "node:path";
import svgLoader from 'vite-svg-loader';
import vue from '@vitejs/plugin-vue';
import VueI18nPlugin from '@intlify/unplugin-vue-i18n';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    svgLoader(),
    VueI18nPlugin.vite({
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
