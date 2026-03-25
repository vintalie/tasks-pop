import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', 'offline.html'],
      manifest: {
        name: 'Tasks POP',
        short_name: 'Tasks POP',
        description: 'Checklist operacional POP',
        theme_color: '#0f1419',
        background_color: '#0f1419',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        categories: ['productivity', 'business'],
        lang: 'pt-BR',
        id: '/',
        prefer_related_applications: false,
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://taskspop-api.dcmmarketingdigital.com.br',
        changeOrigin: true,
      },
      '/storage': {
        target: 'https://taskspop-api.dcmmarketingdigital.com.br',
        changeOrigin: true,
      },
    },
  },
})
