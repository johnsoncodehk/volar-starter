import { createApp } from 'vue';
import App from './App.vue';
import Previewer from 'vite-plugin-vue-component-preview/client';

const app = createApp(App);
app.use(Previewer);
app.mount('#app');
