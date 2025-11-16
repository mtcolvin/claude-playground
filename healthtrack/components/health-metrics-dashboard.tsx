/**
 * Phase 11: Health Metrics Dashboard UI
 */

'use client'

import { useState, useEffect } from 'react'
import { HealthMetricChart } from './charts/health-metric-chart'

interface HealthMetric {
  id: string
  type: string
  value: number
  unit: string
  date: string
  notes?: string
}

const METRIC_TYPES = [
  { value: 'blood_pressure_systolic', label: 'Blood Pressure (Systolic)', unit: 'mmHg', icon: '💓' },
  { value: 'blood_pressure_diastolic', label: 'Blood Pressure (Diastolic)', unit: 'mmHg', icon: '💓' },
  { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm', icon: '❤️' },
  { value: 'temperature', label: 'Temperature', unit: '°F', icon: '🌡️' },
  { value: 'weight', label: 'Weight', unit: 'lbs', icon: '⚖️' },
  { value: 'blood_glucose', label: 'Blood Glucose', unit: 'mg/dL', icon: '🩸' },
  { value: 'oxygen_saturation', label: 'Oxygen Saturation', unit: '%', icon: '🫁' },
]

export function HealthMetricsDashboard() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([])
  const [selectedType, setSelectedType] = useState<string>('blood_pressure_systolic')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/v1/metrics?limit=50&sortBy=date&sortOrder=desc')
      const data = await response.json()
      if (data.success) {
        setMetrics(data.data)
      }
    } catch (error) {
      console.error('Failed to load metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMetrics = metrics
    .filter(m => m.type === selectedType)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const latestMetric = metrics.find(m => m.type === selectedType)
  const metricInfo = METRIC_TYPES.find(t => t.value === selectedType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Health Metrics</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Metric
        </button>
      </div>

      {/* Metric Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {METRIC_TYPES.map((type) => {
          const count = metrics.filter(m => m.type === type.value).length
          return (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedType === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="text-sm font-medium text-gray-900">{type.label.split('(')[0].trim()}</div>
              <div className="text-xs text-gray-500 mt-1">{count} records</div>
            </button>
          )
        })}
      </div>

      {/* Current Value Card */}
      {latestMetric && metricInfo && (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-100 text-sm mb-1">Latest {metricInfo.label}</div>
              <div className="text-4xl font-bold">
                {latestMetric.value} <span className="text-2xl">{latestMetric.unit}</span>
              </div>
              <div className="text-blue-100 text-sm mt-2">
                {new Date(latestMetric.date).toLocaleDateString()} at{' '}
                {new Date(latestMetric.date).toLocaleTimeString()}
              </div>
            </div>
            <div className="text-6xl opacity-50">{metricInfo.icon}</div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Trends</h2>
        {filteredMetrics.length > 0 ? (
          <HealthMetricChart
            data={filteredMetrics.map(m => ({ date: m.date, value: m.value }))}
            dataKey="value"
            name={metricInfo?.label || 'Value'}
            color="#3b82f6"
            unit={metricInfo?.unit ? ` ${metricInfo.unit}` : ''}
            type="line"
            height={300}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            No data recorded yet. Add your first {metricInfo?.label} reading.
          </div>
        )}
      </div>

      {/* Recent Readings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Recent Readings</h2>
        </div>
        <div className="divide-y">
          {filteredMetrics.slice(-10).reverse().map((metric) => (
            <div key={metric.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {metric.value} {metric.unit}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(metric.date).toLocaleString()}
                  </div>
                  {metric.notes && (
                    <div className="text-sm text-gray-600 mt-1">{metric.notes}</div>
                  )}
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Metric Modal */}
      {showAddModal && (
        <AddMetricModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            loadMetrics()
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

function AddMetricModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    type: 'blood_pressure_systolic',
    value: '',
    date: new Date().toISOString().slice(0, 16),
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const metricType = METRIC_TYPES.find(t => t.value === formData.type)
      const response = await fetch('/api/v1/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          value: parseFloat(formData.value),
          unit: metricType?.unit || '',
          date: formData.date,
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to add metric:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Add Health Metric</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Metric Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {METRIC_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value ({METRIC_TYPES.find(t => t.value === formData.type)?.unit})
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
            <input
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Metric'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
