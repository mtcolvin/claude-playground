/**
 * Phase 21: Advanced Visualizations - Health Metric Charts
 */

'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface DataPoint {
  date: string
  value: number
  label?: string
  [key: string]: any
}

interface HealthMetricChartProps {
  data: DataPoint[]
  type?: 'line' | 'bar' | 'area'
  dataKey: string
  name?: string
  color?: string
  showGrid?: boolean
  showLegend?: boolean
  referenceLines?: Array<{
    value: number
    label: string
    color?: string
  }>
  height?: number
  unit?: string
}

export function HealthMetricChart({
  data,
  type = 'line',
  dataKey,
  name = 'Value',
  color = '#3b82f6',
  showGrid = true,
  showLegend = true,
  referenceLines = [],
  height = 300,
  unit = '',
}: HealthMetricChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">
            {new Date(payload[0].payload.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {name}: <span className="font-bold" style={{ color }}>{payload[0].value}{unit}</span>
          </p>
        </div>
      )
    }
    return null
  }

  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const commonProps = {
    data,
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
  }

  const chartElement = (() => {
    switch (type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="#6b7280" style={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {referenceLines.map((line, idx) => (
              <ReferenceLine
                key={idx}
                y={line.value}
                label={{ value: line.label, position: 'right', fontSize: 11 }}
                stroke={line.color || '#ef4444'}
                strokeDasharray="3 3"
              />
            ))}
            <Bar dataKey={dataKey} fill={color} name={name} radius={[4, 4, 0, 0]} />
          </BarChart>
        )

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="#6b7280" style={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {referenceLines.map((line, idx) => (
              <ReferenceLine
                key={idx}
                y={line.value}
                label={{ value: line.label, position: 'right', fontSize: 11 }}
                stroke={line.color || '#ef4444'}
                strokeDasharray="3 3"
              />
            ))}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.2}
              name={name}
            />
          </AreaChart>
        )

      default: // line
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="#6b7280" style={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend />}
            {referenceLines.map((line, idx) => (
              <ReferenceLine
                key={idx}
                y={line.value}
                label={{ value: line.label, position: 'right', fontSize: 11 }}
                stroke={line.color || '#ef4444'}
                strokeDasharray="3 3"
              />
            ))}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              name={name}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        )
    }
  })()

  return (
    <ResponsiveContainer width="100%" height={height}>
      {chartElement}
    </ResponsiveContainer>
  )
}
