/**
 * Phase 21: Multi-Metric Comparison Chart
 */

'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface MetricConfig {
  dataKey: string
  name: string
  color: string
  unit?: string
}

interface MultiMetricChartProps {
  data: any[]
  metrics: MetricConfig[]
  height?: number
  showGrid?: boolean
}

export function MultiMetricChart({
  data,
  metrics,
  height = 300,
  showGrid = true,
}: MultiMetricChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            {new Date(label).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-800">
              {entry.name}: <span className="font-bold" style={{ color: entry.color }}>
                {entry.value}{entry.unit || ''}
              </span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          stroke="#6b7280"
          style={{ fontSize: 12 }}
        />
        <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {metrics.map((metric, index) => (
          <Line
            key={metric.dataKey}
            type="monotone"
            dataKey={metric.dataKey}
            stroke={metric.color}
            strokeWidth={2}
            name={metric.name}
            dot={{ fill: metric.color, r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
