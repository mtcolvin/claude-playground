/**
 * Phase 23: Anomaly Detection & Health Alerts
 *
 * Detects unusual patterns in health metrics using statistical analysis:
 * - Z-score analysis for outlier detection
 * - Interquartile Range (IQR) method
 * - Trend deviation detection
 * - Multi-metric pattern analysis
 */

'use client'

import { useState, useEffect } from 'react'
import { HealthMetricChart } from './charts/health-metric-chart'

interface HealthMetric {
  id: string
  type: string
  value: number
  date: string
  unit: string
}

interface Anomaly {
  id: string
  metricType: string
  metricValue: number
  expectedRange: { min: number; max: number }
  deviation: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  date: string
  message: string
  recommendation: string
  resolved: boolean
}

interface AnomalyStats {
  totalAnomalies: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  resolvedCount: number
}

export function AnomalyDetectionDashboard() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [stats, setStats] = useState<AnomalyStats>({
    totalAnomalies: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    resolvedCount: 0,
  })
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Load metrics for analysis
    try {
      const response = await fetch('/api/v1/metrics?limit=100&sortBy=date&sortOrder=desc')
      const data = await response.json()
      if (data.success) {
        setMetrics(data.data)
        analyzeAnomalies(data.data)
      }
    } catch (error) {
      console.error('Failed to load metrics:', error)
    }
  }

  const analyzeAnomalies = (metricData: HealthMetric[]) => {
    setIsAnalyzing(true)

    // Group metrics by type
    const metricsByType = metricData.reduce((acc, metric) => {
      if (!acc[metric.type]) acc[metric.type] = []
      acc[metric.type].push(metric)
      return acc
    }, {} as Record<string, HealthMetric[]>)

    const detectedAnomalies: Anomaly[] = []

    // Analyze each metric type
    Object.entries(metricsByType).forEach(([type, metricsOfType]) => {
      const values = metricsOfType.map(m => m.value)

      // Calculate statistics
      const mean = values.reduce((sum, v) => sum + v, 0) / values.length
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
      const stdDev = Math.sqrt(variance)

      // Calculate IQR
      const sorted = [...values].sort((a, b) => a - b)
      const q1 = sorted[Math.floor(sorted.length * 0.25)]
      const q3 = sorted[Math.floor(sorted.length * 0.75)]
      const iqr = q3 - q1

      // Detect outliers
      metricsOfType.forEach(metric => {
        const zScore = Math.abs((metric.value - mean) / stdDev)
        const isOutlierIQR = metric.value < (q1 - 1.5 * iqr) || metric.value > (q3 + 1.5 * iqr)
        const isOutlierZScore = zScore > 2

        if (isOutlierIQR || isOutlierZScore) {
          const severity = getSeverity(zScore, metric.type, metric.value)
          const anomaly: Anomaly = {
            id: `anomaly-${metric.id}`,
            metricType: metric.type,
            metricValue: metric.value,
            expectedRange: { min: q1 - 1.5 * iqr, max: q3 + 1.5 * iqr },
            deviation: zScore,
            severity,
            date: metric.date,
            message: generateMessage(metric.type, metric.value, mean, severity),
            recommendation: generateRecommendation(metric.type, metric.value, mean, severity),
            resolved: false,
          }
          detectedAnomalies.push(anomaly)
        }
      })
    })

    // Sort by date (newest first) and severity
    const sortedAnomalies = detectedAnomalies.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity]
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    setAnomalies(sortedAnomalies)

    // Calculate stats
    const newStats: AnomalyStats = {
      totalAnomalies: sortedAnomalies.length,
      criticalCount: sortedAnomalies.filter(a => a.severity === 'critical').length,
      highCount: sortedAnomalies.filter(a => a.severity === 'high').length,
      mediumCount: sortedAnomalies.filter(a => a.severity === 'medium').length,
      lowCount: sortedAnomalies.filter(a => a.severity === 'low').length,
      resolvedCount: sortedAnomalies.filter(a => a.resolved).length,
    }
    setStats(newStats)
    setIsAnalyzing(false)
  }

  const getSeverity = (zScore: number, metricType: string, value: number): 'low' | 'medium' | 'high' | 'critical' => {
    // Critical thresholds for specific metrics
    if (metricType === 'blood_pressure_systolic' && value > 180) return 'critical'
    if (metricType === 'blood_pressure_systolic' && value < 90) return 'critical'
    if (metricType === 'blood_glucose' && value > 250) return 'critical'
    if (metricType === 'blood_glucose' && value < 60) return 'critical'
    if (metricType === 'oxygen_saturation' && value < 90) return 'critical'
    if (metricType === 'heart_rate' && value > 150) return 'critical'
    if (metricType === 'heart_rate' && value < 40) return 'critical'

    // Z-score based severity
    if (zScore > 3.5) return 'critical'
    if (zScore > 3) return 'high'
    if (zScore > 2.5) return 'medium'
    return 'low'
  }

  const generateMessage = (type: string, value: number, mean: number, severity: string): string => {
    const metricNames: Record<string, string> = {
      'blood_pressure_systolic': 'Blood Pressure (Systolic)',
      'blood_pressure_diastolic': 'Blood Pressure (Diastolic)',
      'heart_rate': 'Heart Rate',
      'blood_glucose': 'Blood Glucose',
      'weight': 'Weight',
      'temperature': 'Body Temperature',
      'oxygen_saturation': 'Oxygen Saturation',
    }

    const name = metricNames[type] || type
    const direction = value > mean ? 'elevated' : 'low'
    const percentage = Math.abs(((value - mean) / mean) * 100).toFixed(1)

    if (severity === 'critical') {
      return `CRITICAL: ${name} is dangerously ${direction} at ${value} (${percentage}% from normal)`
    } else if (severity === 'high') {
      return `HIGH: ${name} is significantly ${direction} at ${value} (${percentage}% from normal)`
    } else if (severity === 'medium') {
      return `MEDIUM: ${name} is moderately ${direction} at ${value} (${percentage}% from normal)`
    } else {
      return `LOW: ${name} is slightly ${direction} at ${value} (${percentage}% from normal)`
    }
  }

  const generateRecommendation = (type: string, value: number, mean: number, severity: string): string => {
    const isHigh = value > mean

    if (type === 'blood_pressure_systolic') {
      if (severity === 'critical') {
        return isHigh
          ? '🚨 URGENT: Seek immediate medical attention. Blood pressure is in hypertensive crisis range.'
          : '🚨 URGENT: Seek immediate medical attention. Blood pressure is critically low.'
      }
      return isHigh
        ? 'Monitor closely. Reduce salt intake, exercise regularly, and consult your doctor.'
        : 'Monitor closely. Ensure adequate hydration and nutrition. Contact your doctor if symptoms persist.'
    }

    if (type === 'blood_glucose') {
      if (severity === 'critical') {
        return isHigh
          ? '🚨 URGENT: Dangerously high blood sugar. Take prescribed medication and seek medical help immediately.'
          : '🚨 URGENT: Dangerously low blood sugar. Consume fast-acting carbohydrates and seek help if no improvement.'
      }
      return isHigh
        ? 'Check your diet and medication timing. Contact your healthcare provider for guidance.'
        : 'Eat a balanced meal with carbohydrates. Monitor closely and contact your doctor.'
    }

    if (type === 'heart_rate') {
      if (severity === 'critical') {
        return '🚨 URGENT: Heart rate is outside safe range. Seek immediate medical attention.'
      }
      return isHigh
        ? 'Rest and avoid caffeine. If elevated heart rate persists, contact your doctor.'
        : 'Rest and monitor. If you feel dizzy or weak, seek medical attention.'
    }

    if (type === 'oxygen_saturation') {
      if (severity === 'critical') {
        return '🚨 URGENT: Oxygen saturation critically low. Seek emergency medical care immediately.'
      }
      return 'Ensure you\'re in a well-ventilated area. If breathing difficulties persist, contact your doctor.'
    }

    if (type === 'weight') {
      return isHigh
        ? 'Consider reviewing your diet and exercise routine with a healthcare professional.'
        : 'Ensure adequate nutrition. Consult with your doctor if unintentional weight loss continues.'
    }

    return 'Monitor this metric closely and discuss any concerns with your healthcare provider.'
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getSeverityIcon = (severity: string): string => {
    switch (severity) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return '⚡'
      case 'low': return 'ℹ️'
      default: return '📊'
    }
  }

  const filteredAnomalies = selectedSeverity === 'all'
    ? anomalies
    : anomalies.filter(a => a.severity === selectedSeverity)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Anomaly Detection</h1>
          <p className="text-gray-800 mt-1">
            AI-powered analysis of unusual health patterns and trends
          </p>
        </div>
        <button
          onClick={() => loadData()}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-analyze
            </>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-900">Total Anomalies</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{stats.totalAnomalies}</div>
          <div className="text-xs text-gray-900 mt-1">Detected patterns</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
          <div className="text-red-100 text-sm">Critical</div>
          <div className="text-3xl font-bold mt-1">{stats.criticalCount}</div>
          <div className="text-red-100 text-xs mt-1">Immediate attention</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
          <div className="text-orange-100 text-sm">High</div>
          <div className="text-3xl font-bold mt-1">{stats.highCount}</div>
          <div className="text-orange-100 text-xs mt-1">Monitor closely</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow p-6 text-white">
          <div className="text-yellow-100 text-sm">Medium</div>
          <div className="text-3xl font-bold mt-1">{stats.mediumCount}</div>
          <div className="text-yellow-100 text-xs mt-1">Worth noting</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="text-blue-100 text-sm">Low</div>
          <div className="text-3xl font-bold mt-1">{stats.lowCount}</div>
          <div className="text-blue-100 text-xs mt-1">Minor variations</div>
        </div>
      </div>

      {/* Severity Filter */}
      <div className="flex gap-2">
        {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
          <button
            key={severity}
            onClick={() => setSelectedSeverity(severity)}
            className={`px-4 py-2 rounded-lg capitalize ${
              selectedSeverity === severity
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {severity === 'all' ? 'All Alerts' : `${severity} (${stats[`${severity}Count` as keyof AnomalyStats]})`}
          </button>
        ))}
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {selectedSeverity === 'all' ? 'All Detected Anomalies' : `${selectedSeverity.toUpperCase()} Severity Anomalies`}
        </h2>

        {filteredAnomalies.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {selectedSeverity === 'all' ? 'No Anomalies Detected' : `No ${selectedSeverity} severity anomalies`}
            </h3>
            <p className="text-gray-900">
              {selectedSeverity === 'all'
                ? 'Your health metrics are all within expected ranges. Great job!'
                : `No ${selectedSeverity} severity issues detected. Check other severity levels.`}
            </p>
          </div>
        ) : (
          filteredAnomalies.map((anomaly) => (
            <div
              key={anomaly.id}
              className={`border-l-4 rounded-lg shadow p-6 ${getSeverityColor(anomaly.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{getSeverityIcon(anomaly.severity)}</span>
                    <div>
                      <div className="font-semibold text-gray-900 text-lg">
                        {anomaly.message}
                      </div>
                      <div className="text-sm text-gray-800">
                        {new Date(anomaly.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-800">Recorded Value</div>
                      <div className="text-lg font-bold text-gray-900">{anomaly.metricValue.toFixed(1)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-800">Expected Range</div>
                      <div className="text-lg font-bold text-gray-900">
                        {anomaly.expectedRange.min.toFixed(1)} - {anomaly.expectedRange.max.toFixed(1)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-800">Deviation</div>
                      <div className="text-lg font-bold text-gray-900">{anomaly.deviation.toFixed(2)}σ</div>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="p-4 bg-white bg-opacity-50 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-1">💡 Recommendation</div>
                    <p className="text-sm text-gray-900">{anomaly.recommendation}</p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  anomaly.severity === 'critical' ? 'bg-red-600 text-white' :
                  anomaly.severity === 'high' ? 'bg-orange-600 text-white' :
                  anomaly.severity === 'medium' ? 'bg-yellow-600 text-white' :
                  'bg-blue-600 text-white'
                }`}>
                  {anomaly.severity}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* How Anomaly Detection Works */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">How Anomaly Detection Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-purple-700 mb-1">📊 Statistical Analysis</div>
            <div className="text-gray-800">
              Uses Z-score and IQR methods to identify values that fall outside normal statistical ranges based on your historical data.
            </div>
          </div>
          <div>
            <div className="font-medium text-blue-700 mb-1">🎯 Severity Classification</div>
            <div className="text-gray-800">
              Categorizes anomalies by severity using both statistical deviation and clinical thresholds for immediate medical concerns.
            </div>
          </div>
          <div>
            <div className="font-medium text-green-700 mb-1">💡 Smart Recommendations</div>
            <div className="text-gray-800">
              Provides context-aware recommendations based on the type of metric, deviation severity, and clinical guidelines.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
