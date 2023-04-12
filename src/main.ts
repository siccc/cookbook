import { createApp } from 'vue';
import { autoAnimatePlugin } from '@formkit/auto-animate/vue';
import { VueQueryPlugin } from "vue-query";
import type { VueQueryPluginOptions } from "vue-query";

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
app.use(VueQueryPlugin, vueQueryPluginOptions);
app.use(autoAnimatePlugin);

app.provide('app', app);

app.mount('#app');
