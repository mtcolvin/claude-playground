/**
 * React hooks for encryption
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  encryptFile,
  decryptFile,
  type EncryptedData,
  type FileMetadata,
} from '@/lib/encryption'
import {
  initializeEncryptionKey,
  clearAllKeys,
  hasEncryptionKey,
} from '@/lib/encryption-storage'

/**
 * Main encryption hook
 */
export function useEncryption() {
  const { data: session } = useSession()
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Initialize encryption key when user logs in
  useEffect(() => {
    async function initialize() {
      if (!session?.user?.id) {
        setEncryptionKey(null)
        setIsInitializing(false)
        return
      }

      try {
        setIsInitializing(true)
        const key = await initializeEncryptionKey(session.user.id)
        setEncryptionKey(key)
        setError(null)
      } catch (err) {
        console.error('Failed to initialize encryption:', err)
        setError(err as Error)
      } finally {
        setIsInitializing(false)
      }
    }

    initialize()
  }, [session?.user?.id])

  // Encrypt text
  const encryptText = useCallback(
    async (text: string): Promise<EncryptedData | null> => {
      if (!encryptionKey) {
        console.error('Encryption key not initialized')
        return null
      }

      try {
        return await encrypt(text, encryptionKey)
      } catch (err) {
        console.error('Encryption failed:', err)
        return null
      }
    },
    [encryptionKey]
  )

  // Decrypt text
  const decryptText = useCallback(
    async (ciphertext: string, iv: string): Promise<string | null> => {
      if (!encryptionKey) {
        console.error('Encryption key not initialized')
        return null
      }

      try {
        return await decrypt(ciphertext, iv, encryptionKey)
      } catch (err) {
        console.error('Decryption failed:', err)
        return null
      }
    },
    [encryptionKey]
  )

  // Encrypt object
  const encryptData = useCallback(
    async <T,>(data: T): Promise<EncryptedData | null> => {
      if (!encryptionKey) {
        console.error('Encryption key not initialized')
        return null
      }

      try {
        return await encryptObject(data, encryptionKey)
      } catch (err) {
        console.error('Object encryption failed:', err)
        return null
      }
    },
    [encryptionKey]
  )

  // Decrypt object
  const decryptData = useCallback(
    async <T,>(ciphertext: string, iv: string): Promise<T | null> => {
      if (!encryptionKey) {
        console.error('Encryption key not initialized')
        return null
      }

      try {
        return await decryptObject<T>(ciphertext, iv, encryptionKey)
      } catch (err) {
        console.error('Object decryption failed:', err)
        return null
      }
    },
    [encryptionKey]
  )

  // Encrypt file
  const encryptFileData = useCallback(
    async (
      file: File
    ): Promise<{ encryptedData: Blob; iv: string; metadata: FileMetadata } | null> => {
      if (!encryptionKey) {
        console.error('Encryption key not initialized')
        return null
      }

      try {
        return await encryptFile(file, encryptionKey)
      } catch (err) {
        console.error('File encryption failed:', err)
        return null
      }
    },
    [encryptionKey]
  )

  // Decrypt file
  const decryptFileData = useCallback(
    async (
      encryptedBlob: Blob,
      iv: string,
      metadata: FileMetadata
    ): Promise<File | null> => {
      if (!encryptionKey) {
        console.error('Encryption key not initialized')
        return null
      }

      try {
        return await decryptFile(encryptedBlob, iv, encryptionKey, metadata)
      } catch (err) {
        console.error('File decryption failed:', err)
        return null
      }
    },
    [encryptionKey]
  )

  // Clear encryption keys (for logout)
  const clearKeys = useCallback(async () => {
    if (session?.user?.id) {
      await clearAllKeys(session.user.id)
      setEncryptionKey(null)
    }
  }, [session?.user?.id])

  return {
    isReady: !isInitializing && !!encryptionKey,
    isInitializing,
    error,
    encryptText,
    decryptText,
    encryptData,
    decryptData,
    encryptFileData,
    decryptFileData,
    clearKeys,
  }
}

/**
 * Hook for encrypted field (auto encrypt/decrypt)
 */
export function useEncryptedField(initialValue: string = '') {
  const { encryptText, decryptText, isReady } = useEncryption()
  const [value, setValue] = useState(initialValue)
  const [encryptedValue, setEncryptedValue] = useState<EncryptedData | null>(null)
  const [isEncrypting, setIsEncrypting] = useState(false)

  // Encrypt value when it changes
  useEffect(() => {
    if (!isReady || !value) {
      setEncryptedValue(null)
      return
    }

    let cancelled = false

    async function doEncrypt() {
      setIsEncrypting(true)
      const encrypted = await encryptText(value)
      if (!cancelled) {
        setEncryptedValue(encrypted)
        setIsEncrypting(false)
      }
    }

    doEncrypt()

    return () => {
      cancelled = true
    }
  }, [value, encryptText, isReady])

  return {
    value,
    setValue,
    encryptedValue,
    isEncrypting,
    isReady,
  }
}

/**
 * Hook for managing encrypted state
 */
export function useEncryptedState<T>(initialValue: T) {
  const { encryptData, decryptData, isReady } = useEncryption()
  const [value, setValue] = useState<T>(initialValue)
  const [encryptedValue, setEncryptedValue] = useState<EncryptedData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Encrypt value when it changes
  useEffect(() => {
    if (!isReady) return

    let cancelled = false

    async function doEncrypt() {
      setIsProcessing(true)
      const encrypted = await encryptData(value)
      if (!cancelled) {
        setEncryptedValue(encrypted)
        setIsProcessing(false)
      }
    }

    doEncrypt()

    return () => {
      cancelled = true
    }
  }, [value, encryptData, isReady])

  // Load encrypted value
  const loadEncrypted = useCallback(
    async (ciphertext: string, iv: string) => {
      if (!isReady) return

      setIsProcessing(true)
      const decrypted = await decryptData<T>(ciphertext, iv)
      if (decrypted) {
        setValue(decrypted)
      }
      setIsProcessing(false)
    },
    [decryptData, isReady]
  )

  return {
    value,
    setValue,
    encryptedValue,
    loadEncrypted,
    isProcessing,
    isReady,
  }
}
