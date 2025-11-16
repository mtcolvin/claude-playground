'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Zap, Activity, Database, Cpu, HardDrive, Network, AlertCircle,
  CheckCircle, TrendingUp, TrendingDown, Play, RefreshCw
} from 'lucide-react'
import {
  benchmarkRunner,
  databasePerformanceMonitor,
  componentRenderMonitor,
  memoryProfiler,
  networkPerformanceMonitor,
  performanceBudgetChecker,
  type BenchmarkResult
} from '@/lib/benchmarking'

export function PerformanceBenchmarkDashboard() {
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [memoryTrend, setMemoryTrend] = useState<any>(null)
  const [budgetStatus, setBudgetStatus] = useState<any>(null)

  useEffect(() => {
    // Take memory snapshot every 5 seconds
    const interval = setInterval(() => {
      memoryProfiler.takeSnapshot()
      updateMemoryTrend()
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const updateMemoryTrend = () => {
    const trend = memoryProfiler.getMemoryTrend()
    setMemoryTrend(trend)
  }

  const runBenchmarks = async () => {
    setIsRunning(true)
    const results: BenchmarkResult[] = []

    // Benchmark 1: Array operations
    results.push(await benchmarkRunner.runBenchmark(
      'Array map/filter/reduce',
      () => {
        const arr = Array.from({ length: 1000 }, (_, i) => i)
        return arr.map(x => x * 2).filter(x => x % 2 === 0).reduce((sum, x) => sum + x, 0)
      },
      100,
      'calculation'
    ))

    // Benchmark 2: Object creation
    results.push(await benchmarkRunner.runBenchmark(
      'Object creation (1000 objects)',
      () => {
        const objects = []
        for (let i = 0; i < 1000; i++) {
          objects.push({
            id: i,
            name: `Object ${i}`,
            value: Math.random(),
            timestamp: new Date()
          })
        }
        return objects
      },
      50,
      'calculation'
    ))

    // Benchmark 3: String operations
    results.push(await benchmarkRunner.runBenchmark(
      'String concatenation (1000 ops)',
      () => {
        let str = ''
        for (let i = 0; i < 1000; i++) {
          str += `Item ${i} `
        }
        return str
      },
      50,
      'calculation'
    ))

    // Benchmark 4: JSON parsing
    results.push(await benchmarkRunner.runBenchmark(
      'JSON parse/stringify (large object)',
      () => {
        const obj = {
          data: Array.from({ length: 100 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            value: Math.random(),
            nested: { a: 1, b: 2, c: 3 }
          }))
        }
        return JSON.parse(JSON.stringify(obj))
      },
      100,
      'calculation'
    ))

    // Benchmark 5: DOM queries (simulated)
    results.push(await benchmarkRunner.runBenchmark(
      'DOM query simulation',
      () => {
        if (typeof document !== 'undefined') {
          return document.querySelectorAll('div').length
        }
        return 0
      },
      50,
      'render'
    ))

    setBenchmarkResults(results)

    // Check performance budget
    checkPerformanceBudget()

    setIsRunning(false)
  }

  const checkPerformanceBudget = () => {
    const result = performanceBudgetChecker.checkBudget({
      pageLoadTime: 2500,
      firstContentfulPaint: 900,
      timeToInteractive: 3200,
      totalBundleSize: 180000,
      apiResponseTime: 450
    })

    setBudgetStatus(result)
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Zap className="h-8 w-8 text-yellow-600" />
            Performance Benchmarking
          </h1>
          <p className="text-muted-foreground">
            Measure and optimize application performance
          </p>
        </div>

        <Button
          onClick={runBenchmarks}
          disabled={isRunning}
          size="lg"
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          {isRunning ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              Run Benchmarks
            </>
          )}
        </Button>
      </div>

      {/* Performance Budget */}
      {budgetStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {budgetStatus.pass ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              Performance Budget
            </CardTitle>
            <CardDescription>
              {budgetStatus.pass
                ? 'All metrics within performance budget'
                : `${budgetStatus.violations.length} metric(s) exceeding budget`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetStatus.violations.length > 0 ? (
                budgetStatus.violations.map((violation: any, idx: number) => (
                  <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-red-900">{violation.metric}</p>
                      <Badge variant="destructive">Over Budget</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-red-600">
                        Actual: {violation.actual}ms
                      </span>
                      <span className="text-muted-foreground">
                        Budget: {violation.budget}ms
                      </span>
                      <span className="text-red-600 font-semibold">
                        +{violation.difference}ms
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-900 font-semibold">
                    All performance metrics within budget!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Memory Usage */}
      {memoryTrend && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Memory Usage
            </CardTitle>
            <CardDescription>
              JavaScript heap memory monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Current</p>
                <p className="text-2xl font-bold">{formatBytes(memoryTrend.current)}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Peak</p>
                <p className="text-2xl font-bold">{formatBytes(memoryTrend.peak)}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Average</p>
                <p className="text-2xl font-bold">{formatBytes(memoryTrend.average)}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Trend</p>
                <div className="flex items-center gap-2">
                  {memoryTrend.trend === 'increasing' && (
                    <>
                      <TrendingUp className="h-5 w-5 text-red-600" />
                      <Badge variant="destructive">Increasing</Badge>
                    </>
                  )}
                  {memoryTrend.trend === 'decreasing' && (
                    <>
                      <TrendingDown className="h-5 w-5 text-green-600" />
                      <Badge className="bg-green-600">Decreasing</Badge>
                    </>
                  )}
                  {memoryTrend.trend === 'stable' && (
                    <>
                      <Activity className="h-5 w-5 text-blue-600" />
                      <Badge variant="outline">Stable</Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benchmark Results */}
      {benchmarkResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Benchmark Results</CardTitle>
            <CardDescription>
              Performance metrics for {benchmarkResults.length} operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {benchmarkResults.map((result, idx) => (
                <div key={idx} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{result.name}</h4>
                    <Badge variant="outline">{result.iterations} iterations</Badge>
                  </div>

                  <div className="grid gap-3 md:grid-cols-5">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Average</p>
                      <p className="text-lg font-bold">{result.average.toFixed(2)}ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Median</p>
                      <p className="text-lg font-bold">{result.median.toFixed(2)}ms</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Min / Max</p>
                      <p className="text-sm font-medium">
                        {result.min.toFixed(2)} / {result.max.toFixed(2)}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">P95 / P99</p>
                      <p className="text-sm font-medium">
                        {result.percentile95.toFixed(2)} / {result.percentile99.toFixed(2)}ms
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Throughput</p>
                      <p className="text-lg font-bold">{result.throughput.toFixed(0)} ops/s</p>
                    </div>
                  </div>

                  {/* Performance indicator */}
                  <div className="mt-3 pt-3 border-t">
                    {result.average < 1 && (
                      <Badge className="bg-green-600 text-white">Excellent</Badge>
                    )}
                    {result.average >= 1 && result.average < 10 && (
                      <Badge className="bg-blue-600 text-white">Good</Badge>
                    )}
                    {result.average >= 10 && result.average < 50 && (
                      <Badge variant="secondary">Acceptable</Badge>
                    )}
                    {result.average >= 50 && (
                      <Badge variant="destructive">Needs Optimization</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!benchmarkResults.length && !isRunning && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">No Benchmarks Run Yet</p>
              <p className="text-muted-foreground mb-4">
                Click "Run Benchmarks" to measure performance
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Monitoring Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Monitoring Categories</CardTitle>
          <CardDescription>
            Available performance measurement tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Cpu className="h-6 w-6 text-blue-600" />
                <h4 className="font-semibold">Calculation Benchmarks</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Measure JavaScript execution performance
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Array operations (map, filter, reduce)</li>
                <li>• Object creation and manipulation</li>
                <li>• String operations</li>
                <li>• JSON parsing and serialization</li>
                <li>• Algorithm complexity testing</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Database className="h-6 w-6 text-green-600" />
                <h4 className="font-semibold">Database Performance</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Monitor database query execution times
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Query execution time tracking</li>
                <li>• Slow query detection (>1s)</li>
                <li>• Query count and statistics</li>
                <li>• N+1 query identification</li>
                <li>• Index usage analysis</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-6 w-6 text-purple-600" />
                <h4 className="font-semibold">Component Rendering</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Track React component render performance
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Render time measurement</li>
                <li>• Slow component detection (>16ms)</li>
                <li>• Re-render frequency tracking</li>
                <li>• Component tree profiling</li>
                <li>• Optimization suggestions</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Network className="h-6 w-6 text-orange-600" />
                <h4 className="font-semibold">Network Performance</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Monitor API and network requests
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Request/response time tracking</li>
                <li>• Slow request detection (>1s)</li>
                <li>• Data transfer size monitoring</li>
                <li>• Failed request logging</li>
                <li>• API call frequency analysis</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <HardDrive className="h-6 w-6 text-indigo-600" />
                <h4 className="font-semibold">Memory Profiling</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Monitor memory usage and detect leaks
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Heap memory snapshots</li>
                <li>• Memory trend analysis</li>
                <li>• Memory leak detection</li>
                <li>• Garbage collection monitoring</li>
                <li>• Peak usage tracking</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-6 w-6 text-yellow-600" />
                <h4 className="font-semibold">Performance Budget</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Enforce performance constraints
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Page load time limits (3s)</li>
                <li>• First Contentful Paint (1s)</li>
                <li>• Time to Interactive (3.5s)</li>
                <li>• Bundle size limits (200KB)</li>
                <li>• API response time (500ms)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-900">
                <strong>Code Splitting:</strong> Break large bundles into smaller chunks using dynamic imports
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-900">
                <strong>Memoization:</strong> Cache expensive calculations with React.memo() and useMemo()
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-900">
                <strong>Lazy Loading:</strong> Defer loading of non-critical resources until needed
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-900">
                <strong>Database Indexes:</strong> Add indexes to frequently queried fields
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
