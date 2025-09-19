import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: [
      'localhost',
      'f3d6ce31-03b1-4bc8-a2e2-9558e0af661c-00-2thwgnthsskut.worf.replit.dev',
      '.replit.dev'
    ]
  },
  define: {
    'process.env.REPLIT_DEV_DOMAIN': JSON.stringify(process.env.REPLIT_DEV_DOMAIN)
  }
})