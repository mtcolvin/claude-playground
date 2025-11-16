/**
 * React hooks for notifications
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  requestNotificationPermission,
  showNotification,
  scheduleNotification,
  getScheduledNotifications,
  cancelScheduledNotification,
  initializeNotifications,
  type NotificationOptions,
} from '@/lib/notifications'

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [scheduledCount, setScheduledCount] = useState(0)

  useEffect(() => {
    // Check current permission
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Initialize notification system
    initializeNotifications()

    // Update scheduled count
    updateScheduledCount()
  }, [])

  const updateScheduledCount = useCallback(async () => {
    const scheduled = await getScheduledNotifications()
    setScheduledCount(scheduled.length)
  }, [])

  const requestPermission = useCallback(async () => {
    const newPermission = await requestNotificationPermission()
    setPermission(newPermission)
    return newPermission
  }, [])

  const notify = useCallback(async (options: NotificationOptions) => {
    await showNotification(options)
  }, [])

  const schedule = useCallback(
    async (options: NotificationOptions, scheduledTime: Date) => {
      const id = await scheduleNotification(options, scheduledTime)
      await updateScheduledCount()
      return id
    },
    [updateScheduledCount]
  )

  const cancel = useCallback(
    async (id: number) => {
      await cancelScheduledNotification(id)
      await updateScheduledCount()
    },
    [updateScheduledCount]
  )

  return {
    permission,
    scheduledCount,
    requestPermission,
    notify,
    schedule,
    cancel,
    updateScheduledCount,
  }
}

/**
 * In-app notification toast hook
 */
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: 'info' | 'success' | 'warning' | 'error'
    duration: number
  }>>([])

  const showToast = useCallback((
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9)

    setToasts((prev) => [...prev, { id, message, type, duration }])

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
      }, duration)
    }

    return id
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return {
    toasts,
    showToast,
    dismissToast,
  }
}

/**
 * Toast Container Component
 */
export function ToastContainer() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm rounded-lg shadow-lg p-4 flex items-start justify-between animate-slide-in ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
              ? 'bg-red-500 text-white'
              : toast.type === 'warning'
              ? 'bg-yellow-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {toast.type === 'success' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {toast.type === 'warning' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p className="ml-3 text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="ml-4 flex-shrink-0 hover:opacity-75"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
