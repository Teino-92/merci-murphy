// Service Worker for merci murphy® dashboard web push notifications.
// No caching, no offline — only push + notificationclick handlers.
// v2 — broadcast push events to open clients for in-app realtime refresh.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  let data
  try {
    data = event.data ? event.data.json() : {}
  } catch (_) {
    data = {}
  }
  const title = data.title || 'merci murphy®'
  const options = {
    body: data.body || '',
    icon: '/pwa-icon-192.png',
    badge: '/pwa-icon-192.png',
    data: { url: data.url || '/dashboard' },
    tag: data.tag,
  }

  // Notify any open dashboard clients so the in-app bell refreshes without reload.
  const broadcast = (async () => {
    try {
      const windows = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      for (const w of windows) {
        w.postMessage({ type: 'push-received', payload: data })
      }
    } catch (_) {
      // ignore
    }
  })()

  event.waitUntil(Promise.all([self.registration.showNotification(title, options), broadcast]))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || '/dashboard'
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      for (const w of windows) {
        if (w.url.includes(url) && 'focus' in w) return w.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(url)
    })()
  )
})
