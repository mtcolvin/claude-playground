/**
 * Performance Benchmarking Utilities
 *
 * Comprehensive performance measurement, analysis, and optimization tools
 * for monitoring application speed, resource usage, and bottlenecks.
 */

// Performance Metrics
export interface PerformanceMetric {
  name: string
  category: 'api' | 'component' | 'database' | 'calculation' | 'render'
  duration: number
  timestamp: Date
  metadata?: Record<string, any>
}

export interface BenchmarkResult {
  name: string
  iterations: number
  average: number
  median: number
  min: number
  max: number
  standardDeviation: number
  percentile95: number
  percentile99: number
  throughput: number // ops/second
}

// Benchmark Runner
export class BenchmarkRunner {
  private results: Map<string, PerformanceMetric[]> = new Map()

  /**
   * Run benchmark with specified iterations
   */
  async runBenchmark<T>(
    name: string,
    fn: () => Promise<T> | T,
    iterations: number = 100,
    category: PerformanceMetric['category'] = 'calculation'
  ): Promise<BenchmarkResult> {
    const durations: number[] = []

    // Warm-up run
    await fn()

    // Benchmark runs
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now()
      await fn()
      const duration = performance.now() - startTime
      durations.push(duration)

      // Store metric
      this.recordMetric({
        name,
        category,
        duration,
        timestamp: new Date()
      })
    }

    // Calculate statistics
    const sorted = [...durations].sort((a, b) => a - b)
    const average = durations.reduce((sum, d) => sum + d, 0) / iterations
    const median = sorted[Math.floor(iterations / 2)]
    const min = sorted[0]
    const max = sorted[iterations - 1]

    // Standard deviation
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - average, 2), 0) / iterations
    const standardDeviation = Math.sqrt(variance)

    // Percentiles
    const percentile95 = sorted[Math.floor(iterations * 0.95)]
    const percentile99 = sorted[Math.floor(iterations * 0.99)]

    // Throughput (operations per second)
    const throughput = 1000 / average

    return {
      name,
      iterations,
      average,
      median,
      min,
      max,
      standardDeviation,
      percentile95,
      percentile99,
      throughput
    }
  }

  /**
   * Compare two benchmarks
   */
  async compareBenchmarks<T>(
    name: string,
    baseline: () => Promise<T> | T,
    optimized: () => Promise<T> | T,
    iterations: number = 100
  ): Promise<{
    baseline: BenchmarkResult
    optimized: BenchmarkResult
    improvement: number // percentage
    verdict: 'faster' | 'slower' | 'similar'
  }> {
    const baselineResult = await this.runBenchmark(`${name} (baseline)`, baseline, iterations)
    const optimizedResult = await this.runBenchmark(`${name} (optimized)`, optimized, iterations)

    const improvement = ((baselineResult.average - optimizedResult.average) / baselineResult.average) * 100

    let verdict: 'faster' | 'slower' | 'similar' = 'similar'
    if (improvement > 5) verdict = 'faster'
    else if (improvement < -5) verdict = 'slower'

    return {
      baseline: baselineResult,
      optimized: optimizedResult,
      improvement,
      verdict
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    if (!this.results.has(metric.name)) {
      this.results.set(metric.name, [])
    }

    this.results.get(metric.name)!.push(metric)
  }

  /**
   * Get metrics for a specific operation
   */
  getMetrics(name: string): PerformanceMetric[] {
    return this.results.get(name) || []
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, PerformanceMetric[]> {
    return this.results
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.results.clear()
  }
}

// Database Performance Monitor
export class DatabasePerformanceMonitor {
  private queryMetrics: Map<string, number[]> = new Map()

  /**
   * Measure query execution time
   */
  async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now()
    const result = await queryFn()
    const duration = performance.now() - startTime

    // Record metric
    if (!this.queryMetrics.has(queryName)) {
      this.queryMetrics.set(queryName, [])
    }
    this.queryMetrics.get(queryName)!.push(duration)

    return { result, duration }
  }

  /**
   * Get query statistics
   */
  getQueryStats(queryName: string): {
    count: number
    average: number
    min: number
    max: number
  } | null {
    const metrics = this.queryMetrics.get(queryName)
    if (!metrics || metrics.length === 0) return null

    return {
      count: metrics.length,
      average: metrics.reduce((sum, d) => sum + d, 0) / metrics.length,
      min: Math.min(...metrics),
      max: Math.max(...metrics)
    }
  }

  /**
   * Get slow queries (> threshold ms)
   */
  getSlowQueries(threshold: number = 1000): Array<{
    name: string
    average: number
  }> {
    const slowQueries: Array<{ name: string; average: number }> = []

    for (const [name, metrics] of this.queryMetrics.entries()) {
      const average = metrics.reduce((sum, d) => sum + d, 0) / metrics.length
      if (average > threshold) {
        slowQueries.push({ name, average })
      }
    }

    return slowQueries.sort((a, b) => b.average - a.average)
  }
}

