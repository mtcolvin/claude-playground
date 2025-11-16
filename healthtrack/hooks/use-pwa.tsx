/**
 * PWA Installation and Service Worker Registration
 */

'use client'

import { useEffect, useState } from 'react'

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service worker registered:', registration.scope)

          // Check for updates periodically
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000) // Check every hour
        })
        .catch((error) => {
          console.error('[PWA] Service worker registration failed:', error)
        })
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed')
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    })

    // Online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) return false

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install')
      setIsInstallable(false)
      setDeferredPrompt(null)
      return true
    }

    console.log('[PWA] User dismissed install')
    return false
  }

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installPWA,
  }
}

/**
 * PWA Install Banner Component
 */
export function PWAInstallBanner() {
  const { isInstallable, installPWA } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  if (!isInstallable || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm bg-blue-600 text-white rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Install HealthTrack</h3>
          <p className="text-sm text-blue-100">
            Install our app for offline access and a better experience
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 text-blue-100 hover:text-white"
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
      <div className="mt-3 flex gap-2">
        <button
          onClick={async () => {
            await installPWA()
            setDismissed(true)
          }}
          className="flex-1 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50"
        >
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800"
        >
          Not now
        </button>
      </div>
    </div>
  )
}

/**
 * Offline Indicator Component
 */
export function OfflineIndicator() {
  const { isOnline } = usePWA()

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 px-4 z-50">
      <div className="flex items-center justify-center">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium">You are offline. Changes will sync when reconnected.</span>
      </div>
    </div>
  )
}
