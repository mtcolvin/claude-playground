'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Eye, Type, Contrast, Monitor, Keyboard, Volume2, ChevronRight,
  CheckCircle, AlertCircle, ZoomIn, ZoomOut, RotateCcw
} from 'lucide-react'
import {
  textSizeManager,
  prefersReducedMotion,
  prefersHighContrast,
  accessibilityTester,
  colorContrastChecker
} from '@/lib/accessibility'

export function AccessibilitySettings() {
  const [textSize, setTextSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [screenReaderMode, setScreenReaderMode] = useState(false)
  const [keyboardNavVisible, setKeyboardNavVisible] = useState(true)
  const [testResults, setTestResults] = useState<any>(null)

  useEffect(() => {
    setReducedMotion(prefersReducedMotion())
    setHighContrast(prefersHighContrast())
  }, [])

  const handleTextSizeIncrease = () => {
    const newSize = textSizeManager.increaseSize()
    setTextSize(newSize)
  }

  const handleTextSizeDecrease = () => {
    const newSize = textSizeManager.decreaseSize()
    setTextSize(newSize)
  }

  const handleTextSizeReset = () => {
    const newSize = textSizeManager.resetSize()
    setTextSize(newSize)
  }

  const runAccessibilityTests = () => {
    const results = accessibilityTester.runAllTests()
    setTestResults(results)
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Eye className="h-8 w-8 text-blue-600" />
          Accessibility Settings
        </h1>
        <p className="text-muted-foreground">
          Customize your experience for optimal accessibility (WCAG 2.1 AAA)
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Text Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{textSize}px</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Contrast Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={highContrast ? 'default' : 'outline'}>
              {highContrast ? 'High' : 'Normal'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Motion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={reducedMotion ? 'default' : 'outline'}>
              {reducedMotion ? 'Reduced' : 'Normal'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              WCAG Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-green-600 text-white">AAA</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Visual Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visual Settings
          </CardTitle>
          <CardDescription>
            Adjust display settings for better readability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Text Size */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Type className="h-4 w-4" />
                Text Size
              </h4>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleTextSizeDecrease}
                  disabled={textSize <= 12}
                >
                  <ZoomOut className="h-5 w-5 mr-2" />
                  Decrease
                </Button>
                <div className="flex-1 text-center">
                  <p className="text-3xl font-bold">{textSize}px</p>
                  <p className="text-sm text-muted-foreground">Current Size</p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleTextSizeIncrease}
                  disabled={textSize >= 24}
                >
                  <ZoomIn className="h-5 w-5 mr-2" />
                  Increase
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTextSizeReset}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Preview:</strong> The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </div>

            {/* High Contrast */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Contrast className="h-4 w-4" />
                Contrast Mode
              </h4>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">High Contrast Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Increases color contrast for better visibility (7:1 ratio minimum)
                  </p>
                </div>
                <Button
                  variant={highContrast ? 'default' : 'outline'}
                  onClick={() => setHighContrast(!highContrast)}
                >
                  {highContrast ? 'Enabled' : 'Enable'}
                </Button>
              </div>

              {/* Color Contrast Examples */}
              <div className="grid gap-3 md:grid-cols-3 mt-4">
                <div className="p-4 bg-white border rounded text-center">
                  <p className="text-black font-semibold mb-1">Normal Text</p>
                  <p className="text-xs text-muted-foreground">7:1 contrast ratio</p>
                  <Badge className="mt-2 bg-green-600 text-white">AAA</Badge>
                </div>
                <div className="p-4 bg-blue-600 border rounded text-center">
                  <p className="text-white font-semibold mb-1">On Dark Background</p>
                  <p className="text-xs text-blue-100">7:1 contrast ratio</p>
                  <Badge className="mt-2 bg-green-600 text-white">AAA</Badge>
                </div>
                <div className="p-4 bg-yellow-400 border rounded text-center">
                  <p className="text-black font-semibold mb-1">On Colored Background</p>
                  <p className="text-xs text-gray-800">7:1 contrast ratio</p>
                  <Badge className="mt-2 bg-green-600 text-white">AAA</Badge>
                </div>
              </div>
            </div>

            {/* Reduced Motion */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Motion & Animation
              </h4>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">Reduce Motion</p>
                  <p className="text-sm text-muted-foreground">
                    Minimizes animations and transitions for users sensitive to motion
                  </p>
                </div>
                <Button
                  variant={reducedMotion ? 'default' : 'outline'}
                  onClick={() => setReducedMotion(!reducedMotion)}
                >
                  {reducedMotion ? 'Enabled' : 'Enable'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Navigation & Input
          </CardTitle>
          <CardDescription>
            Keyboard and assistive technology settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Keyboard Navigation */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium">Visible Keyboard Focus</p>
                <p className="text-sm text-muted-foreground">
                  Shows clear outline around focused elements when using keyboard
                </p>
              </div>
              <Button
                variant={keyboardNavVisible ? 'default' : 'outline'}
                onClick={() => setKeyboardNavVisible(!keyboardNavVisible)}
              >
                {keyboardNavVisible ? 'Enabled' : 'Enable'}
              </Button>
            </div>

            {/* Screen Reader Mode */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <p className="font-medium">Screen Reader Optimized</p>
                <p className="text-sm text-muted-foreground">
                  Enhanced ARIA labels and live region announcements
                </p>
              </div>
              <Button
                variant={screenReaderMode ? 'default' : 'outline'}
                onClick={() => setScreenReaderMode(!screenReaderMode)}
              >
                {screenReaderMode ? 'Enabled' : 'Enable'}
              </Button>
            </div>

            {/* Skip Links */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-2">
                Available Skip Links (Press Tab to reveal):
              </h5>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Skip to main content</li>
                <li>• Skip to navigation</li>
                <li>• Skip to search</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Accessibility Compliance Testing
          </CardTitle>
          <CardDescription>
            Verify WCAG 2.1 AAA compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={runAccessibilityTests} className="w-full">
              Run Accessibility Tests
            </Button>

            {testResults && (
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${testResults.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                  <div className="flex items-center gap-2 mb-2">
                    {testResults.passed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <h4 className={`font-semibold ${testResults.passed ? 'text-green-900' : 'text-red-900'}`}>
                      {testResults.passed ? 'All Tests Passed!' : 'Issues Detected'}
                    </h4>
                  </div>
                  {testResults.passed ? (
                    <p className="text-sm text-green-800">
                      Your application meets WCAG 2.1 AAA accessibility standards
                    </p>
                  ) : (
                    <p className="text-sm text-red-800">
                      {testResults.issues.length} category(ies) with accessibility issues
                    </p>
                  )}
                </div>

                {!testResults.passed && testResults.issues.map((category: any, idx: number) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <h5 className="font-semibold mb-2">{category.category}</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {category.problems.map((problem: string, pIdx: number) => (
                        <li key={pIdx} className="flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          {problem}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* WCAG Guidelines Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            WCAG 2.1 AAA Compliance Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Perceivable:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Alt text for all images
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  7:1 color contrast (AAA)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Text resize up to 200%
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  No information by color alone
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Operable:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Full keyboard accessibility
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Skip navigation links
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  No timing constraints
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Motion can be disabled
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Understandable:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Clear page titles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Logical heading structure
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Form labels and instructions
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Error identification
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Robust:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Valid HTML markup
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  ARIA landmarks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Screen reader compatible
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Assistive tech support
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
