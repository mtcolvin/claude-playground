'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { HealthMetric, MetricType } from '@/lib/types';
import { METRIC_CONFIGS } from '@/lib/types';
import { formatDateShort } from '@/lib/utils';

interface MetricChartProps {
  metrics: HealthMetric[];
  metricType: MetricType;
}

export default function MetricChart({ metrics, metricType }: MetricChartProps) {
  const config = METRIC_CONFIGS[metricType];

  // Filter and sort metrics by date
  const chartData = metrics
    .filter((m) => m.type === metricType)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((m) => ({
      date: formatDateShort(m.date),
      value: m.value,
      fullDate: m.date,
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-900">
        No data available for {config.label}
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">{config.label} Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id={`color${metricType}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis
            domain={[
              Math.floor(config.normalRange.min * 0.8),
              Math.ceil(config.normalRange.max * 1.2),
            ]}
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
            label={{ value: config.unit, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '0.75rem',
            }}
            formatter={(value: number) => [`${value} ${config.unit}`, config.label]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            fill={`url(#color${metricType})`}
          />
          {/* Normal range reference lines */}
          <Line
            y={config.normalRange.min}
            stroke="#10b981"
            strokeDasharray="5 5"
            strokeWidth={1}
            dot={false}
          />
          <Line
            y={config.normalRange.max}
            stroke="#10b981"
            strokeDasharray="5 5"
            strokeWidth={1}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-2 text-sm text-gray-800">
        Normal range: {config.normalRange.min} - {config.normalRange.max} {config.unit}
      </div>
    </div>
  );
}
