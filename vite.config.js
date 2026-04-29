
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createServer } from 'http';

// https://vite.dev/config/
export default defineConfig({
  // Enable the API server on port 3001

  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      '/proxy': {
        target: 'http://localhost:11434', // Replace with the actual Ollama API URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, ''),
      },
      '/custom': {
        target: 'https://christy-ramentaceous-verbatim.ngrok-free.dev', // ngrog ollama proxy
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/custom/, ''),
      },
      '/db': {
        target: 'http://localhost:9200', // local elasticsearch
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/db/, ''),
      },
      '/api': {
        target: 'https://christy-ramentaceous-verbatim.ngrok-free.dev', // local elasticsearch
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
