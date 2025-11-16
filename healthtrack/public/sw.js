/**
 * Service Worker for Offline-First PWA
 *
 * Implements:
 * - Offline caching strategies
 * - Background sync
 * - Push notifications (ready)
 * - Asset pre-caching
 */

const CACHE_VERSION = 'healthtrack-v1'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`
const API_CACHE = `${CACHE_VERSION}-api`

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/offline',
  '/manifest.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('healthtrack-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // API requests - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE))
    return
  }

  // Static assets - Cache first, fallback to network
  if (request.destination === 'image' || request.destination === 'style' || request.destination === 'script') {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
    return
  }

  // HTML pages - Network first, fallback to cache
  if (request.destination === 'document') {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE))
    return
  }

  // Default - try network, fallback to cache
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE))
})

// Network first strategy
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request)

    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // If offline page exists, return it for navigation requests
    if (request.destination === 'document') {
      const offlinePage = await caches.match('/offline')
      if (offlinePage) {
        return offlinePage
      }
    }

    // Return offline response
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    })
  }
}

// Cache first strategy
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    return new Response('Resource not available offline', {
      status: 503,
      statusText: 'Service Unavailable',
    })
  }
}

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)

  if (event.tag === 'sync-health-data') {
    event.waitUntil(syncHealthData())
  }
})

async function syncHealthData() {
  try {
    // Get pending sync data from IndexedDB
    const db = await openSyncDatabase()
    const pendingData = await getPendingSync(db)

    // Sync each item
    for (const item of pendingData) {
      try {
        await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body,
        })

        // Remove from pending queue
        await removePendingSync(db, item.id)
      } catch (error) {
        console.error('[SW] Sync failed for item:', item.id, error)
      }
    }

    console.log('[SW] Background sync completed')
  } catch (error) {
    console.error('[SW] Background sync error:', error)
    throw error
  }
}

// Push notification support
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received')

  const data = event.data?.json() || {}
  const options = {
    body: data.body || 'New health update',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: data,
    actions: data.actions || [],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'HealthTrack', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked')
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }

      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Helper: Open sync database
async function openSyncDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HealthTrackSync', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

// Helper: Get pending sync items
async function getPendingSync(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending'], 'readonly')
    const store = transaction.objectStore('pending')
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

// Helper: Remove synced item
async function removePendingSync(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending'], 'readwrite')
    const store = transaction.objectStore('pending')
    const request = store.delete(id)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
