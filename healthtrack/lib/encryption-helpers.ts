/**
 * Helper functions for working with encrypted data in the database
 */

import { encrypt, decrypt, type EncryptedData } from './encryption'

/**
 * Prepare encrypted field for database storage
 */
export function serializeEncryptedField(encrypted: EncryptedData): string {
  return JSON.stringify(encrypted)
}

/**
 * Parse encrypted field from database
 */
export function deserializeEncryptedField(serialized: string): EncryptedData {
  return JSON.parse(serialized)
}

/**
 * Encrypt sensitive fields in an object
 * Returns new object with specified fields encrypted
 */
export async function encryptFields<T extends Record<string, any>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[],
  key: CryptoKey
): Promise<T & Record<string, any>> {
  const result = { ...obj }

  for (const field of fieldsToEncrypt) {
    const value = obj[field]
    if (value !== undefined && value !== null) {
      const encrypted = await encrypt(String(value), key)
      result[`${String(field)}_encrypted`] = serializeEncryptedField(encrypted)
      delete result[field] // Remove plaintext
    }
  }

  return result
}

/**
 * Decrypt sensitive fields in an object
 * Returns new object with specified fields decrypted
 */
export async function decryptFields<T extends Record<string, any>>(
  obj: T,
  fieldsToDecrypt: string[],
  key: CryptoKey
): Promise<T & Record<string, any>> {
  const result = { ...obj }

  for (const field of fieldsToDecrypt) {
    const encryptedField = `${field}_encrypted`
    const encryptedValue = obj[encryptedField]

    if (encryptedValue) {
      try {
        const encrypted = deserializeEncryptedField(encryptedValue)
        const decrypted = await decrypt(encrypted.ciphertext, encrypted.iv, key)
        result[field] = decrypted
        delete result[encryptedField] // Remove encrypted version
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error)
      }
    }
  }

  return result
}

/**
 * Check if a field is encrypted
 */
export function isFieldEncrypted(obj: Record<string, any>, field: string): boolean {
  return `${field}_encrypted` in obj
}

/**
 * Fields that should be encrypted in each model
 */
export const ENCRYPTED_FIELDS = {
  HealthMetric: ['notes'],
  Medication: ['notes', 'sideEffects', 'instructions'],
  LabResult: ['notes'],
  Appointment: ['notes', 'reason'],
  MedicalFile: ['description'],
  Immunization: ['notes'],
  Allergy: ['notes', 'reaction'],
  Condition: ['notes', 'treatment'],
  HealthGoal: ['description'],
  MoodEntry: ['notes'],
  NutritionEntry: ['notes'],
  ExerciseSession: ['notes'],
  SleepSession: ['notes'],
  MenstrualCycle: ['notes'],
  PatientProfile: ['medicalHistory'],
  EmergencyContact: ['notes'],
  CareTeamMember: ['notes'],
} as const

/**
 * Get encrypted fields for a model
 */
export function getEncryptedFieldsForModel(
  modelName: keyof typeof ENCRYPTED_FIELDS
): readonly string[] {
  return ENCRYPTED_FIELDS[modelName] || []
}
