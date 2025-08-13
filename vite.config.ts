import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'https://mindmate-be-production.up.railway.app', // Your Axum backend address
        changeOrigin: true,
        },
      },
    },
})