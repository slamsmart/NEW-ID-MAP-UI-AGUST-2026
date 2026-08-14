import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'favicon.svg', 'hero-mangrove.webp'],
      manifest: {
        name: 'ID-MAP — Integrasi Data Mangrove Pesisir',
        short_name: 'ID-MAP',
        description: 'Platform monitoring mangrove dan ekosistem pesisir Kab. Malang',
        start_url: '/',
        display: 'standalone',
        background_color: '#003527',
        theme_color: '#006a61',
        orientation: 'portrait-primary',
        lang: 'id',
        icons: [
          { src: '/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        categories: ['environment', 'government', 'maps'],
      },
      workbox: {
        // Cache shell assets + fonts
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        // Don't cache large GeoJSON (fetch fresh each time)
        globIgnores: ['**/*.geojson'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/\{s\}\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'osm-tiles', expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: true,
  },
})
