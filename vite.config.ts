import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Your Axum backend address
        changeOrigin: true,
        },
      },
    },
})