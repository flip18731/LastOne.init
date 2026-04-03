import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    global: 'globalThis',
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'motion': ['framer-motion'],
          'charts': ['recharts'],
          'interwovenkit': ['@initia/interwovenkit-react'],
          'cosmjs': ['@cosmjs/cosmwasm-stargate', '@cosmjs/stargate', '@cosmjs/proto-signing', 'cosmjs-types'],
        },
      },
    },
  },
})
