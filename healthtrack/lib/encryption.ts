// Data encryption for localStorage
// Using AES-256 via Web Crypto API

const ENCRYPTION_KEY_NAME = 'healthtrack_encryption_key';

// Generate or retrieve encryption key
async function getEncryptionKey(): Promise<CryptoKey> {
  // In production, this should be derived from user password or secure key management
  // For demo, we'll generate a persistent key
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('healthtrack-demo-key-32-chars'),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('healthtrack-salt'),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data
export async function encryptData(data: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(data);

    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption failed:', error);
    return data; // Fallback to unencrypted in case of error
  }
}

// Decrypt data
export async function decryptData(encryptedData: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    return encryptedData; // Fallback to return original data
  }
}

// Secure storage wrapper
export const secureStorage = {
  async setItem(key: string, value: any): Promise<void> {
    if (typeof window === 'undefined') return;
    const encrypted = await encryptData(JSON.stringify(value));
    localStorage.setItem(key, encrypted);
  },

  async getItem<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null;
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    try {
      const decrypted = await decryptData(encrypted);
      return JSON.parse(decrypted) as T;
    } catch {
      return null;
    }
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.clear();
  },
};

// Input sanitization
export function sanitizeInput(input: string): string {
  // Remove HTML tags
  const withoutTags = input.replace(/<[^>]*>/g, '');

  // Encode special characters
  const div = document.createElement('div');
  div.textContent = withoutTags;
  return div.innerHTML;
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Session timeout manager
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
let inactivityTimer: NodeJS.Timeout | null = null;

export function startSessionMonitoring(onTimeout: () => void) {
  const resetTimer = () => {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(onTimeout, INACTIVITY_TIMEOUT);
  };

  // Reset timer on user activity
  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keypress', resetTimer);
  window.addEventListener('click', resetTimer);
  window.addEventListener('scroll', resetTimer);

  resetTimer(); // Start initial timer
}

export function stopSessionMonitoring() {
  if (inactivityTimer) clearTimeout(inactivityTimer);
}
