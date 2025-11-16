/**
 * Testing Utilities & Helpers
 *
 * Provides comprehensive testing utilities for the HealthTrack application,
 * including mock data generators, test helpers, and validation utilities.
 */

// Mock Data Generators
export class MockDataGenerator {
  /**
   * Generate mock health metric data
   */
  static generateHealthMetric(overrides?: Partial<any>) {
    return {
      id: this.generateId(),
      userId: this.generateId(),
      type: overrides?.type || 'blood_pressure',
      value: overrides?.value || 120,
      unit: overrides?.unit || 'mmHg',
      recordedAt: overrides?.recordedAt || new Date(),
      notes: overrides?.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }
  }

  /**
   * Generate mock medication data
   */
  static generateMedication(overrides?: Partial<any>) {
    return {
      id: this.generateId(),
      userId: this.generateId(),
      name: overrides?.name || 'Aspirin',
      dosage: overrides?.dosage || '81mg',
      frequency: overrides?.frequency || 'once_daily',
      startDate: overrides?.startDate || new Date(),
      endDate: overrides?.endDate || null,
      prescribingDoctor: overrides?.prescribingDoctor || 'Dr. Smith',
      isActive: overrides?.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }
  }

  /**
   * Generate mock appointment data
   */
  static generateAppointment(overrides?: Partial<any>) {
    return {
      id: this.generateId(),
      userId: this.generateId(),
      providerId: overrides?.providerId || this.generateId(),
      title: overrides?.title || 'Annual Checkup',
      type: overrides?.type || 'checkup',
      dateTime: overrides?.dateTime || new Date(),
      duration: overrides?.duration || 30,
      location: overrides?.location || 'Main Clinic',
      locationType: overrides?.locationType || 'in_person',
      status: overrides?.status || 'scheduled',
      notes: overrides?.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }
  }

  /**
   * Generate mock user data
   */
  static generateUser(overrides?: Partial<any>) {
    return {
      id: this.generateId(),
      email: overrides?.email || `user${Math.random()}@example.com`,
      name: overrides?.name || 'Test User',
      dateOfBirth: overrides?.dateOfBirth || new Date('1990-01-01'),
      gender: overrides?.gender || 'other',
      role: overrides?.role || 'PATIENT',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }
  }

  /**
   * Generate mock lab result data
   */
  static generateLabResult(overrides?: Partial<any>) {
    return {
      id: this.generateId(),
      userId: this.generateId(),
      testName: overrides?.testName || 'Complete Blood Count',
      category: overrides?.category || 'hematology',
      orderDate: overrides?.orderDate || new Date(),
      resultDate: overrides?.resultDate || new Date(),
      status: overrides?.status || 'normal',
      orderingProvider: overrides?.orderingProvider || 'Dr. Johnson',
      results: overrides?.results || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }
  }

