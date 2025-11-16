/**
 * Phase 22: Health Trends & Correlations Dashboard
 *
 * Analyzes relationships between different health metrics:
 * - Sleep quality vs. Mood
 * - Exercise vs. Stress levels
 * - Nutrition vs. Energy
 * - Weight vs. Exercise frequency
 * - Blood pressure vs. Stress
 */

'use client'

import { useState, useEffect } from 'react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

interface CorrelationData {
  sleepVsMood: Array<{ sleep: number; mood: number; date: string }>
  exerciseVsStress: Array<{ exercise: number; stress: number; date: string }>
  nutritionVsEnergy: Array<{ calories: number; energy: number; date: string }>
  weightVsExercise: Array<{ weight: number; exerciseDays: number; week: string }>
  bpVsStress: Array<{ systolic: number; stress: number; date: string }>
}

interface Correlation {
  metric1: string
  metric2: string
  coefficient: number // -1 to 1
  strength: 'Strong' | 'Moderate' | 'Weak' | 'None'
  direction: 'Positive' | 'Negative' | 'None'
  interpretation: string
}

export function HealthCorrelationsDashboard() {
  const [data, setData] = useState<CorrelationData | null>(null)
  const [correlations, setCorrelations] = useState<Correlation[]>([])
  const [selectedCorrelation, setSelectedCorrelation] = useState<string>('sleepVsMood')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCorrelationData()
  }, [])

  const loadCorrelationData = async () => {
    setIsLoading(true)
    try {
      // In production, fetch from analytics API
      const mockData: CorrelationData = {
        sleepVsMood: generateCorrelatedData(30, 7, 7, 0.7),
        exerciseVsStress: generateCorrelatedData(30, 45, 5, -0.6),
        nutritionVsEnergy: generateCorrelatedData(30, 2000, 7, 0.5),
        weightVsExercise: generateWeeklyData(12),
        bpVsStress: generateCorrelatedData(30, 120, 5, 0.4),
      }

      setData(mockData)

      // Calculate correlations
      const calcs: Correlation[] = [
        calculateCorrelation('Sleep Quality', 'Mood', mockData.sleepVsMood.map(d => d.sleep), mockData.sleepVsMood.map(d => d.mood)),
        calculateCorrelation('Exercise Duration', 'Stress Level', mockData.exerciseVsStress.map(d => d.exercise), mockData.exerciseVsStress.map(d => d.stress)),
        calculateCorrelation('Calorie Intake', 'Energy Level', mockData.nutritionVsEnergy.map(d => d.calories), mockData.nutritionVsEnergy.map(d => d.energy)),
        calculateCorrelation('Blood Pressure', 'Stress Level', mockData.bpVsStress.map(d => d.systolic), mockData.bpVsStress.map(d => d.stress)),
      ]

      setCorrelations(calcs)
    } catch (error) {
      console.error('Failed to load correlation data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateCorrelatedData = (count: number, xBase: number, yBase: number, correlation: number) => {
    const data = []
    const today = new Date()

    for (let i = 0; i < count; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (count - 1 - i))

      const xNoise = (Math.random() - 0.5) * 2
      const yNoise = (Math.random() - 0.5) * 2

      const x = xBase + xNoise * (xBase * 0.2)
      const y = yBase + (xNoise * correlation + yNoise * (1 - Math.abs(correlation))) * (yBase * 0.2)

      data.push({
        sleep: x,
        mood: y,
        exercise: x,
        stress: y,
        calories: x,
        energy: y,
        systolic: x,
        date: date.toISOString(),
      })
    }

    return data
  }

  const generateWeeklyData = (weeks: number) => {
    const data = []
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - weeks * 7)

    for (let i = 0; i < weeks; i++) {
      const weight = 70 - i * 0.3 + (Math.random() - 0.5) * 0.5
      const exerciseDays = 3 + i * 0.2 + (Math.random() - 0.5)

      data.push({
        week: `Week ${i + 1}`,
        weight: parseFloat(weight.toFixed(1)),
        exerciseDays: Math.round(Math.max(0, Math.min(7, exerciseDays))),
      })
    }

    return data
  }

  const calculateCorrelation = (metric1: string, metric2: string, x: number[], y: number[]): Correlation => {
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

    const r = (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    const absR = Math.abs(r)
    let strength: 'Strong' | 'Moderate' | 'Weak' | 'None'
    let interpretation: string

    if (absR >= 0.7) {
      strength = 'Strong'
      interpretation = r > 0
        ? `Strong positive relationship: Higher ${metric1.toLowerCase()} is strongly associated with higher ${metric2.toLowerCase()}.`
        : `Strong negative relationship: Higher ${metric1.toLowerCase()} is strongly associated with lower ${metric2.toLowerCase()}.`
    } else if (absR >= 0.4) {
      strength = 'Moderate'
      interpretation = r > 0
        ? `Moderate positive relationship: Higher ${metric1.toLowerCase()} tends to be associated with higher ${metric2.toLowerCase()}.`
        : `Moderate negative relationship: Higher ${metric1.toLowerCase()} tends to be associated with lower ${metric2.toLowerCase()}.`
    } else if (absR >= 0.2) {
      strength = 'Weak'
      interpretation = r > 0
        ? `Weak positive relationship: Slight tendency for higher ${metric1.toLowerCase()} to be associated with higher ${metric2.toLowerCase()}.`
        : `Weak negative relationship: Slight tendency for higher ${metric1.toLowerCase()} to be associated with lower ${metric2.toLowerCase()}.`
    } else {
      strength = 'None'
      interpretation = `Little to no relationship detected between ${metric1.toLowerCase()} and ${metric2.toLowerCase()}.`
    }

    return {
      metric1,
      metric2,
      coefficient: parseFloat(r.toFixed(3)),
      strength,
      direction: r > 0.1 ? 'Positive' : r < -0.1 ? 'Negative' : 'None',
      interpretation,
    }
  }

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading correlation analysis...</div>
      </div>
    )
  }

  const getStrengthColor = (strength: string): string => {
    switch (strength) {
      case 'Strong': return 'text-green-600 bg-green-100'
      case 'Moderate': return 'text-yellow-600 bg-yellow-100'
      case 'Weak': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const CORRELATIONS = [
    { id: 'sleepVsMood', label: 'Sleep vs. Mood', icon: '😴💭', xLabel: 'Sleep Quality', yLabel: 'Mood' },
    { id: 'exerciseVsStress', label: 'Exercise vs. Stress', icon: '🏃😣', xLabel: 'Exercise (min)', yLabel: 'Stress Level' },
    { id: 'nutritionVsEnergy', label: 'Nutrition vs. Energy', icon: '🍎⚡', xLabel: 'Calories', yLabel: 'Energy Level' },
    { id: 'weightVsExercise', label: 'Weight vs. Exercise', icon: '⚖️🏋️', xLabel: 'Week', yLabel: 'Weight (kg)' },
    { id: 'bpVsStress', label: 'Blood Pressure vs. Stress', icon: '💓😰', xLabel: 'Systolic BP', yLabel: 'Stress Level' },
  ]

  const currentCorrelation = CORRELATIONS.find(c => c.id === selectedCorrelation)!

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Health Correlations</h1>
        <p className="text-gray-600 mt-2">
          Discover relationships between your health metrics to understand what factors influence your wellbeing.
        </p>
      </div>

      {/* Correlation Strength Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {correlations.map((corr, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500 mb-1">{corr.metric1} vs {corr.metric2}</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {corr.coefficient > 0 ? '+' : ''}{corr.coefficient}
                </div>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${getStrengthColor(corr.strength)}`}>
                  {corr.strength}
                </div>
              </div>
              <div className="text-3xl">
                {corr.direction === 'Positive' ? '📈' : corr.direction === 'Negative' ? '📉' : '➡️'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Correlation Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CORRELATIONS.map((corr) => (
          <button
            key={corr.id}
            onClick={() => setSelectedCorrelation(corr.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 ${
              selectedCorrelation === corr.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{corr.icon}</span>
            <span>{corr.label}</span>
          </button>
        ))}
      </div>

      {/* Scatter Plot */}
      {selectedCorrelation !== 'weightVsExercise' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {currentCorrelation.label} Correlation
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={selectedCorrelation === 'sleepVsMood' ? 'sleep' :
                          selectedCorrelation === 'exerciseVsStress' ? 'exercise' :
                          selectedCorrelation === 'nutritionVsEnergy' ? 'calories' : 'systolic'}
                name={currentCorrelation.xLabel}
                stroke="#6b7280"
                style={{ fontSize: 12 }}
              />
              <YAxis
                dataKey={selectedCorrelation === 'sleepVsMood' ? 'mood' :
                          selectedCorrelation === 'exerciseVsStress' ? 'stress' :
                          selectedCorrelation === 'nutritionVsEnergy' ? 'energy' : 'stress'}
                name={currentCorrelation.yLabel}
                stroke="#6b7280"
                style={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">
                          {new Date(payload[0].payload.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {currentCorrelation.xLabel}: {payload[0].value}
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {currentCorrelation.yLabel}: {payload[1].value}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Scatter
                name={currentCorrelation.label}
                data={selectedCorrelation === 'sleepVsMood' ? data.sleepVsMood :
                      selectedCorrelation === 'exerciseVsStress' ? data.exerciseVsStress :
                      selectedCorrelation === 'nutritionVsEnergy' ? data.nutritionVsEnergy : data.bpVsStress}
                fill="#3b82f6"
                opacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>

          {/* Interpretation */}
          {correlations.find(c =>
            selectedCorrelation === 'sleepVsMood' ? c.metric1.includes('Sleep') :
            selectedCorrelation === 'exerciseVsStress' ? c.metric1.includes('Exercise') :
            selectedCorrelation === 'nutritionVsEnergy' ? c.metric1.includes('Calorie') :
            c.metric1.includes('Blood')
          ) && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-2xl">💡</div>
                <div>
                  <div className="font-semibold text-blue-900 mb-1">Insight</div>
                  <p className="text-sm text-blue-800">
                    {correlations.find(c =>
                      selectedCorrelation === 'sleepVsMood' ? c.metric1.includes('Sleep') :
                      selectedCorrelation === 'exerciseVsStress' ? c.metric1.includes('Exercise') :
                      selectedCorrelation === 'nutritionVsEnergy' ? c.metric1.includes('Calorie') :
                      c.metric1.includes('Blood')
                    )?.interpretation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weight vs Exercise Line Chart */}
      {selectedCorrelation === 'weightVsExercise' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weight & Exercise Trends</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.weightVsExercise} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" style={{ fontSize: 12 }} />
              <YAxis yAxisId="left" stroke="#8b5cf6" style={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" style={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 mb-1">{payload[0].payload.week}</p>
                        <p className="text-sm text-purple-600">Weight: {payload[0].value} kg</p>
                        <p className="text-sm text-blue-600">Exercise: {payload[1].value} days/week</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="weight"
                stroke="#8b5cf6"
                strokeWidth={2}
                name="Weight (kg)"
                dot={{ fill: '#8b5cf6', r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="exerciseDays"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Exercise Days"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-2xl">✅</div>
              <div>
                <div className="font-semibold text-green-900 mb-1">Progress</div>
                <p className="text-sm text-green-800">
                  Your weight is trending downward while exercise frequency is increasing - excellent progress!
                  Consistent exercise appears to be supporting your weight management goals.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Correlation Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Correlation Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metrics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coefficient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strength
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interpretation
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {correlations.map((corr, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{corr.metric1}</div>
                    <div className="text-sm text-gray-500">vs {corr.metric2}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {corr.coefficient > 0 ? '+' : ''}{corr.coefficient}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStrengthColor(corr.strength)}`}>
                      {corr.strength}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {corr.direction === 'Positive' ? '📈 Positive' : corr.direction === 'Negative' ? '📉 Negative' : '➡️ Neutral'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {corr.interpretation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Understanding Correlations Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Understanding Correlation Strength</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium text-green-700 mb-1">Strong (0.7-1.0)</div>
            <div className="text-gray-600">Very clear relationship between metrics. Changes in one metric reliably predict changes in the other.</div>
          </div>
          <div>
            <div className="font-medium text-yellow-700 mb-1">Moderate (0.4-0.7)</div>
            <div className="text-gray-600">Noticeable relationship. There's a tendency for metrics to move together, but not always.</div>
          </div>
          <div>
            <div className="font-medium text-orange-700 mb-1">Weak (0.2-0.4)</div>
            <div className="text-gray-600">Slight relationship. Metrics may have some connection but it's not very predictable.</div>
          </div>
          <div>
            <div className="font-medium text-gray-700 mb-1">None (0.0-0.2)</div>
            <div className="text-gray-600">Little to no relationship. Changes in one metric don't appear to affect the other.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
