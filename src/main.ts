import { createApp } from 'vue';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue';
import { VueQueryPlugin } from "vue-query";
import vue3GoogleLogin from 'vue3-google-login';
import type { VueQueryPluginOptions } from "vue-query";
import { i18n } from './i18n';

import App from './App.vue';
import router from './router';

import './assets/main.css';

const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: false // disable automatic retries
      },
    },
  },
};

const app = createApp(App);

app.use(router);
app.use(i18n);
app.use(VueQueryPlugin, vueQueryPluginOptions);
app.use(autoAnimatePlugin);
app.use(vue3GoogleLogin, {
  clientId: '279710550614-icb0g0ddi3lo5rpsavltoffc83o45t4f.apps.googleusercontent.com',
  scope: 'email profile',
})

app.provide('app', app);

app.mount('#app');