// Component Render Performance
export class ComponentRenderMonitor {
  private renderMetrics: Map<string, number[]> = new Map()

  /**
   * Measure component render time
   */
  measureRender(componentName: string, duration: number): void {
    if (!this.renderMetrics.has(componentName)) {
      this.renderMetrics.set(componentName, [])
    }

    this.renderMetrics.get(componentName)!.push(duration)
  }

  /**
   * Get component render statistics
   */
  getComponentStats(componentName: string): {
    renders: number
    average: number
    min: number
    max: number
  } | null {
    const metrics = this.renderMetrics.get(componentName)
    if (!metrics || metrics.length === 0) return null

    return {
      renders: metrics.length,
      average: metrics.reduce((sum, d) => sum + d, 0) / metrics.length,
      min: Math.min(...metrics),
      max: Math.max(...metrics)
    }
  }

  /**
   * Get slow components (> threshold ms)
   */
  getSlowComponents(threshold: number = 16): Array<{
    name: string
    average: number
  }> {
    const slowComponents: Array<{ name: string; average: number }> = []

    for (const [name, metrics] of this.renderMetrics.entries()) {
      const average = metrics.reduce((sum, d) => sum + d, 0) / metrics.length
      if (average > threshold) {
        slowComponents.push({ name, average })
      }
    }

    return slowComponents.sort((a, b) => b.average - a.average)
  }
}

// Memory Profiler
export class MemoryProfiler {
  private snapshots: Array<{
    timestamp: Date
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }> = []

  /**
   * Take memory snapshot
   */
  takeSnapshot(): void {
    if (typeof performance === 'undefined' || !(performance as any).memory) {
      console.warn('Memory API not available')
      return
    }

    const memory = (performance as any).memory

    this.snapshots.push({
      timestamp: new Date(),
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    })
  }

  /**
   * Get memory trend
   */
  getMemoryTrend(): {
    current: number
    peak: number
    average: number
    trend: 'increasing' | 'decreasing' | 'stable'
  } {
    if (this.snapshots.length === 0) {
      return { current: 0, peak: 0, average: 0, trend: 'stable' }
    }

    const latest = this.snapshots[this.snapshots.length - 1]
    const peak = Math.max(...this.snapshots.map(s => s.usedJSHeapSize))
    const average = this.snapshots.reduce((sum, s) => sum + s.usedJSHeapSize, 0) / this.snapshots.length

    // Calculate trend (last 10 snapshots)
    const recentSnapshots = this.snapshots.slice(-10)
    if (recentSnapshots.length < 2) {
      return { current: latest.usedJSHeapSize, peak, average, trend: 'stable' }
    }

    const firstRecent = recentSnapshots[0].usedJSHeapSize
    const lastRecent = recentSnapshots[recentSnapshots.length - 1].usedJSHeapSize
    const change = ((lastRecent - firstRecent) / firstRecent) * 100

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (change > 10) trend = 'increasing'
    else if (change < -10) trend = 'decreasing'

    return {
      current: latest.usedJSHeapSize,
      peak,
      average,
      trend
    }
  }

  /**
   * Detect memory leaks
   */
  detectMemoryLeaks(): {
    hasLeak: boolean
    confidence: number
    details: string
  } {
    if (this.snapshots.length < 10) {
      return {
        hasLeak: false,
        confidence: 0,
        details: 'Not enough data to detect memory leaks'
      }
    }

    const trend = this.getMemoryTrend()

    // Check for consistent increase
    const recentSnapshots = this.snapshots.slice(-10)
    const increases = recentSnapshots.slice(1).filter((snapshot, idx) => {
      return snapshot.usedJSHeapSize > recentSnapshots[idx].usedJSHeapSize
    }).length

    const confidence = (increases / 9) * 100

    if (trend.trend === 'increasing' && confidence > 70) {
      return {
        hasLeak: true,
        confidence,
        details: `Memory usage consistently increasing. ${increases}/9 snapshots show growth.`
      }
    }

    return {
      hasLeak: false,
      confidence,
      details: 'No memory leak detected'
    }
  }

