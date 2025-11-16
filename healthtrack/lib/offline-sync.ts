/**
 * Offline Sync Manager
 *
 * Manages queuing and syncing of offline data
 */

interface PendingSyncItem {
  id?: number
  url: string
  method: string
  headers: Record<string, string>
  body: string
  timestamp: number
  retries: number
}

const DB_NAME = 'HealthTrackSync'
const DB_VERSION = 1
const STORE_NAME = 'pending'

/**
 * Open sync database
 */
async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

/**
 * Add item to sync queue
 */
export async function queueForSync(
  url: string,
  method: string,
  headers: Record<string, string>,
  body: any
): Promise<void> {
  const db = await openDatabase()

  const item: PendingSyncItem = {
    url,
    method,
    headers,
    body: JSON.stringify(body),
    timestamp: Date.now(),
    retries: 0,
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.add(item)

    request.onsuccess = () => {
      console.log('[Sync] Queued for offline sync:', url)
      // Register background sync if available
      if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then((registration) => {
          return (registration as any).sync.register('sync-health-data')
        })
      }
      resolve()
    }
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get all pending sync items
 */
export async function getPendingItems(): Promise<PendingSyncItem[]> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Remove item from sync queue
 */
export async function removeSyncItem(id: number): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Sync all pending items
 */
export async function syncPendingItems(): Promise<{
  success: number
  failed: number
}> {
  const items = await getPendingItems()
  let success = 0
  let failed = 0

  for (const item of items) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      })

      if (response.ok) {
        await removeSyncItem(item.id!)
        success++
      } else {
        failed++
      }
    } catch (error) {
      console.error('[Sync] Failed to sync item:', item.id, error)
      failed++
    }
  }

  return { success, failed }
}

/**
 * Clear all pending items
 */
export async function clearPendingItems(): Promise<void> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.clear()

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
