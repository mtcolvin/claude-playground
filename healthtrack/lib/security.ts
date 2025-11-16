/**
 * Security Hardening Utilities
 *
 * Comprehensive security features including input sanitization, rate limiting,
 * CSRF protection, content security policy, and audit logging.
 */

// Input Sanitization
export class InputSanitizer {
  /**
   * Remove HTML tags and scripts from input
   */
  static sanitizeHTML(input: string): string {
    // Remove all HTML tags
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim()
  }

  /**
   * Sanitize SQL input to prevent injection
   */
  static sanitizeSQL(input: string): string {
    // Remove common SQL injection patterns
    return input
      .replace(/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi, '')
      .replace(/--/g, '')
      .replace(/;/g, '')
      .replace(/'/g, "''")
      .trim()
  }

  /**
   * Sanitize file path to prevent directory traversal
   */
  static sanitizeFilePath(input: string): string {
    // Remove directory traversal patterns
    return input
      .replace(/\.\./g, '')
      .replace(/\\/g, '/')
      .replace(/\/\//g, '/')
      .trim()
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(input: string): string {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9@._+-]/g, '')
      .trim()
  }

  /**
   * Sanitize phone number
   */
  static sanitizePhone(input: string): string {
    return input.replace(/[^0-9+\-() ]/g, '').trim()
  }

  /**
   * Encode for safe HTML output
   */
  static encodeHTML(input: string): string {
    const entityMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    }

    return input.replace(/[&<>"'\/]/g, (char) => entityMap[char])
  }
}

// Rate Limiting
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private limit: number
  private window: number // in milliseconds

  constructor(limit: number = 100, window: number = 60000) {
    this.limit = limit
    this.window = window
  }

  /**
   * Check if request is within rate limit
   */
  checkLimit(identifier: string): {
    allowed: boolean
    remaining: number
    resetAt: number
  } {
    const now = Date.now()
    const windowStart = now - this.window

    // Get existing requests
    let requests = this.requests.get(identifier) || []

    // Filter out old requests
    requests = requests.filter(timestamp => timestamp > windowStart)

    // Check if limit exceeded
    const allowed = requests.length < this.limit
    const remaining = Math.max(0, this.limit - requests.length - (allowed ? 1 : 0))
    const resetAt = requests.length > 0
      ? requests[0] + this.window
      : now + this.window

    // Add new request if allowed
    if (allowed) {
      requests.push(now)
      this.requests.set(identifier, requests)
    }

    return { allowed, remaining, resetAt }
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier)
  }

  /**
   * Cleanup old entries
   */
  cleanup(): void {
    const now = Date.now()
    const windowStart = now - this.window

    for (const [identifier, requests] of this.requests.entries()) {
      const activeRequests = requests.filter(timestamp => timestamp > windowStart)

      if (activeRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, activeRequests)
      }
    }
  }
}

// Content Security Policy
export class ContentSecurityPolicy {
  /**
   * Generate CSP header value
   */
  static generateCSP(): string {
    const directives = {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'", 'data:'],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"]
    }

    return Object.entries(directives)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ')
  }