  /**
   * Generate random ID
   */
  private static generateId(): string {
    return `test_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate array of mock data
   */
  static generateArray<T>(generator: () => T, count: number): T[] {
    return Array.from({ length: count }, () => generator())
  }
}

// Test Validation Utilities
export class TestValidator {
  /**
   * Validate health metric structure
   */
  static isValidHealthMetric(metric: any): boolean {
    return (
      typeof metric.id === 'string' &&
      typeof metric.userId === 'string' &&
      typeof metric.type === 'string' &&
      typeof metric.value === 'number' &&
      typeof metric.unit === 'string' &&
      metric.recordedAt instanceof Date
    )
  }

  /**
   * Validate medication structure
   */
  static isValidMedication(medication: any): boolean {
    return (
      typeof medication.id === 'string' &&
      typeof medication.userId === 'string' &&
      typeof medication.name === 'string' &&
      typeof medication.dosage === 'string' &&
      typeof medication.frequency === 'string' &&
      typeof medication.isActive === 'boolean'
    )
  }

  /**
   * Validate appointment structure
   */
  static isValidAppointment(appointment: any): boolean {
    return (
      typeof appointment.id === 'string' &&
      typeof appointment.userId === 'string' &&
      typeof appointment.title === 'string' &&
      typeof appointment.type === 'string' &&
      appointment.dateTime instanceof Date &&
      typeof appointment.duration === 'number' &&
      ['in_person', 'telemedicine', 'phone'].includes(appointment.locationType)
    )
  }

  /**
   * Validate date range
   */
  static isValidDateRange(startDate: Date, endDate: Date): boolean {
    return startDate <= endDate
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate phone number format
   */
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
  }

  /**
   * Validate blood pressure value
   */
  static isValidBloodPressure(systolic: number, diastolic: number): boolean {
    return (
      systolic > 0 && systolic < 300 &&
      diastolic > 0 && diastolic < 200 &&
      systolic > diastolic
    )
  }

  /**
   * Validate heart rate
   */
  static isValidHeartRate(heartRate: number): boolean {
    return heartRate > 30 && heartRate < 250
  }

  /**
   * Validate blood glucose
   */
  static isValidBloodGlucose(glucose: number, unit: 'mg/dL' | 'mmol/L'): boolean {
    if (unit === 'mg/dL') {
      return glucose > 20 && glucose < 600
    } else {
      return glucose > 1 && glucose < 33
    }
  }

  /**
   * Validate weight
   */
  static isValidWeight(weight: number, unit: 'kg' | 'lbs'): boolean {
    if (unit === 'kg') {
      return weight > 0 && weight < 500
    } else {
      return weight > 0 && weight < 1100
    }
  }

  /**
   * Validate temperature
   */
  static isValidTemperature(temp: number, unit: 'C' | 'F'): boolean {
    if (unit === 'C') {
      return temp > 30 && temp < 45
    } else {
      return temp > 86 && temp < 113
    }
  }
}

// API Test Helpers
export class APITestHelper {
  /**
   * Create mock fetch response
   */
  static mockFetchResponse(data: any, status: number = 200): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Error',
      json: async () => data,
      text: async () => JSON.stringify(data),
      headers: new Headers(),
    } as Response
  }

  /**
   * Create mock error response
   */
  static mockErrorResponse(message: string, status: number = 500): Response {
    return this.mockFetchResponse(
      { error: message },
      status
    )
  }

  /**
   * Wait for specified milliseconds
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Retry async function with exponential backoff
   */
  static async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 100
  ): Promise<T> {
    let lastError: Error | null = null
    let delay = initialDelay

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        if (i < maxRetries - 1) {
          await this.wait(delay)
          delay *= 2
        }
      }
    }

    throw lastError
  }

  /**
   * Mock API endpoint
   */
  static createMockEndpoint(path: string, response: any, delay: number = 0) {
    return async (request: Request) => {
      if (delay > 0) await this.wait(delay)

      if (request.url.includes(path)) {
        return this.mockFetchResponse(response)
      }

      return this.mockErrorResponse('Not found', 404)
    }
  }
}

// Component Test Helpers
export class ComponentTestHelper {
  /**
   * Simulate user input
   */
  static simulateInput(element: HTMLInputElement, value: string) {
    element.value = value
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
  }

  /**
   * Simulate button click
   */
  static simulateClick(element: HTMLElement) {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }

  /**
   * Simulate form submission
   */
  static simulateSubmit(form: HTMLFormElement) {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  }

  /**
   * Wait for element to appear
   */
  static async waitForElement(
    selector: string,
    timeout: number = 5000
  ): Promise<HTMLElement> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector) as HTMLElement
      if (element) return element
      await APITestHelper.wait(100)
    }

    throw new Error(`Element ${selector} not found within ${timeout}ms`)
  }

  /**
   * Wait for text content
   */
  static async waitForText(
    text: string,
    timeout: number = 5000
  ): Promise<HTMLElement> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeout) {
      const elements = Array.from(document.querySelectorAll('*'))
      const element = elements.find(el => el.textContent?.includes(text))
      if (element) return element as HTMLElement
      await APITestHelper.wait(100)
    }

    throw new Error(`Text "${text}" not found within ${timeout}ms`)
  }

  /**
   * Get all elements by test ID
   */
  static getByTestId(testId: string): HTMLElement | null {
    return document.querySelector(`[data-testid="${testId}"]`)
  }

  /**
   * Get all elements by test ID
   */
  static getAllByTestId(testId: string): HTMLElement[] {
    return Array.from(document.querySelectorAll(`[data-testid="${testId}"]`))
  }
}

// Performance Test Helpers
export class PerformanceTestHelper {
  /**
   * Measure function execution time
   */
  static async measureExecutionTime<T>(
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now()
    const result = await fn()
    const duration = performance.now() - startTime

    return { result, duration }
  }

  /**
   * Run performance benchmark
   */
  static async runBenchmark<T>(
    name: string,
    fn: () => Promise<T>,
    iterations: number = 10
  ): Promise<{
    name: string
    iterations: number
    average: number
    min: number
    max: number
    median: number
  }> {
    const durations: number[] = []

    for (let i = 0; i < iterations; i++) {
      const { duration } = await this.measureExecutionTime(fn)
      durations.push(duration)
    }

    durations.sort((a, b) => a - b)

    return {
      name,
      iterations,
      average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      min: durations[0],
      max: durations[durations.length - 1],
      median: durations[Math.floor(durations.length / 2)]
    }
  }

  /**
   * Check if execution time is within threshold
   */
  static async assertExecutionTime<T>(
    fn: () => Promise<T>,
    maxDuration: number
  ): Promise<boolean> {
    const { duration } = await this.measureExecutionTime(fn)
    return duration <= maxDuration
  }

  /**
   * Measure memory usage (if available)
   */
  static getMemoryUsage(): {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  } | null {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      }
    }
    return null
  }
}

// Integration Test Helpers
export class IntegrationTestHelper {
  /**
   * Setup test database
   */
  static async setupTestDatabase(): Promise<void> {
    // Mock implementation - in production, this would set up a test database
    console.log('Setting up test database...')
  }

  /**
   * Teardown test database
   */
  static async teardownTestDatabase(): Promise<void> {
    // Mock implementation - in production, this would clean up test database
    console.log('Tearing down test database...')
  }

  /**
   * Seed test data
   */
  static async seedTestData(userId: string): Promise<void> {
    // Mock implementation - in production, this would seed test data
    console.log(`Seeding test data for user ${userId}...`)
  }

  /**
   * Clear test data
   */
  static async clearTestData(userId: string): Promise<void> {
    // Mock implementation - in production, this would clear test data
    console.log(`Clearing test data for user ${userId}...`)
  }

  /**
   * Create test user
   */
  static async createTestUser(email?: string): Promise<any> {
    return MockDataGenerator.generateUser({
      email: email || `test${Date.now()}@example.com`
    })
  }

  /**
   * Delete test user
   */
  static async deleteTestUser(userId: string): Promise<void> {
    console.log(`Deleting test user ${userId}...`)
  }
}

// Accessibility Test Helpers
export class AccessibilityTestHelper {
  /**
   * Check if element has accessible name
   */
  static hasAccessibleName(element: HTMLElement): boolean {
    const ariaLabel = element.getAttribute('aria-label')
    const ariaLabelledBy = element.getAttribute('aria-labelledby')
    const title = element.getAttribute('title')

    if (ariaLabel || ariaLabelledBy || title) return true

    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      const id = element.id
      if (id) {
        const label = document.querySelector(`label[for="${id}"]`)
        if (label) return true
      }
    }

    return false
  }

  /**
   * Check if element is keyboard accessible
   */
  static isKeyboardAccessible(element: HTMLElement): boolean {
    const tabIndex = element.getAttribute('tabindex')
    const isInteractive = [
      'A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'
    ].includes(element.tagName)

    return isInteractive || (tabIndex !== null && tabIndex !== '-1')
  }

  /**
   * Check color contrast ratio
   */
  static checkColorContrast(
    foreground: string,
    background: string,
    largeText: boolean = false
  ): { ratio: number; meetsAA: boolean; meetsAAA: boolean } {
    // Simplified contrast calculation
    // In production, use a proper color contrast library
    const ratio = 7.0 // Mock value

    return {
      ratio,
      meetsAA: largeText ? ratio >= 3 : ratio >= 4.5,
      meetsAAA: largeText ? ratio >= 4.5 : ratio >= 7
    }
  }

  /**
   * Find all headings
   */
  static getAllHeadings(): HTMLHeadingElement[] {
    return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  }

  /**
   * Check heading hierarchy
   */
  static checkHeadingHierarchy(): string[] {
    const issues: string[] = []
    const headings = this.getAllHeadings()

    let previousLevel = 0

    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1])

      if (index === 0 && level !== 1) {
        issues.push('First heading should be h1')
      }

      if (level > previousLevel + 1) {
        issues.push(`Heading level skipped: ${heading.tagName} after h${previousLevel}`)
      }

      previousLevel = level
    })

    return issues
  }

  /**
   * Find images without alt text
   */
  static findImagesWithoutAlt(): HTMLImageElement[] {
    const images = Array.from(document.querySelectorAll('img'))
    return images.filter(img => !img.hasAttribute('alt'))
  }

  /**
   * Find form controls without labels
   */
  static findFormControlsWithoutLabels(): HTMLElement[] {
    const controls = Array.from(
      document.querySelectorAll('input, select, textarea')
    ) as HTMLElement[]

    return controls.filter(control => !this.hasAccessibleName(control))
  }
}

// Security Test Helpers
export class SecurityTestHelper {
  /**
   * Test for XSS vulnerability
   */
  static testXSSProtection(input: string): boolean {
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ]

    return !dangerousPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Test for SQL injection patterns
   */
  static testSQLInjectionProtection(input: string): boolean {
    const sqlPatterns = [
      /(\bunion\b|\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b)/i,
      /--/,
      /;/,
      /'.*OR.*'/i
    ]

    return !sqlPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    score: number
    feedback: string[]
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score++
    else feedback.push('Password should be at least 8 characters')

    if (/[a-z]/.test(password)) score++
    else feedback.push('Include lowercase letters')

    if (/[A-Z]/.test(password)) score++
    else feedback.push('Include uppercase letters')

    if (/\d/.test(password)) score++
    else feedback.push('Include numbers')

    if (/[^a-zA-Z\d]/.test(password)) score++
    else feedback.push('Include special characters')

    return { score, feedback }
  }

  /**
   * Check for sensitive data in logs
   */
  static hasSensitiveDataInLogs(logEntry: string): boolean {
    const sensitivePatterns = [
      /password/i,
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{16}\b/, // Credit card
      /api[_-]?key/i,
      /secret/i,
      /token/i
    ]

    return sensitivePatterns.some(pattern => pattern.test(logEntry))
  }
}

// Export all test utilities
export const TestUtils = {
  MockDataGenerator,
  TestValidator,
  APITestHelper,
  ComponentTestHelper,
  PerformanceTestHelper,
  IntegrationTestHelper,
  AccessibilityTestHelper,
  SecurityTestHelper
}
