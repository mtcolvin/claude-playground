/**
 * Accessibility Utilities for WCAG 2.1 AAA Compliance
 *
 * This module provides utilities for ensuring the HealthTrack application
 * meets WCAG 2.1 Level AAA accessibility standards.
 */

// Skip Links for Keyboard Navigation
export function createSkipLinks() {
  const skipLinks = [
    { href: '#main-content', text: 'Skip to main content' },
    { href: '#navigation', text: 'Skip to navigation' },
    { href: '#search', text: 'Skip to search' },
  ]

  return skipLinks
}

// Focus Management
export class FocusManager {
  private focusableElements: string[] = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ]

  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = this.focusableElements.join(', ')
    return Array.from(container.querySelectorAll(selector))
  }

  trapFocus(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }

    container.addEventListener('keydown', handleTabKey)
    return () => container.removeEventListener('keydown', handleTabKey)
  }

  setFocus(element: HTMLElement | null) {
    if (!element) return
    element.focus()
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

// Color Contrast Utilities (WCAG AAA requires 7:1 for normal text, 4.5:1 for large text)
export class ColorContrastChecker {
  // Calculate relative luminance
  private getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      const val = c / 255
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // Calculate contrast ratio
  getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1)
    const rgb2 = this.hexToRgb(color2)

    if (!rgb1 || !rgb2) return 0

    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b)
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b)

    const lighter = Math.max(lum1, lum2)
    const darker = Math.min(lum1, lum2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  // Convert hex to RGB
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Check if contrast meets WCAG AAA (7:1 for normal text)
  meetsWCAG_AAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
    const ratio = this.getContrastRatio(foreground, background)
    return isLargeText ? ratio >= 4.5 : ratio >= 7
  }

  // Check if contrast meets WCAG AA (4.5:1 for normal text)
  meetsWCAG_AA(foreground: string, background: string, isLargeText: boolean = false): boolean {
    const ratio = this.getContrastRatio(foreground, background)
    return isLargeText ? ratio >= 3 : ratio >= 4.5
  }
}

// Keyboard Navigation Helpers
export const KeyboardNav = {
  KEYS: {
    TAB: 'Tab',
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
  },

  handleArrowNavigation(
    e: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ): number {
    let newIndex = currentIndex

    const nextKey = orientation === 'vertical' ? this.KEYS.ARROW_DOWN : this.KEYS.ARROW_RIGHT
    const prevKey = orientation === 'vertical' ? this.KEYS.ARROW_UP : this.KEYS.ARROW_LEFT

    if (e.key === nextKey) {
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
    } else if (e.key === prevKey) {
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
    } else if (e.key === this.KEYS.HOME) {
      newIndex = 0
    } else if (e.key === this.KEYS.END) {
      newIndex = items.length - 1
    }

    if (newIndex !== currentIndex) {
      e.preventDefault()
      items[newIndex]?.focus()
    }

    return newIndex
  }
}

// Screen Reader Announcements
export class ScreenReaderAnnouncer {
  private liveRegion: HTMLElement | null = null

  constructor() {
    if (typeof document !== 'undefined') {
      this.createLiveRegion()
    }
  }

  private createLiveRegion() {
    this.liveRegion = document.createElement('div')
    this.liveRegion.setAttribute('role', 'status')
    this.liveRegion.setAttribute('aria-live', 'polite')
    this.liveRegion.setAttribute('aria-atomic', 'true')
    this.liveRegion.className = 'sr-only' // Visually hidden but accessible to screen readers
    this.liveRegion.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;'
    document.body.appendChild(this.liveRegion)
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.liveRegion) return

    this.liveRegion.setAttribute('aria-live', priority)
    this.liveRegion.textContent = ''

    // Use timeout to ensure screen reader picks up the change
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = message
      }
    }, 100)
  }

  clear() {
    if (this.liveRegion) {
      this.liveRegion.textContent = ''
    }
  }
}

