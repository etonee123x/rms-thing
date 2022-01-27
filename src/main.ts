import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { startMSW } from '@/mocks';

const pinia = createPinia();

Promise.all([startMSW()]).then(() => {
  const app = createApp(App);
  app.use(router);
  app.use(pinia);
  app.mount('#app');
});
