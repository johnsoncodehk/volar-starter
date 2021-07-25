import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import * as volar from '@volar/experimental/compiler';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(volar.getVuePluginOptionsForVite())],
})
