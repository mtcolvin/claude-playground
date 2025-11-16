/**
 * Phase 21: Macro Distribution Pie Chart
 */

'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface MacroPieChartProps {
  protein: number
  carbs: number
  fat: number
  height?: number
}

const COLORS = {
  protein: '#3b82f6', // blue
  carbs: '#10b981', // green
  fat: '#f59e0b', // amber
}

export function MacroPieChart({
  protein,
  carbs,
  fat,
  height = 300,
}: MacroPieChartProps) {
  const data = [
    { name: 'Protein', value: protein, color: COLORS.protein },
    { name: 'Carbs', value: carbs, color: COLORS.carbs },
    { name: 'Fat', value: fat, color: COLORS.fat },
  ]

  const total = protein + carbs + fat

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percentage = ((payload[0].value / total) * 100).toFixed(1)
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold" style={{ color: payload[0].payload.color }}>
            {payload[0].name}
          </p>
          <p className="text-sm text-gray-600">
            {payload[0].value}g ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-semibold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mt-4 w-full">
        <div className="text-center">
          <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ backgroundColor: COLORS.protein }}></div>
          <div className="text-xs text-gray-500">Protein</div>
          <div className="text-lg font-bold text-gray-900">{protein}g</div>
          <div className="text-xs text-gray-500">{((protein / total) * 100).toFixed(0)}%</div>
        </div>
        <div className="text-center">
          <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ backgroundColor: COLORS.carbs }}></div>
          <div className="text-xs text-gray-500">Carbs</div>
          <div className="text-lg font-bold text-gray-900">{carbs}g</div>
          <div className="text-xs text-gray-500">{((carbs / total) * 100).toFixed(0)}%</div>
        </div>
        <div className="text-center">
          <div className="w-4 h-4 rounded-full mx-auto mb-1" style={{ backgroundColor: COLORS.fat }}></div>
          <div className="text-xs text-gray-500">Fat</div>
          <div className="text-lg font-bold text-gray-900">{fat}g</div>
          <div className="text-xs text-gray-500">{((fat / total) * 100).toFixed(0)}%</div>
        </div>
      </div>
    </div>
  )
}