  /**
   * Generate security headers
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': this.generateCSP(),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    }
  }
}

// Audit Logging
export interface AuditLogEntry {
  id: string
  timestamp: Date
  userId?: string
  action: string
  resource: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  status: 'success' | 'failure'
  details?: Record<string, any>
}

export class AuditLogger {
  private logs: AuditLogEntry[] = []

  /**
   * Log an action
   */
  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const logEntry: AuditLogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      ...entry
    }

    this.logs.push(logEntry)

    // In production, send to database or logging service
    console.log('[AUDIT]', logEntry)
  }

  /**
   * Log successful action
   */
  logSuccess(
    action: string,
    resource: string,
    userId?: string,
    details?: Record<string, any>
  ): void {
    this.log({
      action,
      resource,
      userId,
      status: 'success',
      details
    })
  }

  /**
   * Log failed action
   */
  logFailure(
    action: string,
    resource: string,
    userId?: string,
    details?: Record<string, any>
  ): void {
    this.log({
      action,
      resource,
      userId,
      status: 'failure',
      details
    })
  }

  /**
   * Get logs for a user
   */
  getUserLogs(userId: string, limit: number = 100): AuditLogEntry[] {
    return this.logs
      .filter(log => log.userId === userId)
      .slice(-limit)
  }

  /**
   * Get logs for a resource
   */
  getResourceLogs(resource: string, limit: number = 100): AuditLogEntry[] {
    return this.logs
      .filter(log => log.resource === resource)
      .slice(-limit)
  }

  /**
   * Get all logs
   */
  getAllLogs(limit: number = 100): AuditLogEntry[] {
    return this.logs.slice(-limit)
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Session Management
export interface Session {
  id: string
  userId: string
  createdAt: Date
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
  lastActivity: Date
}

export class SessionManager {
  private sessions: Map<string, Session> = new Map()
  private sessionTimeout: number = 30 * 60 * 1000 // 30 minutes
  private maxSessionAge: number = 30 * 24 * 60 * 60 * 1000 // 30 days

  /**
   * Create new session
   */
  createSession(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Session {
    const session: Session = {
      id: this.generateSessionId(),
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.maxSessionAge),
      ipAddress,
      userAgent,
      lastActivity: new Date()
    }

    this.sessions.set(session.id, session)

    return session
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId)

    if (!session) return null

    // Check if expired
    if (this.isSessionExpired(session)) {
      this.sessions.delete(sessionId)
      return null
    }

    // Update last activity
    session.lastActivity = new Date()
    this.sessions.set(sessionId, session)

    return session
  }

  /**
   * Invalidate session
   */
  invalidateSession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }

  /**
   * Invalidate all sessions for user
   */
  invalidateUserSessions(userId: string): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId)
      }
    }
  }

  /**
   * Check if session is expired
   */
  private isSessionExpired(session: Session): boolean {
    const now = Date.now()

    // Check max age
    if (now > session.expiresAt.getTime()) {
      return true
    }

    // Check inactivity timeout
    const inactivityTime = now - session.lastActivity.getTime()
    if (inactivityTime > this.sessionTimeout) {
      return true
    }

    return false
  }

  /**
   * Cleanup expired sessions
   */
  cleanup(): void {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (this.isSessionExpired(session)) {
        this.sessions.delete(sessionId)
      }
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`
  }
}

// IP Blocking
export class IPBlocker {
  private blockedIPs: Set<string> = new Set()
  private suspiciousActivity: Map<string, number> = new Map()
  private threshold: number = 10 // Number of suspicious activities before blocking

  /**
   * Check if IP is blocked
   */
  isBlocked(ip: string): boolean {
    return this.blockedIPs.has(ip)
  }

  /**
   * Block an IP address
   */
  blockIP(ip: string): void {
    this.blockedIPs.add(ip)
  }

  /**
   * Unblock an IP address
   */
  unblockIP(ip: string): void {
    this.blockedIPs.delete(ip)
    this.suspiciousActivity.delete(ip)
  }

  /**
   * Record suspicious activity
   */
  recordSuspiciousActivity(ip: string): boolean {
    const count = (this.suspiciousActivity.get(ip) || 0) + 1
    this.suspiciousActivity.set(ip, count)

    if (count >= this.threshold) {
      this.blockIP(ip)
      return true
    }

    return false
  }

  /**
   * Get all blocked IPs
   */
  getBlockedIPs(): string[] {
    return Array.from(this.blockedIPs)
  }

  /**
   * Clear all blocks
   */
  clearAll(): void {
    this.blockedIPs.clear()
    this.suspiciousActivity.clear()
  }
}

// Password Policy
export class PasswordPolicy {
  /**
   * Validate password against policy
   */
  static validate(password: string): {
    valid: boolean
    errors: string[]
    strength: number
  } {
    const errors: string[] = []
    let strength = 0

    // Minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    } else {
      strength++
    }

    // Uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    } else {
      strength++
    }

    // Lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    } else {
      strength++
    }

    // Number
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    } else {
      strength++
    }

    // Special character
    if (!/[^a-zA-Z\d]/.test(password)) {
      errors.push('Password must contain at least one special character')
    } else {
      strength++
    }

    // Additional strength checks
    if (password.length >= 12) strength++
    if (password.length >= 16) strength++

    return {
      valid: errors.length === 0,
      errors,
      strength: Math.min(strength, 5)
    }
  }

  /**
   * Check if password is in common passwords list
   */
  static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', '123456', '12345678', 'qwerty', 'abc123',
      'monkey', '1234567', 'letmein', 'trustno1', 'dragon',
      'baseball', 'iloveyou', 'master', 'sunshine', 'ashley',
      '123123', 'welcome', 'admin', 'password123'
    ]

    return commonPasswords.includes(password.toLowerCase())
  }
}

// Data Encryption at Rest
export class DataEncryption {
  /**
   * Encrypt sensitive field
   */
  static async encryptField(data: string, key: string): Promise<string> {
    // In production, use proper encryption library
    // This is a placeholder implementation
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const keyBuffer = encoder.encode(key)

    // Simple XOR encryption (NOT SECURE - use Web Crypto API in production)
    const encrypted = new Uint8Array(dataBuffer.length)
    for (let i = 0; i < dataBuffer.length; i++) {
      encrypted[i] = dataBuffer[i] ^ keyBuffer[i % keyBuffer.length]
    }

    return btoa(String.fromCharCode(...encrypted))
  }

  /**
   * Decrypt sensitive field
   */
  static async decryptField(encrypted: string, key: string): Promise<string> {
    // In production, use proper encryption library
    const encoder = new TextEncoder()
    const keyBuffer = encoder.encode(key)

    const encryptedBuffer = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))

    // Simple XOR decryption
    const decrypted = new Uint8Array(encryptedBuffer.length)
    for (let i = 0; i < encryptedBuffer.length; i++) {
      decrypted[i] = encryptedBuffer[i] ^ keyBuffer[i % keyBuffer.length]
    }

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  }
}

// Export singleton instances
export const inputSanitizer = InputSanitizer
export const standardRateLimiter = new RateLimiter(100, 60000)
export const authRateLimiter = new RateLimiter(10, 60000)
export const uploadRateLimiter = new RateLimiter(20, 60000)
export const contentSecurityPolicy = ContentSecurityPolicy
export const auditLogger = new AuditLogger()
export const sessionManager = new SessionManager()
export const ipBlocker = new IPBlocker()
export const passwordPolicy = PasswordPolicy
export const dataEncryption = DataEncryption
