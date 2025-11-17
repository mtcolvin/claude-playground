/**
 * Encryption Setup Component
 *
 * Guides users through setting up end-to-end encryption
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEncryption } from '@/hooks/use-encryption'
import { exportEncryptedKey } from '@/lib/encryption-storage'

export function EncryptionSetup() {
  const router = useRouter()
  const { isReady, isInitializing, error } = useEncryption()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    setSetupError(null)

    // Validate password
    if (password.length < 12) {
      setSetupError('Password must be at least 12 characters long')
      return
    }

    if (password !== confirmPassword) {
      setSetupError('Passwords do not match')
      return
    }

    try {
      setIsSettingUp(true)

      // Get the encryption key from session storage
      const keyString = sessionStorage.getItem('healthtrack_encryption_key')
      if (!keyString) {
        throw new Error('Encryption key not found')
      }

      // Import the key
      const { importKey } = await import('@/lib/encryption')
      const encryptionKey = await importKey(keyString)

      // Export encrypted key with password
      const encryptedKeyData = await exportEncryptedKey(encryptionKey, password)

      // Store encrypted key on server for backup
      const response = await fetch('/api/v1/encryption/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encryptedKeyData),
      })

      if (!response.ok) {
        throw new Error('Failed to store encryption key backup')
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      console.error('Encryption setup failed:', err)
      setSetupError(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setIsSettingUp(false)
    }
  }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Initializing encryption...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Encryption Error</h2>
          <p className="text-red-600">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Secure Your Health Data
          </h2>
          <p className="text-gray-800">
            Set up end-to-end encryption to protect your sensitive health information
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">What is this?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your data is encrypted on your device</li>
            <li>• Only you can decrypt your health information</li>
            <li>• Create a strong password to protect your encryption key</li>
            <li>• Store this password securely - we cannot recover it</li>
          </ul>
        </div>

        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Encryption Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="At least 12 characters"
              required
              minLength={12}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Re-enter your password"
              required
              minLength={12}
            />
          </div>

          {setupError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{setupError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSettingUp}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSettingUp ? 'Setting up...' : 'Enable Encryption'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Skip for Now
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-700 text-center">
            Your encryption password is never sent to our servers. Make sure to store it in a
            secure password manager.
          </p>
        </div>
      </div>
    </div>
  )
}
