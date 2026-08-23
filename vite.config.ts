import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // favico.png pesa 868 KB y no lo referencia nadie: el favicon real es
      // favicon.ico (41 KB). Estaba acá solo para forzarlo al precache.
      includeAssets: ['assets/dentiqly-logo.png'],
      manifest: false, // use public/manifest.json as-is
      workbox: {
        // El glob de PNG barría las 104 imágenes del odontograma (las de
        // public/dientes y las mismas bundleadas en assets), así que cada
        // visitante de la landing se bajaba de fondo más de 1 MB de dientes
        // que no va a ver nunca. Ahora solo se precachea el shell de la app;
        // las imágenes se cachean cuando alguien abre un odontograma de verdad.
        // Solo el shell: lo que hace falta para pintar cualquier ruta. Los
        // chunks del panel (AdminApp, PatientsView, CalendarView...) suman más
        // de 1 MB y el visitante de la landing no los abre nunca; se cachean
        // solos la primera vez que alguien entra al producto, vía
        // runtimeCaching. Los prefijos index- y vendor-react- los fija
        // manualChunks, así que el glob no depende del hash.
        globPatterns: [
          'index.html',
          'assets/index-*.{js,css}',
          'assets/vendor-react-*.js',
        ],
        globIgnores: ['**/dientes/**', '**/favico.png'],
        // Red de seguridad: si algún día entra un asset gigante al build, que
        // no se cuele al precache sin que nadie se entere.
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        runtimeCaching: [
          {
            // Las tipografías salen de Google Fonts, no del build. Cachearlas
            // le ahorra a quien vuelve dos conexiones a un dominio externo.
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Odontograma: se bajan una sola vez, cuando se usan.
            urlPattern: /\/(dientes|assets)\/.*\.png$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'odontograma-img',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Chunks fuera del shell. Llevan hash en el nombre, así que una
            // versión nueva es una URL nueva: CacheFirst no puede servir algo
            // viejo. La primera carga va por red, igual que ahora; a partir de
            // la segunda sale del caché.
            urlPattern: /\/assets\/.*\.(js|css)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-chunks',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /^https:\/\/.*\/api\/billing\/plans/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'billing-plans-cache',
              expiration: { maxAgeSeconds: 60 * 60 * 24 }, // 24h
            },
          },
          {
            urlPattern: /^https:\/\/.*\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 }, // 5min
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
          'vendor-animation': ['framer-motion', 'gsap', 'lenis'],
        },
      },
    },
    cssCodeSplit: true,
    minify: 'esbuild',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
});
