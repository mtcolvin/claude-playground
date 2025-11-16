/**
 * Phase 21: Health Analytics Dashboard with Advanced Visualizations
 */

'use client'

import { useState, useEffect } from 'react'
import { HealthMetricChart } from './charts/health-metric-chart'
import { MultiMetricChart } from './charts/multi-metric-chart'
import { MacroPieChart } from './charts/macro-pie-chart'

interface AnalyticsData {
  bloodPressure: Array<{ date: string; systolic: number; diastolic: number }>
  heartRate: Array<{ date: string; value: number }>
  weight: Array<{ date: string; value: number }>
  glucose: Array<{ date: string; value: number }>
  sleep: Array<{ date: string; duration: number; quality: number }>
  mood: Array<{ date: string; mood: number; anxiety: number; stress: number }>
  nutrition: {
    protein: number
    carbs: number
    fat: number
  }
  exercise: Array<{ date: string; duration: number; calories: number }>
}

export function HealthAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [selectedMetric, setSelectedMetric] = useState<string>('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedPeriod])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    try {
      // In production, this would fetch from analytics API
      // For now, using mock data
      const mockData: AnalyticsData = {
        bloodPressure: generateMockData(30, { systolic: 120, diastolic: 80 }),
        heartRate: generateMockData(30, { value: 72 }),
        weight: generateMockData(30, { value: 70 }),
        glucose: generateMockData(30, { value: 95 }),
        sleep: generateMockData(30, { duration: 420, quality: 7 }),
        mood: generateMockData(30, { mood: 7, anxiety: 4, stress: 5 }),
        nutrition: { protein: 150, carbs: 250, fat: 65 },
        exercise: generateMockData(30, { duration: 45, calories: 350 }),
      }
      setData(mockData)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockData = (days: number, baseValues: any) => {
    const data = []
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const entry: any = { date: date.toISOString() }

      Object.keys(baseValues).forEach(key => {
        const variance = baseValues[key] * 0.1
        entry[key] = baseValues[key] + (Math.random() - 0.5) * 2 * variance
      })

      data.push(entry)
    }
    return data
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    )
  }

  const METRICS = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'vitals', label: 'Vital Signs', icon: '💓' },
    { id: 'mental', label: 'Mental Health', icon: '🧠' },
    { id: 'nutrition', label: 'Nutrition', icon: '🍎' },
    { id: 'fitness', label: 'Fitness', icon: '🏃' },
    { id: 'sleep', label: 'Sleep', icon: '😴' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Health Analytics</h1>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg capitalize text-sm ${
                selectedPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {METRICS.map((metric) => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
              selectedMetric === metric.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{metric.icon}</span>
            <span>{metric.label}</span>
          </button>
        ))}
      </div>

      {/* Overview */}
      {selectedMetric === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Avg Blood Pressure</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(data.bloodPressure.reduce((sum, d) => sum + d.systolic, 0) / data.bloodPressure.length)}/
                {Math.round(data.bloodPressure.reduce((sum, d) => sum + d.diastolic, 0) / data.bloodPressure.length)}
              </div>
              <div className="text-xs text-green-600 mt-1">Normal</div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Avg Heart Rate</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(data.heartRate.reduce((sum, d) => sum + d.value, 0) / data.heartRate.length)} bpm
              </div>
              <div className="text-xs text-green-600 mt-1">Healthy</div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Avg Sleep</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {Math.floor(data.sleep.reduce((sum, d) => sum + d.duration, 0) / data.sleep.length / 60)}h{' '}
                {Math.round((data.sleep.reduce((sum, d) => sum + d.duration, 0) / data.sleep.length) % 60)}m
              </div>
              <div className="text-xs text-yellow-600 mt-1">Could improve</div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500">Exercise Days</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {data.exercise.filter(d => d.duration > 0).length} days
              </div>
              <div className="text-xs text-green-600 mt-1">Great!</div>
            </div>
          </div>

          {/* Multi-Metric Comparison */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Health Trends Comparison</h2>
            <MultiMetricChart
              data={data.mood.map((m, i) => ({
                date: m.date,
                mood: m.mood,
                sleep: data.sleep[i]?.quality || 0,
                exercise: data.exercise[i]?.duration ? 1 : 0,
              }))}
              metrics={[
                { dataKey: 'mood', name: 'Mood', color: '#3b82f6', unit: '/10' },
                { dataKey: 'sleep', name: 'Sleep Quality', color: '#10b981', unit: '/10' },
              ]}
              height={350}
            />
          </div>
        </div>
      )}

      {/* Vital Signs */}
      {selectedMetric === 'vitals' && (
        <div className="space-y-6">
          {/* Blood Pressure */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Blood Pressure Trends</h2>
            <MultiMetricChart
              data={data.bloodPressure}
              metrics={[
                { dataKey: 'systolic', name: 'Systolic', color: '#ef4444', unit: ' mmHg' },
                { dataKey: 'diastolic', name: 'Diastolic', color: '#3b82f6', unit: ' mmHg' },
              ]}
              height={350}
            />
          </div>

          {/* Heart Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Heart Rate</h2>
            <HealthMetricChart
              data={data.heartRate}
              dataKey="value"
              name="Heart Rate"
              color="#ef4444"
              unit=" bpm"
              type="area"
              referenceLines={[
                { value: 100, label: 'High', color: '#ef4444' },
                { value: 60, label: 'Normal', color: '#10b981' },
              ]}
              height={300}
            />
          </div>

          {/* Weight */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Weight Progress</h2>
            <HealthMetricChart
              data={data.weight}
              dataKey="value"
              name="Weight"
              color="#8b5cf6"
              unit=" kg"
              type="line"
              height={300}
            />
          </div>

          {/* Blood Glucose */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Blood Glucose</h2>
            <HealthMetricChart
              data={data.glucose}
              dataKey="value"
              name="Glucose"
              color="#f59e0b"
              unit=" mg/dL"
              type="line"
              referenceLines={[
                { value: 140, label: 'High', color: '#ef4444' },
                { value: 100, label: 'Target', color: '#10b981' },
                { value: 70, label: 'Low', color: '#ef4444' },
              ]}
              height={300}
            />
          </div>
        </div>
      )}

      {/* Mental Health */}
      {selectedMetric === 'mental' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mental Health Trends</h2>
            <MultiMetricChart
              data={data.mood}
              metrics={[
                { dataKey: 'mood', name: 'Mood', color: '#10b981', unit: '/10' },
                { dataKey: 'anxiety', name: 'Anxiety', color: '#f59e0b', unit: '/10' },
                { dataKey: 'stress', name: 'Stress', color: '#ef4444', unit: '/10' },
              ]}
              height={400}
            />
          </div>

          {/* Individual Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood</h3>
              <HealthMetricChart
                data={data.mood.map(m => ({ date: m.date, value: m.mood }))}
                dataKey="value"
                name="Mood"
                color="#10b981"
                unit="/10"
                type="area"
                height={200}
                showLegend={false}
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Anxiety</h3>
              <HealthMetricChart
                data={data.mood.map(m => ({ date: m.date, value: m.anxiety }))}
                dataKey="value"
                name="Anxiety"
                color="#f59e0b"
                unit="/10"
                type="area"
                height={200}
                showLegend={false}
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stress</h3>
              <HealthMetricChart
                data={data.mood.map(m => ({ date: m.date, value: m.stress }))}
                dataKey="value"
                name="Stress"
                color="#ef4444"
                unit="/10"
                type="area"
                height={200}
                showLegend={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Nutrition */}
      {selectedMetric === 'nutrition' && (
        <div className="space-y-6">
          {/* Macro Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Macro Distribution (Average)</h2>
            <MacroPieChart
              protein={data.nutrition.protein}
              carbs={data.nutrition.carbs}
              fat={data.nutrition.fat}
              height={350}
            />
          </div>

          {/* Calorie Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Calorie Intake</h2>
            <HealthMetricChart
              data={data.mood.map((_, i) => ({
                date: data.mood[i].date,
                value: 1800 + Math.random() * 400,
              }))}
              dataKey="value"
              name="Calories"
              color="#10b981"
              unit=" kcal"
              type="bar"
              referenceLines={[
                { value: 2000, label: 'Target', color: '#3b82f6' },
              ]}
              height={300}
            />
          </div>
        </div>
      )}

      {/* Fitness */}
      {selectedMetric === 'fitness' && (
        <div className="space-y-6">
          {/* Exercise Duration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Workout Duration</h2>
            <HealthMetricChart
              data={data.exercise}
              dataKey="duration"
              name="Duration"
              color="#3b82f6"
              unit=" min"
              type="bar"
              height={300}
            />
          </div>

          {/* Calories Burned */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Calories Burned</h2>
            <HealthMetricChart
              data={data.exercise}
              dataKey="calories"
              name="Calories"
              color="#ef4444"
              unit=" kcal"
              type="area"
              height={300}
            />
          </div>
        </div>
      )}

      {/* Sleep */}
      {selectedMetric === 'sleep' && (
        <div className="space-y-6">
          {/* Sleep Duration & Quality */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sleep Patterns</h2>
            <MultiMetricChart
              data={data.sleep.map(s => ({
                date: s.date,
                duration: s.duration / 60, // Convert to hours
                quality: s.quality,
              }))}
              metrics={[
                { dataKey: 'duration', name: 'Duration (hours)', color: '#8b5cf6', unit: 'h' },
                { dataKey: 'quality', name: 'Quality', color: '#3b82f6', unit: '/10' },
              ]}
              height={350}
            />
          </div>

          {/* Sleep Quality */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sleep Quality Trend</h2>
            <HealthMetricChart
              data={data.sleep.map(s => ({ date: s.date, value: s.quality }))}
              dataKey="value"
              name="Quality"
              color="#3b82f6"
              unit="/10"
              type="area"
              referenceLines={[
                { value: 7, label: 'Good', color: '#10b981' },
              ]}
              height={300}
            />
          </div>
        </div>
      )}
    </div>
  )
}
