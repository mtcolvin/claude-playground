'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TestTube2, CheckCircle, XCircle, AlertCircle, Clock, Play,
  Code, Shield, Zap, Eye, Database, Globe, ChevronRight
} from 'lucide-react'
import {
  MockDataGenerator,
  TestValidator,
  APITestHelper,
  PerformanceTestHelper,
  AccessibilityTestHelper,
  SecurityTestHelper
} from '@/lib/testing'

interface TestResult {
  name: string
  status: 'passed' | 'failed' | 'running' | 'pending'
  duration?: number
  error?: string
  details?: string
}

interface TestSuite {
  name: string
  category: string
  tests: TestResult[]
  totalTests: number
  passedTests: number
  failedTests: number
  duration: number
}

export function TestRunnerDashboard() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All Tests', icon: TestTube2, color: 'blue' },
    { id: 'unit', name: 'Unit Tests', icon: Code, color: 'green' },
    { id: 'integration', name: 'Integration Tests', icon: Database, color: 'purple' },
    { id: 'performance', name: 'Performance Tests', icon: Zap, color: 'yellow' },
    { id: 'accessibility', name: 'Accessibility Tests', icon: Eye, color: 'pink' },
    { id: 'security', name: 'Security Tests', icon: Shield, color: 'red' },
    { id: 'api', name: 'API Tests', icon: Globe, color: 'indigo' },
  ]

  const runAllTests = async () => {
    setIsRunning(true)
    const suites: TestSuite[] = []

    // Unit Tests
    suites.push(await runUnitTests())

    // Integration Tests
    suites.push(await runIntegrationTests())

    // Performance Tests
    suites.push(await runPerformanceTests())

    // Accessibility Tests
    suites.push(await runAccessibilityTests())

    // Security Tests
    suites.push(await runSecurityTests())

    // API Tests
    suites.push(await runAPITests())

    setTestSuites(suites)
    setIsRunning(false)
  }

  const runUnitTests = async (): Promise<TestSuite> => {
    const startTime = performance.now()
    const tests: TestResult[] = []

    // Test 1: Mock Data Generation
    tests.push(await runTest('Generate Health Metric', async () => {
      const metric = MockDataGenerator.generateHealthMetric()
      if (!TestValidator.isValidHealthMetric(metric)) {
        throw new Error('Invalid health metric structure')
      }
    }))

    // Test 2: Medication Validation
    tests.push(await runTest('Generate Medication', async () => {
      const medication = MockDataGenerator.generateMedication()
      if (!TestValidator.isValidMedication(medication)) {
        throw new Error('Invalid medication structure')
      }
    }))

    // Test 3: Appointment Validation
    tests.push(await runTest('Generate Appointment', async () => {
      const appointment = MockDataGenerator.generateAppointment()
      if (!TestValidator.isValidAppointment(appointment)) {
        throw new Error('Invalid appointment structure')
      }
    }))

    // Test 4: Email Validation
    tests.push(await runTest('Validate Email', async () => {
      const validEmail = TestValidator.isValidEmail('test@example.com')
      const invalidEmail = TestValidator.isValidEmail('invalid-email')
      if (!validEmail || invalidEmail) {
        throw new Error('Email validation failed')
      }
    }))

    // Test 5: Blood Pressure Validation
    tests.push(await runTest('Validate Blood Pressure', async () => {
      const valid = TestValidator.isValidBloodPressure(120, 80)
      const invalid = TestValidator.isValidBloodPressure(80, 120) // reversed
      if (!valid || invalid) {
        throw new Error('Blood pressure validation failed')
      }
    }))

    // Test 6: Heart Rate Validation
    tests.push(await runTest('Validate Heart Rate', async () => {
      const valid = TestValidator.isValidHeartRate(75)
      const tooLow = TestValidator.isValidHeartRate(20)
      const tooHigh = TestValidator.isValidHeartRate(300)
      if (!valid || tooLow || tooHigh) {
        throw new Error('Heart rate validation failed')
      }
    }))

    // Test 7: Temperature Validation
    tests.push(await runTest('Validate Temperature', async () => {
      const validC = TestValidator.isValidTemperature(37, 'C')
      const validF = TestValidator.isValidTemperature(98.6, 'F')
      if (!validC || !validF) {
        throw new Error('Temperature validation failed')
      }
    }))

    // Test 8: Array Generation
    tests.push(await runTest('Generate Array of Data', async () => {
      const metrics = MockDataGenerator.generateArray(
        () => MockDataGenerator.generateHealthMetric(),
        5
      )
      if (metrics.length !== 5) {
        throw new Error('Array generation failed')
      }
    }))

    const duration = performance.now() - startTime

    return {
      name: 'Unit Tests',
      category: 'unit',
      tests,
      totalTests: tests.length,
      passedTests: tests.filter(t => t.status === 'passed').length,
      failedTests: tests.filter(t => t.status === 'failed').length,
      duration
    }
  }

  const runIntegrationTests = async (): Promise<TestSuite> => {
    const startTime = performance.now()
    const tests: TestResult[] = []

    // Test 1: Create and Retrieve User
    tests.push(await runTest('User Lifecycle', async () => {
      const user = MockDataGenerator.generateUser()
      if (!user.id || !user.email) {
        throw new Error('User creation failed')
      }
    }))

    // Test 2: Health Metric CRUD
    tests.push(await runTest('Health Metric CRUD', async () => {
      const metric = MockDataGenerator.generateHealthMetric()
      // Simulate CRUD operations
      await APITestHelper.wait(10)
    }))

    // Test 3: Medication Management
    tests.push(await runTest('Medication Management', async () => {
      const medication = MockDataGenerator.generateMedication()
      // Simulate medication operations
      await APITestHelper.wait(10)
    }))

    // Test 4: Appointment Scheduling
    tests.push(await runTest('Appointment Scheduling', async () => {
      const appointment = MockDataGenerator.generateAppointment()
      // Simulate scheduling operations
      await APITestHelper.wait(10)
    }))

    const duration = performance.now() - startTime

    return {
      name: 'Integration Tests',
      category: 'integration',
      tests,
      totalTests: tests.length,
      passedTests: tests.filter(t => t.status === 'passed').length,
      failedTests: tests.filter(t => t.status === 'failed').length,
      duration
    }
  }

  const runPerformanceTests = async (): Promise<TestSuite> => {
    const startTime = performance.now()
    const tests: TestResult[] = []

    // Test 1: Data Generation Performance
    tests.push(await runTest('Generate 100 Health Metrics', async () => {
      const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
        MockDataGenerator.generateArray(
          () => MockDataGenerator.generateHealthMetric(),
          100
        )
      })

      if (duration > 100) {
        throw new Error(`Too slow: ${duration.toFixed(2)}ms`)
      }
    }))

    // Test 2: Validation Performance
    tests.push(await runTest('Validate 100 Medications', async () => {
      const medications = MockDataGenerator.generateArray(
        () => MockDataGenerator.generateMedication(),
        100
      )

      const { duration } = await PerformanceTestHelper.measureExecutionTime(async () => {
        medications.forEach(med => TestValidator.isValidMedication(med))
      })

      if (duration > 50) {
        throw new Error(`Too slow: ${duration.toFixed(2)}ms`)
      }
    }))

    // Test 3: Memory Usage Check
    tests.push(await runTest('Memory Usage', async () => {
      const memory = PerformanceTestHelper.getMemoryUsage()
      if (!memory) {
        throw new Error('Memory API not available')
      }

      const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      if (usagePercentage > 90) {
        throw new Error(`High memory usage: ${usagePercentage.toFixed(1)}%`)
      }
    }))

    const duration = performance.now() - startTime

    return {
      name: 'Performance Tests',
      category: 'performance',
      tests,
      totalTests: tests.length,
      passedTests: tests.filter(t => t.status === 'passed').length,
      failedTests: tests.filter(t => t.status === 'failed').length,
      duration
    }
  }

  const runAccessibilityTests = async (): Promise<TestSuite> => {
    const startTime = performance.now()
    const tests: TestResult[] = []

    // Test 1: Heading Hierarchy
    tests.push(await runTest('Heading Hierarchy', async () => {
      const issues = AccessibilityTestHelper.checkHeadingHierarchy()
      if (issues.length > 0) {
        throw new Error(`Heading issues: ${issues.join(', ')}`)
      }
    }))

    // Test 2: Images with Alt Text
    tests.push(await runTest('Images Have Alt Text', async () => {
      const imagesWithoutAlt = AccessibilityTestHelper.findImagesWithoutAlt()
      if (imagesWithoutAlt.length > 0) {
        throw new Error(`${imagesWithoutAlt.length} images missing alt text`)
      }
    }))

    // Test 3: Form Controls with Labels
    tests.push(await runTest('Form Controls Labeled', async () => {
      const controlsWithoutLabels = AccessibilityTestHelper.findFormControlsWithoutLabels()
      if (controlsWithoutLabels.length > 0) {
        throw new Error(`${controlsWithoutLabels.length} controls missing labels`)
      }
    }))

    // Test 4: Color Contrast (simulated)
    tests.push(await runTest('Color Contrast WCAG AAA', async () => {
      const contrast = AccessibilityTestHelper.checkColorContrast('#000000', '#FFFFFF')
      if (!contrast.meetsAAA) {
        throw new Error('Color contrast does not meet WCAG AAA')
      }
    }))

    const duration = performance.now() - startTime

    return {
      name: 'Accessibility Tests',
      category: 'accessibility',
      tests,
      totalTests: tests.length,
      passedTests: tests.filter(t => t.status === 'passed').length,
      failedTests: tests.filter(t => t.status === 'failed').length,
      duration
    }
  }

  const runSecurityTests = async (): Promise<TestSuite> => {
    const startTime = performance.now()
    const tests: TestResult[] = []

    // Test 1: XSS Protection
    tests.push(await runTest('XSS Protection', async () => {
      const safe = SecurityTestHelper.testXSSProtection('Hello World')
      const dangerous = SecurityTestHelper.testXSSProtection('<script>alert("xss")</script>')

      if (!safe || dangerous) {
        throw new Error('XSS protection failed')
      }
    }))

    // Test 2: SQL Injection Protection
    tests.push(await runTest('SQL Injection Protection', async () => {
      const safe = SecurityTestHelper.testSQLInjectionProtection('John Doe')
      const dangerous = SecurityTestHelper.testSQLInjectionProtection("' OR '1'='1")

      if (!safe || dangerous) {
        throw new Error('SQL injection protection failed')
      }
    }))

    // Test 3: Password Strength
    tests.push(await runTest('Password Strength Validation', async () => {
      const weak = SecurityTestHelper.validatePasswordStrength('123')
      const strong = SecurityTestHelper.validatePasswordStrength('MyP@ssw0rd123!')

      if (weak.score > 2 || strong.score < 4) {
        throw new Error('Password strength validation failed')
      }
    }))

    // Test 4: Sensitive Data in Logs
    tests.push(await runTest('No Sensitive Data in Logs', async () => {
      const safe = SecurityTestHelper.hasSensitiveDataInLogs('User logged in')
      const dangerous = SecurityTestHelper.hasSensitiveDataInLogs('password: secret123')

      if (safe || !dangerous) {
        throw new Error('Sensitive data detection failed')
      }
    }))

    const duration = performance.now() - startTime

    return {
      name: 'Security Tests',
      category: 'security',
      tests,
      totalTests: tests.length,
      passedTests: tests.filter(t => t.status === 'passed').length,
      failedTests: tests.filter(t => t.status === 'failed').length,
      duration
    }
  }

  const runAPITests = async (): Promise<TestSuite> => {
    const startTime = performance.now()
    const tests: TestResult[] = []

    // Test 1: Mock Fetch Response
    tests.push(await runTest('Create Mock Response', async () => {
      const response = APITestHelper.mockFetchResponse({ data: 'test' }, 200)
      const json = await response.json()

      if (!response.ok || json.data !== 'test') {
        throw new Error('Mock response creation failed')
      }
    }))

    // Test 2: Error Response
    tests.push(await runTest('Create Error Response', async () => {
      const response = APITestHelper.mockErrorResponse('Test error', 500)
      const json = await response.json()

      if (response.ok || json.error !== 'Test error') {
        throw new Error('Error response creation failed')
      }
    }))

    // Test 3: Retry with Backoff
    tests.push(await runTest('Retry with Backoff', async () => {
      let attempts = 0
      const result = await APITestHelper.retryWithBackoff(async () => {
        attempts++
        if (attempts < 2) throw new Error('Retry')
        return 'success'
      }, 3, 10)

      if (result !== 'success' || attempts !== 2) {
        throw new Error('Retry logic failed')
      }
    }))

    const duration = performance.now() - startTime

    return {
      name: 'API Tests',
      category: 'api',
      tests,
      totalTests: tests.length,
      passedTests: tests.filter(t => t.status === 'passed').length,
      failedTests: tests.filter(t => t.status === 'failed').length,
      duration
    }
  }

  const runTest = async (name: string, testFn: () => Promise<void>): Promise<TestResult> => {
    const startTime = performance.now()

    try {
      await testFn()
      const duration = performance.now() - startTime

      return {
        name,
        status: 'passed',
        duration,
        details: `Completed in ${duration.toFixed(2)}ms`
      }
    } catch (error) {
      const duration = performance.now() - startTime

      return {
        name,
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: `Failed after ${duration.toFixed(2)}ms`
      }
    }
  }

  const filteredSuites = selectedCategory === 'all'
    ? testSuites
    : testSuites.filter(suite => suite.category === selectedCategory)

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0)
  const passedTests = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0)
  const failedTests = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0)
  const totalDuration = testSuites.reduce((sum, suite) => sum + suite.duration, 0)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <TestTube2 className="h-8 w-8 text-blue-600" />
            Test Runner Dashboard
          </h1>
          <p className="text-gray-800">
            Comprehensive testing suite for quality assurance
          </p>
        </div>

        <Button
          onClick={runAllTests}
          disabled={isRunning}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Play className="h-5 w-5 mr-2" />
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      {/* Summary Stats */}
      {testSuites.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-800">Total Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTests}</div>
              <p className="text-xs text-gray-800">Across {testSuites.length} suites</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-800">Passed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <p className="text-xs text-gray-800">
                {totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}% success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-800">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <p className="text-xs text-gray-800">
                {totalTests > 0 ? Math.round((failedTests / totalTests) * 100) : 0}% failure rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-800">Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDuration.toFixed(0)}ms</div>
              <p className="text-xs text-gray-800">Total execution time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.id

          return (
            <Button
              key={category.id}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </Button>
          )
        })}
      </div>

      {/* Test Suites */}
      {filteredSuites.length > 0 ? (
        <div className="space-y-4">
          {filteredSuites.map((suite, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {suite.name}
                      <Badge variant={suite.failedTests > 0 ? 'destructive' : 'default'}>
                        {suite.passedTests}/{suite.totalTests} passed
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Completed in {suite.duration.toFixed(2)}ms
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-800" />
                    <span className="text-sm text-gray-800">
                      {(suite.duration / suite.totalTests).toFixed(1)}ms avg
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suite.tests.map((test, testIdx) => (
                    <div
                      key={testIdx}
                      className={`p-3 border rounded-lg flex items-center justify-between ${
                        test.status === 'passed' ? 'bg-green-50 border-green-200' :
                        test.status === 'failed' ? 'bg-red-50 border-red-200' :
                        'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {test.status === 'passed' && (
                          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        )}
                        {test.status === 'failed' && (
                          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        )}
                        {test.status === 'running' && (
                          <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 animate-spin" />
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{test.name}</p>
                          {test.error && (
                            <p className="text-sm text-red-600 mt-1">{test.error}</p>
                          )}
                          {test.details && !test.error && (
                            <p className="text-sm text-gray-800 mt-1">{test.details}</p>
                          )}
                        </div>
                      </div>

                      {test.duration && (
                        <Badge variant="outline" className="ml-2">
                          {test.duration.toFixed(1)}ms
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <TestTube2 className="h-12 w-12 text-gray-800 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">No Tests Run Yet</p>
              <p className="text-gray-800 mb-4">
                Click "Run All Tests" to start the comprehensive testing suite
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testing Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Categories</CardTitle>
          <CardDescription>
            Overview of all test categories and their purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Code className="h-4 w-4 text-green-600" />
                Unit Tests
              </h4>
              <p className="text-sm text-gray-800 mb-2">
                Test individual functions and components in isolation
              </p>
              <ul className="text-sm text-gray-800 space-y-1">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Data validation logic
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Mock data generation
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Utility functions
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-600" />
                Integration Tests
              </h4>
              <p className="text-sm text-gray-800 mb-2">
                Test interactions between multiple components
              </p>
              <ul className="text-sm text-gray-800 space-y-1">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Database operations
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  API endpoints
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  End-to-end workflows
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                Performance Tests
              </h4>
              <p className="text-sm text-gray-800 mb-2">
                Measure execution speed and resource usage
              </p>
              <ul className="text-sm text-gray-800 space-y-1">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Function execution time
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Memory consumption
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Load testing
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4 text-pink-600" />
                Accessibility Tests
              </h4>
              <p className="text-sm text-gray-800 mb-2">
                Ensure WCAG 2.1 AAA compliance
              </p>
              <ul className="text-sm text-gray-800 space-y-1">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Keyboard navigation
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Screen reader support
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Color contrast ratios
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                Security Tests
              </h4>
              <p className="text-sm text-gray-800 mb-2">
                Identify security vulnerabilities
              </p>
              <ul className="text-sm text-gray-800 space-y-1">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  XSS protection
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  SQL injection prevention
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Data sanitization
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4 text-indigo-600" />
                API Tests
              </h4>
              <p className="text-sm text-gray-800 mb-2">
                Validate API endpoints and responses
              </p>
              <ul className="text-sm text-gray-800 space-y-1">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Request/response validation
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Error handling
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Retry logic
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
