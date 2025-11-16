/**
 * Performance Optimization Utilities
 *
 * Provides caching, lazy loading, code splitting, and performance monitoring
 * for optimal application performance.
 */

// Cache Management
export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()

  /**
   * Set item in cache with TTL (time-to-live)
   */
  set(key: string, data: any, ttl: number = 3600000): void {
    // TTL in milliseconds (default: 1 hour)
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Get item from cache if not expired
   */
  get(key: string): any | null {
    const item = this.cache.get(key)

    if (!item) return null

    const isExpired = Date.now() - item.timestamp > item.ttl

    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  /**
   * Check if key exists in cache and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Remove item from cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Remove expired items
   */
  cleanup(): number {
    let removed = 0
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
        removed++
      }
    }

    return removed
  }
}

// API Response Caching
export class APICache extends CacheManager {
  /**
   * Cache API response
   */
  cacheResponse(url: string, response: any, ttl?: number): void {
    this.set(`api:${url}`, response, ttl)
  }

  /**
   * Get cached API response
   */
  getCachedResponse(url: string): any | null {
    return this.get(`api:${url}`)
  }

  /**
   * Invalidate cache for specific URL or pattern
   */
  invalidate(urlPattern: string): void {
    const keys = this.keys().filter(key => key.includes(urlPattern))
    keys.forEach(key => this.delete(key))
  }
}

// IndexedDB Wrapper for Offline Storage
export class OfflineStorage {
  private dbName: string = 'healthtrack_offline'
  private version: number = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB not available')
      return
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('metrics')) {
          db.createObjectStore('metrics', { keyPath: 'id', autoIncrement: true })
        }

        if (!db.objectStoreNames.contains('appointments')) {
          db.createObjectStore('appointments', { keyPath: 'id' })
        }

        if (!db.objectStoreNames.contains('medications')) {
          db.createObjectStore('medications', { keyPath: 'id' })
        }
      }
    })
  }

  async set(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async get(storeName: string, key: any): Promise<any> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, key: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

// Debounce utility for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle utility for performance
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Performance Metrics
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()

  /**
   * Mark start of operation
   */
  start(label: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`)
    }
  }

  /**
   * Mark end of operation and measure duration
   */
  end(label: string): number {
    if (typeof performance === 'undefined') return 0

    performance.mark(`${label}-end`)
    performance.measure(label, `${label}-start`, `${label}-end`)

    const measure = performance.getEntriesByName(label)[0] as PerformanceMeasure
    const duration = measure.duration

    // Store metric
    if (!this.metrics.has(label)) {
      this.metrics.set(label, [])
    }
    this.metrics.get(label)!.push(duration)

    // Cleanup
    performance.clearMarks(`${label}-start`)
    performance.clearMarks(`${label}-end`)
    performance.clearMeasures(label)

    return duration
  }

  /**
   * Get average duration for operation
   */
  getAverage(label: string): number {
    const durations = this.metrics.get(label)
    if (!durations || durations.length === 0) return 0

    const sum = durations.reduce((a, b) => a + b, 0)
    return sum / durations.length
  }

  /**
   * Get all metrics
   */
  getMetrics(): Record<string, { count: number; average: number; min: number; max: number }> {
    const result: Record<string, any> = {}

    for (const [label, durations] of this.metrics.entries()) {
      result[label] = {
        count: durations.length,
        average: this.getAverage(label),
        min: Math.min(...durations),
        max: Math.max(...durations)
      }
    }

    return result
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
  }
}

// Image Lazy Loading Helper
export function lazyLoadImage(src: string, placeholder?: string): {
  src: string
  loading: 'lazy' | 'eager'
  onLoad?: () => void
} {
  return {
    src: placeholder || '/placeholder.png',
    loading: 'lazy',
    onLoad: () => {
      // Image loaded, can update UI if needed
    }
  }
}

// Virtual Scrolling Helper
export function calculateVisibleItems(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): {startIndex: number; endIndex: number; offsetY: number} {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )
  const offsetY = startIndex * itemHeight

  return { startIndex, endIndex, offsetY }
}

// Bundle Size Analyzer
export function getBundleStats(): {
  jsSize: number
  cssSize: number
  imageSize: number
  totalSize: number
} {
  if (typeof performance === 'undefined' || !performance.getEntriesByType) {
    return { jsSize: 0, cssSize: 0, imageSize: 0, totalSize: 0 }
  }

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

  let jsSize = 0
  let cssSize = 0
  let imageSize = 0

  resources.forEach(resource => {
    const size = resource.transferSize || 0

    if (resource.name.endsWith('.js')) {
      jsSize += size
    } else if (resource.name.endsWith('.css')) {
      cssSize += size
    } else if (
      resource.name.endsWith('.png') ||
      resource.name.endsWith('.jpg') ||
      resource.name.endsWith('.jpeg') ||
      resource.name.endsWith('.gif') ||
      resource.name.endsWith('.webp')
    ) {
      imageSize += size
    }
  })

  return {
    jsSize,
    cssSize,
    imageSize,
    totalSize: jsSize + cssSize + imageSize
  }
}

// Web Vitals Measurement
export interface WebVitals {
  FCP?: number  // First Contentful Paint
  LCP?: number  // Largest Contentful Paint
  FID?: number  // First Input Delay
  CLS?: number  // Cumulative Layout Shift
  TTFB?: number // Time to First Byte
}

export function measureWebVitals(): Promise<WebVitals> {
  return new Promise((resolve) => {
    const vitals: WebVitals = {}

    if (typeof performance === 'undefined') {
      resolve(vitals)
      return
    }

    // FCP
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformancePaintTiming
    if (fcpEntry) {
      vitals.FCP = fcpEntry.startTime
    }

    // LCP - requires PerformanceObserver
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any
          vitals.LCP = lastEntry.renderTime || lastEntry.loadTime
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        // LCP not available
      }
    }

    // TTFB
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (navigationEntry) {
      vitals.TTFB = navigationEntry.responseStart - navigationEntry.requestStart
    }

    resolve(vitals)
  })
}

// Memory Usage Monitoring
export function getMemoryUsage(): {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
} | null {
  if (typeof performance === 'undefined' || !(performance as any).memory) {
    return null
  }

  const memory = (performance as any).memory

  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit
  }
}

// Request Batching
export class RequestBatcher {
  private queue: Array<{
    request: () => Promise<any>
    resolve: (value: any) => void
    reject: (error: any) => void
  }> = []
  private batchSize: number = 10
  private batchDelay: number = 100 // ms
  private timeout: NodeJS.Timeout | null = null

  constructor(batchSize: number = 10, batchDelay: number = 100) {
    this.batchSize = batchSize
    this.batchDelay = batchDelay
  }

  add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject })

      if (this.queue.length >= this.batchSize) {
        this.flush()
      } else if (!this.timeout) {
        this.timeout = setTimeout(() => this.flush(), this.batchDelay)
      }
    })
  }

  private async flush(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }

    const batch = this.queue.splice(0, this.batchSize)

    // Process batch in parallel
    await Promise.allSettled(
      batch.map(async ({ request, resolve, reject }) => {
        try {
          const result = await request()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })
    )
  }
}

// Export singleton instances
export const cacheManager = new CacheManager()
export const apiCache = new APICache()
export const offlineStorage = new OfflineStorage()
export const performanceMonitor = new PerformanceMonitor()
export const requestBatcher = new RequestBatcher()
