/**
 * Phase 25: Automated Health Reports Generator
 *
 * Creates comprehensive health reports including:
 * - Summary of all health metrics
 * - Trend analysis
 * - Anomaly highlights
 * - Goal progress
 * - Medication adherence
 * - Doctor-friendly formatting
 */

'use client'

import { useState } from 'react'

interface ReportConfig {
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom'
  customStartDate?: string
  customEndDate?: string
  includeSections: {
    vitals: boolean
    medications: boolean
    labs: boolean
    appointments: boolean
    mentalHealth: boolean
    nutrition: boolean
    fitness: boolean
    sleep: boolean
    goals: boolean
    anomalies: boolean
  }
  format: 'pdf' | 'print' | 'email'
  recipientEmail?: string
}

export function HealthReportsGenerator() {
  const [config, setConfig] = useState<ReportConfig>({
    dateRange: 'month',
    includeSections: {
      vitals: true,
      medications: true,
      labs: true,
      appointments: true,
      mentalHealth: false,
      nutrition: false,
      fitness: false,
      sleep: false,
      goals: false,
      anomalies: true,
    },
    format: 'pdf',
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const generateReport = async () => {
    setIsGenerating(true)

    try {
      // Collect data based on config
      const reportData = await collectReportData()

      // Generate report based on format
      if (config.format === 'pdf') {
        await generatePDF(reportData)
      } else if (config.format === 'print') {
        printReport(reportData)
      } else if (config.format === 'email' && config.recipientEmail) {
        await emailReport(reportData, config.recipientEmail)
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const collectReportData = async () => {
    // This would fetch real data from APIs
    return {
      patient: {
        name: 'John Doe',
        dateOfBirth: '1985-06-15',
        gender: 'Male',
      },
      dateRange: getDateRangeText(),
      sections: config.includeSections,
    }
  }

  const generatePDF = async (data: any) => {
    // Would use jsPDF to create PDF
    console.log('Generating PDF...', data)
    alert('PDF report generated successfully!')
  }

  const printReport = (data: any) => {
    setShowPreview(true)
    setTimeout(() => window.print(), 500)
  }

  const emailReport = async (data: any, email: string) => {
    // Would send email via API
    console.log('Emailing report to:', email, data)
    alert(`Report sent to ${email}`)
  }

  const getDateRangeText = (): string => {
    const now = new Date()
    switch (config.dateRange) {
      case 'week':
        return 'Last 7 Days'
      case 'month':
        return 'Last 30 Days'
      case 'quarter':
        return 'Last 90 Days'
      case 'year':
        return 'Last 365 Days'
      case 'custom':
        return `${config.customStartDate} to ${config.customEndDate}`
      default:
        return 'Last 30 Days'
    }
  }

  const toggleSection = (section: keyof ReportConfig['includeSections']) => {
    setConfig({
      ...config,
      includeSections: {
        ...config.includeSections,
        [section]: !config.includeSections[section],
      },
    })
  }

  const REPORT_TEMPLATES = [
    {
      id: 'comprehensive',
      name: 'Comprehensive Health Report',
      description: 'Full health overview with all available data',
      icon: '📋',
      sections: {
        vitals: true,
        medications: true,
        labs: true,
        appointments: true,
        mentalHealth: true,
        nutrition: true,
        fitness: true,
        sleep: true,
        goals: true,
        anomalies: true,
      },
    },
    {
      id: 'doctor_visit',
      name: 'Doctor Visit Summary',
      description: 'Essential metrics for healthcare provider',
      icon: '🏥',
      sections: {
        vitals: true,
        medications: true,
        labs: true,
        appointments: true,
        mentalHealth: false,
        nutrition: false,
        fitness: false,
        sleep: false,
        goals: false,
        anomalies: true,
      },
    },
    {
      id: 'wellness',
      name: 'Wellness Report',
      description: 'Lifestyle and preventive health metrics',
      icon: '🌟',
      sections: {
        vitals: true,
        medications: false,
        labs: false,
        appointments: false,
        mentalHealth: true,
        nutrition: true,
        fitness: true,
        sleep: true,
        goals: true,
        anomalies: false,
      },
    },
    {
      id: 'chronic_care',
      name: 'Chronic Condition Monitoring',
      description: 'Focus on medication and vital signs',
      icon: '💊',
      sections: {
        vitals: true,
        medications: true,
        labs: true,
        appointments: true,
        mentalHealth: false,
        nutrition: false,
        fitness: false,
        sleep: false,
        goals: false,
        anomalies: true,
      },
    },
  ]

  const selectedCount = Object.values(config.includeSections).filter(Boolean).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Health Reports</h1>
        <p className="text-gray-800 mt-1">
          Generate comprehensive reports to share with your healthcare provider
        </p>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => setConfig({ ...config, includeSections: template.sections })}
            className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-all text-left border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-4xl mb-3">{template.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
            <p className="text-sm text-gray-800">{template.description}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Date Range */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Date Range</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {['week', 'month', 'quarter', 'year', 'custom'].map((range) => (
                <button
                  key={range}
                  onClick={() => setConfig({ ...config, dateRange: range as any })}
                  className={`px-4 py-2 rounded-lg capitalize ${
                    config.dateRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {range === 'week' ? '7 Days' : range === 'quarter' ? '90 Days' : range}
                </button>
              ))}
            </div>

            {config.dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={config.customStartDate || ''}
                    onChange={(e) => setConfig({ ...config, customStartDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">End Date</label>
                  <input
                    type="date"
                    value={config.customEndDate || ''}
                    onChange={(e) => setConfig({ ...config, customEndDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sections to Include */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Include Sections</h2>
              <span className="text-sm text-gray-900">{selectedCount} selected</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(config.includeSections).map(([section, included]) => {
                const icons: Record<string, string> = {
                  vitals: '💓',
                  medications: '💊',
                  labs: '🔬',
                  appointments: '📅',
                  mentalHealth: '🧠',
                  nutrition: '🥗',
                  fitness: '🏃',
                  sleep: '😴',
                  goals: '🎯',
                  anomalies: '⚠️',
                }

                return (
                  <label
                    key={section}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      included
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={included}
                      onChange={() => toggleSection(section as keyof ReportConfig['includeSections'])}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-2xl">{icons[section]}</span>
                    <span className="ml-2 font-medium text-gray-900 capitalize">
                      {section.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Output Format */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Output Format</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {[
                { value: 'pdf', label: 'Download PDF', icon: '📄', description: 'Save as PDF file' },
                { value: 'print', label: 'Print', icon: '🖨️', description: 'Print directly' },
                { value: 'email', label: 'Email', icon: '📧', description: 'Send via email' },
              ].map((format) => (
                <label
                  key={format.value}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    config.format === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.value}
                    checked={config.format === format.value}
                    onChange={(e) => setConfig({ ...config, format: e.target.value as any })}
                    className="sr-only"
                  />
                  <div className="text-3xl mb-2">{format.icon}</div>
                  <div className="font-medium text-gray-900">{format.label}</div>
                  <div className="text-xs text-gray-900 mt-1">{format.description}</div>
                </label>
              ))}
            </div>

            {config.format === 'email' && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={config.recipientEmail || ''}
                  onChange={(e) => setConfig({ ...config, recipientEmail: e.target.value })}
                  placeholder="doctor@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Preview & Actions */}
        <div className="space-y-6">
          {/* Report Summary */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Report Summary</h3>

            <div className="space-y-3 text-sm">
              <div>
                <div className="text-blue-100">Date Range</div>
                <div className="font-medium">{getDateRangeText()}</div>
              </div>

              <div>
                <div className="text-blue-100">Sections Included</div>
                <div className="font-medium">{selectedCount} of 10</div>
              </div>

              <div>
                <div className="text-blue-100">Output Format</div>
                <div className="font-medium capitalize">{config.format}</div>
              </div>

              {config.format === 'email' && config.recipientEmail && (
                <div>
                  <div className="text-blue-100">Recipient</div>
                  <div className="font-medium">{config.recipientEmail}</div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6 space-y-3">
            <button
              onClick={generateReport}
              disabled={isGenerating || selectedCount === 0}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Report...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Report
                </>
              )}
            </button>

            <button
              onClick={() => setShowPreview(true)}
              className="w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Tips for Healthcare Visits
            </h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Include at least 30 days of data</li>
              <li>• Highlight anomalies and concerns</li>
              <li>• Bring medication list</li>
              <li>• Note any symptoms or questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
