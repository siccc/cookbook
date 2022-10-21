import { createApp } from 'vue';
// import { createPinia } from 'pinia';
import { VueQueryPlugin } from "vue-query";
import type { VueQueryPluginOptions } from "vue-query";

import App from './App.vue';
import router from './router';

import './assets/main.css';

const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  },
};

const app = createApp(App);

// app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, vueQueryPluginOptions);

app.mount('#app');


// app.config.errorHandler = (err, instance, info) => {
//   // report error to tracking services
// };