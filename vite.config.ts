import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Preview from 'vite-plugin-vue-component-preview';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Preview(),
    vue(),
  ],
})
