import { createApp } from 'vue';
import App from './App.vue';
import * as volar from '@volar/experimental/client';

const app = createApp(App);
app.use(volar.vuePlugin);
app.mount('#app');
