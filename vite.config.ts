import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss()
  ],
  resolve: {
    alias: {
      'pdfjs-dist': 'pdfjs-dist/build/pdf', // Optional, ensures correct resolution
    },
  },
});