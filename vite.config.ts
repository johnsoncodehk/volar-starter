import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Preview from 'vite-plugin-vue-component-preview';
import Inspect from 'vite-plugin-inspect';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    Inspect(),
    Preview(),
    vue(),
  ],
})