  /**
   * Get all snapshots
   */
  getSnapshots(): typeof this.snapshots {
    return this.snapshots
  }

  /**
   * Clear snapshots
   */
  clear(): void {
    this.snapshots = []
  }
}

// Network Performance Monitor
export class NetworkPerformanceMonitor {
  private requests: Array<{
    url: string
    method: string
    duration: number
    size: number
    status: number
    timestamp: Date
  }> = []

  /**
   * Record network request
   */
  recordRequest(
    url: string,
    method: string,
    duration: number,
    size: number,
    status: number
  ): void {
    this.requests.push({
      url,
      method,
      duration,
      size,
      status,
      timestamp: new Date()
    })
  }

  /**
   * Get request statistics
   */
  getStats(): {
    totalRequests: number
    averageDuration: number
    totalDataTransferred: number
    failureRate: number
  } {
    if (this.requests.length === 0) {
      return {
        totalRequests: 0,
        averageDuration: 0,
        totalDataTransferred: 0,
        failureRate: 0
      }
    }

    const totalDuration = this.requests.reduce((sum, r) => sum + r.duration, 0)
    const totalSize = this.requests.reduce((sum, r) => sum + r.size, 0)
    const failures = this.requests.filter(r => r.status >= 400).length

    return {
      totalRequests: this.requests.length,
      averageDuration: totalDuration / this.requests.length,
      totalDataTransferred: totalSize,
      failureRate: (failures / this.requests.length) * 100
    }
  }

  /**
   * Get slow requests (> threshold ms)
   */
  getSlowRequests(threshold: number = 1000): Array<{
    url: string
    duration: number
    size: number
  }> {
    return this.requests
      .filter(r => r.duration > threshold)
      .map(r => ({ url: r.url, duration: r.duration, size: r.size }))
      .sort((a, b) => b.duration - a.duration)
  }

  /**
   * Get failed requests
   */
  getFailedRequests(): Array<{
    url: string
    status: number
    duration: number
  }> {
    return this.requests
      .filter(r => r.status >= 400)
      .map(r => ({ url: r.url, status: r.status, duration: r.duration }))
  }
}

// Performance Budget
export interface PerformanceBudget {
  pageLoadTime: number // ms
  firstContentfulPaint: number // ms
  timeToInteractive: number // ms
  totalBundleSize: number // bytes
  imageSize: number // bytes
  apiResponseTime: number // ms
}

export class PerformanceBudgetChecker {
  private budget: PerformanceBudget

  constructor(budget: PerformanceBudget) {
    this.budget = budget
  }

  /**
   * Check if metrics meet budget
   */
  checkBudget(metrics: Partial<PerformanceBudget>): {
    pass: boolean
    violations: Array<{
      metric: string
      actual: number
      budget: number
      difference: number
    }>
  } {
    const violations: Array<{
      metric: string
      actual: number
      budget: number
      difference: number
    }> = []

    for (const [key, value] of Object.entries(metrics)) {
      const budgetValue = this.budget[key as keyof PerformanceBudget]

      if (budgetValue && value > budgetValue) {
        violations.push({
          metric: key,
          actual: value,
          budget: budgetValue,
          difference: value - budgetValue
        })
      }
    }

    return {
      pass: violations.length === 0,
      violations
    }
  }

  /**
   * Update budget
   */
  updateBudget(updates: Partial<PerformanceBudget>): void {
    this.budget = { ...this.budget, ...updates }
  }

  /**
   * Get current budget
   */
  getBudget(): PerformanceBudget {
    return this.budget
  }
}

// Export singleton instances
export const benchmarkRunner = new BenchmarkRunner()
export const databasePerformanceMonitor = new DatabasePerformanceMonitor()
export const componentRenderMonitor = new ComponentRenderMonitor()
export const memoryProfiler = new MemoryProfiler()
export const networkPerformanceMonitor = new NetworkPerformanceMonitor()

// Default performance budget (strict)
export const defaultPerformanceBudget: PerformanceBudget = {
  pageLoadTime: 3000, // 3 seconds
  firstContentfulPaint: 1000, // 1 second
  timeToInteractive: 3500, // 3.5 seconds
  totalBundleSize: 200000, // 200 KB
  imageSize: 100000, // 100 KB
  apiResponseTime: 500 // 500 ms
}

export const performanceBudgetChecker = new PerformanceBudgetChecker(defaultPerformanceBudget)
