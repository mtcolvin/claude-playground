/**
 * Client-Side Encryption Utilities
 *
 * Implements end-to-end encryption for sensitive health data using:
 * - AES-GCM for symmetric encryption
 * - PBKDF2 for key derivation
 * - Web Crypto API (browser-native)
 *
 * Security Features:
 * - 256-bit AES encryption
 * - Unique initialization vectors (IV) per encryption
 * - Salt-based key derivation
 * - Authenticated encryption (GCM mode)
 */

// Encryption configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12, // 96 bits for GCM
  saltLength: 16,
  pbkdf2Iterations: 100000,
  tagLength: 128, // Authentication tag length
} as const

/**
 * Generate a random encryption key
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      length: ENCRYPTION_CONFIG.keyLength,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  )
}

/**
 * Export key to base64 string for storage
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key)
  return arrayBufferToBase64(exported)
}

/**
 * Import key from base64 string
 */
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(keyString)
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: ENCRYPTION_CONFIG.algorithm },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Derive encryption key from password using PBKDF2
 */
export async function deriveKeyFromPassword(
  password: string,
  salt?: Uint8Array
): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  // Generate or use provided salt
  const keySalt = salt || crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength))

  // Import password as key material
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  // Derive key using PBKDF2
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: keySalt,
      iterations: ENCRYPTION_CONFIG.pbkdf2Iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: ENCRYPTION_CONFIG.algorithm, length: ENCRYPTION_CONFIG.keyLength },
    true,
    ['encrypt', 'decrypt']
  )

  return { key: derivedKey, salt: keySalt }
}

/**
 * Encrypt data using AES-GCM
 */
export async function encrypt(
  data: string,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength))

  // Encrypt data
  const encoded = new TextEncoder().encode(data)
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv: iv,
      tagLength: ENCRYPTION_CONFIG.tagLength,
    },
    key,
    encoded
  )

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv),
  }
}

/**
 * Decrypt data using AES-GCM
 */
export async function decrypt(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  const ciphertextBuffer = base64ToArrayBuffer(ciphertext)
  const ivBuffer = base64ToArrayBuffer(iv)

  const decrypted = await crypto.subtle.decrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv: ivBuffer,
      tagLength: ENCRYPTION_CONFIG.tagLength,
    },
    key,
    ciphertextBuffer
  )

  return new TextDecoder().decode(decrypted)
}

/**
 * Encrypt object (converts to JSON first)
 */
export async function encryptObject<T>(
  obj: T,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const json = JSON.stringify(obj)
  return await encrypt(json, key)
}

/**
 * Decrypt object (parses JSON after decryption)
 */
export async function decryptObject<T>(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<T> {
  const json = await decrypt(ciphertext, iv, key)
  return JSON.parse(json)
}

/**
 * Encrypt file (for medical documents)
 */
export async function encryptFile(
  file: File,
  key: CryptoKey
): Promise<{ encryptedData: Blob; iv: string; metadata: FileMetadata }> {
  const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength))
  const fileBuffer = await file.arrayBuffer()

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv: iv,
      tagLength: ENCRYPTION_CONFIG.tagLength,
    },
    key,
    fileBuffer
  )

  const metadata: FileMetadata = {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: file.lastModified,
  }

  return {
    encryptedData: new Blob([encryptedBuffer]),
    iv: arrayBufferToBase64(iv),
    metadata,
  }
}

/**
 * Decrypt file
 */
export async function decryptFile(
  encryptedBlob: Blob,
  iv: string,
  key: CryptoKey,
  metadata: FileMetadata
): Promise<File> {
  const ivBuffer = base64ToArrayBuffer(iv)
  const encryptedBuffer = await encryptedBlob.arrayBuffer()

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: ENCRYPTION_CONFIG.algorithm,
      iv: ivBuffer,
      tagLength: ENCRYPTION_CONFIG.tagLength,
    },
    key,
    encryptedBuffer
  )

  return new File([decryptedBuffer], metadata.name, {
    type: metadata.type,
    lastModified: metadata.lastModified,
  })
}

// Helper functions

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

// Types

export interface FileMetadata {
  name: string
  type: string
  size: number
  lastModified: number
}

export interface EncryptedData {
  ciphertext: string
  iv: string
}

/**
 * Generate a secure random password for key derivation
 */
export function generateSecurePassword(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
  const randomValues = crypto.getRandomValues(new Uint8Array(length))
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars[randomValues[i] % chars.length]
  }
  return password
}

/**
 * Hash data using SHA-256 (for integrity checks)
 */
export async function hashData(data: string): Promise<string> {
  const encoded = new TextEncoder().encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded)
  return arrayBufferToBase64(hashBuffer)
}

/**
 * Verify data integrity using hash
 */
export async function verifyDataIntegrity(data: string, hash: string): Promise<boolean> {
  const computedHash = await hashData(data)
  return computedHash === hash
}
