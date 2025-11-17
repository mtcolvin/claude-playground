/**
 * React hooks for real-time updates
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { realtime, type RealtimeEvent, type RealtimeEventHandler } from '@/lib/realtime'

export function useRealtime() {
  const { data: session } = useSession()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return

    // Connect to realtime service
    realtime.connect(session.user.id)

    // Listen for connection status
    const unsubscribe = realtime.on('connection-status', (event) => {
      if (event.type === 'connection-status') {
        setIsConnected(event.data.status === 'connected')
      }
    })

    // Disconnect on unmount
    return () => {
      unsubscribe()
      realtime.disconnect()
    }
  }, [session?.user?.id])

  const subscribe = useCallback((eventType: string, handler: RealtimeEventHandler) => {
    return realtime.on(eventType, handler)
  }, [])

  return {
    isConnected,
    subscribe,
  }
}

/**
 * Hook to subscribe to specific event type
 */
export function useRealtimeEvent(eventType: string, handler: RealtimeEventHandler) {
  const { subscribe } = useRealtime()

  useEffect(() => {
    const unsubscribe = subscribe(eventType, handler)
    return unsubscribe
  }, [eventType, handler, subscribe])
}

/**
 * Hook for live notifications
 */
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])

  useRealtimeEvent('notification', useCallback((event) => {
    if (event.type === 'notification') {
      setNotifications((prev) => [event.data, ...prev].slice(0, 50)) // Keep last 50
    }
  }, []))

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    clearNotifications,
  }
}

/**
 * Real-time connection status indicator
 */
export function RealtimeStatus() {
  const { isConnected } = useRealtime()

  if (!isConnected) {
    return (
      <div className="flex items-center text-xs text-gray-700">
        <div className="w-2 h-2 rounded-full bg-gray-400 mr-1.5 animate-pulse"></div>
        <span>Connecting...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center text-xs text-green-600">
      <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
      <span>Live</span>
    </div>
  )
}
