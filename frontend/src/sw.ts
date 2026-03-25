/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// SPA fallback: serve index.html for navigation
registerRoute(
  ({ request }) => request.mode === 'navigate' && !request.url.includes('/api/'),
  createHandlerBoundToURL('/index.html')
)

// Runtime caching
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/api/') ||
    (url.hostname === 'taskspop-api.dcmmarketingdigital.com.br' && url.pathname.startsWith('/api')),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
  })
)

registerRoute(
  ({ url }) =>
    url.pathname.includes('/storage/') || url.hostname.includes('res.cloudinary.com'),
  new CacheFirst({
    cacheName: 'images-cache',
  })
)

// Web Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() as { title?: string; body?: string; tag?: string; url?: string } | undefined
  const title = data?.title ?? 'Tasks POP'
  const options: NotificationOptions = {
    body: data?.body ?? '',
    icon: '/icons/icon-192.png',
    tag: data?.tag ?? 'default',
    data: data ?? {},
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data as { url?: string })?.url ?? '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients: readonly WindowClient[]) => {
      const focused = windowClients.find((c) => c.focused)
      if (focused) {
        focused.navigate(url)
        focused.focus()
      } else if (windowClients.length > 0) {
        windowClients[0].navigate(url)
        windowClients[0].focus()
      } else if (self.clients.openWindow) {
        self.clients.openWindow(url)
      }
    })
  )
})
