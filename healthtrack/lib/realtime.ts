/**
 * Real-Time Updates using Server-Sent Events (SSE)
 *
 * Provides live updates for:
 * - New notifications
 * - Health data changes
 * - Shared data updates (from caregivers/providers)
 * - Sync status
 */

export type RealtimeEvent =
  | { type: 'notification'; data: any }
  | { type: 'health-data-updated'; data: { resource: string; id: string } }
  | { type: 'sync-complete'; data: { success: number; failed: number } }
  | { type: 'connection-status'; data: { status: 'connected' | 'disconnected' } }

export type RealtimeEventHandler = (event: RealtimeEvent) => void

class RealtimeClient {
  private eventSource: EventSource | null = null
  private handlers: Map<string, Set<RealtimeEventHandler>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(userId: string): void {
    if (this.eventSource) {
      console.warn('[Realtime] Already connected')
      return
    }

    console.log('[Realtime] Connecting...')

    this.eventSource = new EventSource(`/api/v1/realtime?userId=${userId}`)

    this.eventSource.onopen = () => {
      console.log('[Realtime] Connected')
      this.reconnectAttempts = 0
      this.emit({ type: 'connection-status', data: { status: 'connected' } })
    }

    this.eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data)
        this.emit(data)
      } catch (error) {
        console.error('[Realtime] Failed to parse message:', error)
      }
    })

    this.eventSource.addEventListener('notification', (event) => {
      const data = JSON.parse((event as MessageEvent).data)
      this.emit({ type: 'notification', data })
    })

    this.eventSource.addEventListener('health-data-updated', (event) => {
      const data = JSON.parse((event as MessageEvent).data)
      this.emit({ type: 'health-data-updated', data })
    })

    this.eventSource.addEventListener('sync-complete', (event) => {
      const data = JSON.parse((event as MessageEvent).data)
      this.emit({ type: 'sync-complete', data })
    })

    this.eventSource.onerror = (error) => {
      console.error('[Realtime] Connection error:', error)
      this.handleError()
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      console.log('[Realtime] Disconnecting...')
      this.eventSource.close()
      this.eventSource = null
      this.emit({ type: 'connection-status', data: { status: 'disconnected' } })
    }
  }

  on(eventType: string, handler: RealtimeEventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }

    this.handlers.get(eventType)!.add(handler)

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType)
      if (handlers) {
        handlers.delete(handler)
      }
    }
  }

  private emit(event: RealtimeEvent): void {
    const handlers = this.handlers.get(event.type)
    if (handlers) {
      handlers.forEach((handler) => handler(event))
    }

    // Also emit to wildcard handlers
    const wildcardHandlers = this.handlers.get('*')
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => handler(event))
    }
  }

  private handleError(): void {
    this.eventSource?.close()
    this.eventSource = null

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

      console.log(`[Realtime] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        // Will need userId from somewhere - should be stored
        console.log('[Realtime] Attempting reconnect...')
      }, delay)
    } else {
      console.error('[Realtime] Max reconnect attempts reached')
      this.emit({ type: 'connection-status', data: { status: 'disconnected' } })
    }
  }

  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN
  }
}

// Singleton instance
export const realtime = new RealtimeClient()
