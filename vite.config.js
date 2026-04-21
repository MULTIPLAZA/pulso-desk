import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Separar dependencias pesadas en chunks dedicados — se cachean más tiempo
    // porque cambian poco entre deploys.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':    ['react', 'react-dom', 'react-router-dom'],
          'supabase':        ['@supabase/supabase-js'],
          'icons':           ['lucide-react'],
          'dates':           ['date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
