/**
 * Encryption Key Storage and Management
 *
 * Handles secure storage and retrieval of user encryption keys
 * Keys are stored in:
 * 1. SessionStorage (temporary, cleared on tab close)
 * 2. IndexedDB (persistent, encrypted with user password)
 * 3. Server backup (encrypted, for key recovery)
 */

import {
  generateEncryptionKey,
  exportKey,
  importKey,
  deriveKeyFromPassword,
  encrypt,
  decrypt,
} from './encryption'

const STORAGE_KEYS = {
  ENCRYPTION_KEY: 'healthtrack_encryption_key',
  KEY_SALT: 'healthtrack_key_salt',
  KEY_ENCRYPTED: 'healthtrack_key_encrypted',
} as const

const DB_NAME = 'HealthTrackEncryption'
const DB_VERSION = 1
const KEY_STORE = 'keys'

/**
 * Initialize or retrieve user's encryption key
 */
export async function initializeEncryptionKey(userId: string): Promise<CryptoKey> {
  // Try to get from session storage first (fastest)
  const sessionKey = getKeyFromSession()
  if (sessionKey) {
    return sessionKey
  }

  // Try to get from IndexedDB
  const storedKey = await getKeyFromIndexedDB(userId)
  if (storedKey) {
    // Store in session for quick access
    await storeKeyInSession(storedKey)
    return storedKey
  }

  // Generate new key if none exists
  const newKey = await generateEncryptionKey()
  await storeKeyInSession(newKey)
  await storeKeyInIndexedDB(userId, newKey)

  return newKey
}

/**
 * Store encryption key in session storage (temporary)
 */
export async function storeKeyInSession(key: CryptoKey): Promise<void> {
  const keyString = await exportKey(key)
  sessionStorage.setItem(STORAGE_KEYS.ENCRYPTION_KEY, keyString)
}

/**
 * Get encryption key from session storage
 */
export function getKeyFromSession(): CryptoKey | null {
  const keyString = sessionStorage.getItem(STORAGE_KEYS.ENCRYPTION_KEY)
  if (!keyString) return null

  try {
    return importKey(keyString) as any // Cast needed for sync return
  } catch (error) {
    console.error('Failed to import key from session:', error)
    return null
  }
}

/**
 * Clear encryption key from session storage
 */
export function clearKeyFromSession(): void {
  sessionStorage.removeItem(STORAGE_KEYS.ENCRYPTION_KEY)
}

/**
 * Store encryption key in IndexedDB
 */
async function storeKeyInIndexedDB(userId: string, key: CryptoKey): Promise<void> {
  const db = await openDatabase()
  const keyString = await exportKey(key)

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([KEY_STORE], 'readwrite')
    const store = transaction.objectStore(KEY_STORE)

    const request = store.put({
      userId,
      key: keyString,
      timestamp: Date.now(),
    })

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get encryption key from IndexedDB
 */
async function getKeyFromIndexedDB(userId: string): Promise<CryptoKey | null> {
  const db = await openDatabase()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([KEY_STORE], 'readonly')
    const store = transaction.objectStore(KEY_STORE)
    const request = store.get(userId)

    request.onsuccess = async () => {
      if (request.result && request.result.key) {
        try {
          const key = await importKey(request.result.key)
          resolve(key)
        } catch (error) {
          console.error('Failed to import key from IndexedDB:', error)
          resolve(null)
        }
      } else {
        resolve(null)
      }
    }

    request.onerror = () => {
      console.error('Failed to get key from IndexedDB:', request.error)
      resolve(null)
    }
  })
}

/**
 * Open IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(KEY_STORE)) {
        const store = db.createObjectStore(KEY_STORE, { keyPath: 'userId' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Export encrypted key for server backup
 */
export async function exportEncryptedKey(
  key: CryptoKey,
  password: string
): Promise<{ encryptedKey: string; iv: string; salt: string }> {
  // Derive key from password
  const { key: passwordKey, salt } = await deriveKeyFromPassword(password)

  // Export the encryption key
  const keyString = await exportKey(key)

  // Encrypt the key with password-derived key
  const { ciphertext, iv } = await encrypt(keyString, passwordKey)

  return {
    encryptedKey: ciphertext,
    iv,
    salt: arrayBufferToBase64(salt),
  }
}

/**
 * Import encrypted key from server backup
 */
export async function importEncryptedKey(
  encryptedKey: string,
  iv: string,
  salt: string,
  password: string
): Promise<CryptoKey> {
  // Derive key from password and salt
  const saltBuffer = base64ToArrayBuffer(salt)
  const { key: passwordKey } = await deriveKeyFromPassword(password, saltBuffer)

  // Decrypt the key
  const keyString = await decrypt(encryptedKey, iv, passwordKey)

  // Import the encryption key
  return await importKey(keyString)
}

/**
 * Clear all stored keys (for logout)
 */
export async function clearAllKeys(userId: string): Promise<void> {
  // Clear session storage
  clearKeyFromSession()

  // Clear IndexedDB
  try {
    const db = await openDatabase()
    const transaction = db.transaction([KEY_STORE], 'readwrite')
    const store = transaction.objectStore(KEY_STORE)
    await store.delete(userId)
  } catch (error) {
    console.error('Failed to clear keys from IndexedDB:', error)
  }
}

/**
 * Check if user has encryption key set up
 */
export async function hasEncryptionKey(userId: string): Promise<boolean> {
  const sessionKey = getKeyFromSession()
  if (sessionKey) return true

  const dbKey = await getKeyFromIndexedDB(userId)
  return !!dbKey
}

// Helper functions
function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
