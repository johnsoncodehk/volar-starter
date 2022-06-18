import { createApp } from 'vue';
import App from './App.vue';
import Previewer from 'virtual:vue-component-preview';

const app = createApp(App);
app.use(Previewer);
app.mount('#app');
