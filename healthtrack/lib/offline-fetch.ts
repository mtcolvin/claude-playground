/**
 * Offline-aware API fetch wrapper
 */

import { queueForSync } from './offline-sync'

export interface FetchOptions extends RequestInit {
  offlineSync?: boolean
}

/**
 * Enhanced fetch that queues requests when offline
 */
export async function offlineFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { offlineSync = true, ...fetchOptions } = options

  // Try network request
  try {
    const response = await fetch(url, fetchOptions)
    return response
  } catch (error) {
    // If offline and sync enabled, queue for later
    if (!navigator.onLine && offlineSync && fetchOptions.method !== 'GET') {
      await queueForSync(
        url,
        fetchOptions.method || 'POST',
        (fetchOptions.headers as Record<string, string>) || {},
        fetchOptions.body
      )

      // Return synthetic success response
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Queued for sync when online',
          offline: true,
        }),
        {
          status: 202,
          statusText: 'Accepted',
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Re-throw error if not handling offline
    throw error
  }
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  return navigator.onLine
}

/**
 * Wait for online connection
 */
export function waitForOnline(): Promise<void> {
  if (navigator.onLine) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const handleOnline = () => {
      window.removeEventListener('online', handleOnline)
      resolve()
    }
    window.addEventListener('online', handleOnline)
  })
}

/**
 * Execute function when online
 */
export async function whenOnline<T>(fn: () => Promise<T>): Promise<T> {
  await waitForOnline()
  return fn()
}
