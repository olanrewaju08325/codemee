import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from root directory. Passing '' as the third parameter loads all variables regardless of prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      'process.env.SUPABASE_PROJECT_URL': JSON.stringify(env.SUPABASE_PROJECT_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
        }
      }
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        // Bundle the custom service worker (src/sw.js) with workbox precaching
        // instead of generating a bare SW that would drop push handlers.
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.js',
        includeAssets: ['favicon.svg', 'codeme.jpg'],
        manifest: {
          name: 'CodeMe Technology Academy',
          short_name: 'CodeMe',
          description: "Nigeria's premier tech learning academy. Learn HTML, CSS, JavaScript, React, Python, Data Science & more.",
          theme_color: '#0C4A8C',
          background_color: '#0C4A8C',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
          start_url: '/',
          scope: '/',
          lang: 'en-NG',
          orientation: 'portrait',
          categories: ['education', 'productivity'],
          icons: [
            {
              src: '/codeme.jpg',
              sizes: '192x192',
              type: 'image/jpeg',
              purpose: 'any'
            },
            {
              src: '/codeme.jpg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'any'
            },
            {
              src: '/codeme.jpg',
              sizes: '512x512',
              type: 'image/jpeg',
              purpose: 'maskable'
            }
          ],
          shortcuts: [
            {
              name: 'My Dashboard',
              short_name: 'Dashboard',
              description: 'Go to your learning dashboard',
              url: '/#/dashboard'
            },
            {
              name: 'My Courses',
              short_name: 'Courses',
              description: 'Continue your course',
              url: '/#/courses'
            }
          ]
        }
      })
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react')) return 'vendor'
              if (id.includes('gsap') || id.includes('framer-motion')) return 'animation'
              if (id.includes('@supabase')) return 'supabase'
              if (id.includes('lucide-react')) return 'icons'
            }
          }
        }
      }
    }
  }
})