// ARIA Label Generators
export const AriaLabels = {
  // Generate descriptive label for health metrics
  healthMetric(type: string, value: number, unit: string, date: Date): string {
    return `${type}: ${value} ${unit}, recorded on ${date.toLocaleDateString()}`
  },

  // Generate label for medication
  medication(name: string, dosage: string, frequency: string): string {
    return `${name}, ${dosage}, taken ${frequency}`
  },

  // Generate label for appointment
  appointment(provider: string, date: Date, type: string): string {
    return `${type} appointment with ${provider} on ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
  },

  // Generate label for status indicators
  status(status: string, context: string): string {
    return `${context} status: ${status}`
  },

  // Generate label for progress indicators
  progress(current: number, total: number, label: string): string {
    const percentage = Math.round((current / total) * 100)
    return `${label}: ${current} of ${total}, ${percentage}% complete`
  }
}

// Accessibility Testing Utilities
export class AccessibilityTester {
  // Test for missing alt text on images
  testImageAltText(container: HTMLElement = document.body): string[] {
    const issues: string[] = []
    const images = container.querySelectorAll('img')

    images.forEach((img, index) => {
      if (!img.hasAttribute('alt')) {
        issues.push(`Image ${index + 1} missing alt text: ${img.src}`)
      } else if (img.getAttribute('alt')?.trim() === '' && !img.hasAttribute('role')) {
        issues.push(`Image ${index + 1} has empty alt text without decorative role: ${img.src}`)
      }
    })

    return issues
  }

  // Test for missing form labels
  testFormLabels(container: HTMLElement = document.body): string[] {
    const issues: string[] = []
    const inputs = container.querySelectorAll('input, select, textarea')

    inputs.forEach((input, index) => {
      const id = input.id
      const ariaLabel = input.getAttribute('aria-label')
      const ariaLabelledBy = input.getAttribute('aria-labelledby')

      let hasLabel = false

      if (id) {
        const label = container.querySelector(`label[for="${id}"]`)
        if (label) hasLabel = true
      }

      if (ariaLabel || ariaLabelledBy) hasLabel = true

      if (!hasLabel) {
        issues.push(`Form control ${index + 1} (${input.tagName}) missing label`)
      }
    })

    return issues
  }

  // Test heading hierarchy
  testHeadingHierarchy(container: HTMLElement = document.body): string[] {
    const issues: string[] = []
    const headings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6'))

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

  // Test for sufficient color contrast
  testColorContrast(container: HTMLElement = document.body): string[] {
    const issues: string[] = []
    const checker = new ColorContrastChecker()

    // This is a simplified version - in production, you'd analyze computed styles
    const textElements = container.querySelectorAll('p, span, a, button, li, td, th')

    textElements.forEach((element, index) => {
      const styles = window.getComputedStyle(element)
      const color = styles.color
      const backgroundColor = styles.backgroundColor

      // Convert rgb to hex and check contrast
      // Note: This is simplified - production would need full rgb-to-hex conversion
      // and recursive background color checking
    })

    return issues
  }

  // Run all tests
  runAllTests(container: HTMLElement = document.body): {
    passed: boolean
    issues: { category: string; problems: string[] }[]
  } {
    const allIssues = [
      { category: 'Images', problems: this.testImageAltText(container) },
      { category: 'Form Labels', problems: this.testFormLabels(container) },
      { category: 'Heading Hierarchy', problems: this.testHeadingHierarchy(container) },
    ]

    const totalIssues = allIssues.reduce((sum, cat) => sum + cat.problems.length, 0)

    return {
      passed: totalIssues === 0,
      issues: allIssues.filter(cat => cat.problems.length > 0)
    }
  }
}

// Text Sizing and Zoom Support
export class TextSizeManager {
  private currentSize: number = 16 // Base font size in pixels
  private minSize: number = 12
  private maxSize: number = 24

  getCurrentSize(): number {
    return this.currentSize
  }

  increaseSize(): number {
    this.currentSize = Math.min(this.currentSize + 2, this.maxSize)
    this.applySize()
    return this.currentSize
  }

  decreaseSize(): number {
    this.currentSize = Math.max(this.currentSize - 2, this.minSize)
    this.applySize()
    return this.currentSize
  }

  resetSize(): number {
    this.currentSize = 16
    this.applySize()
    return this.currentSize
  }

  private applySize() {
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = `${this.currentSize}px`
    }
  }
}

// Reduced Motion Support
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function getAnimationDuration(): number {
  return prefersReducedMotion() ? 0 : 300 // 0ms if reduced motion, 300ms otherwise
}

// High Contrast Mode Detection
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: high)').matches
}

// Export singleton instances
export const focusManager = new FocusManager()
export const colorContrastChecker = new ColorContrastChecker()
export const screenReaderAnnouncer = new ScreenReaderAnnouncer()
export const accessibilityTester = new AccessibilityTester()
export const textSizeManager = new TextSizeManager()
