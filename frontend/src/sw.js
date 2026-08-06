// CODEME Academy Service Worker (injectManifest)
// Bundled by vite-plugin-pwa (strategies: 'injectManifest').
// Provides: Workbox precaching (app shell + hashed assets), network-only for
// API/media hosts, SPA navigation fallback, and Web Push notification handling.

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkOnly } from 'workbox-strategies'

cleanupOutdatedCaches()
// The precache manifest (with revision hashes) is injected by the build.
precacheAndRoute(self.__WB_MANIFEST)

// Network-only resources (always require connection)
const NETWORK_ONLY_PATTERNS = [
  /supabase\.co/,       // All API calls
  /youtube\.com/,        // Video content
  /meet\.google\.com/,   // Live classes
  /zoom\.us/,            // Live classes
]

registerRoute(
  ({ url }) => NETWORK_ONLY_PATTERNS.some((pattern) => pattern.test(url.href)),
  new NetworkOnly()
)

// SPA navigation fallback to the precached index.html
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))

// ──────────────── Install / Activate ────────────────
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// ──────────────── Push Notifications ────────────────
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body || 'You have a new notification from CodeMe Academy',
    icon: '/codeme.jpg',
    badge: '/codeme.jpg',
    tag: data.tag || 'codeme-notification',
    data: { url: data.url || '/' },
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200],
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'CodeMe Academy', options)
  )
})

// ──────────────── Notification Click ────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.focus()
          if (client.url !== targetUrl && 'navigate' in client) {
            return client.navigate(targetUrl)
          }
          return
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

// ──────────────── Background Sync (offline progress) ────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncOfflineProgress())
  }
})

async function syncOfflineProgress() {
  try {
    const db = await openOfflineDB()
    const pending = await db.getAll('pending-progress')
    for (const item of pending) {
      await fetch('/api/sync-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      await db.delete('pending-progress', item.id)
    }
  } catch (e) {
    console.error('[SW] Background sync failed:', e)
  }
}

function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('codeme-offline', 1)
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('pending-progress', { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}
