'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Line
} from 'recharts'
import {
  Activity, TrendingUp, TrendingDown, Target, Users,
  Award, AlertTriangle, CheckCircle, Info, ChevronDown
} from 'lucide-react'

// Types
interface HealthMetric {
  type: string
  value: number
  unit: string
  date: Date
}

interface PopulationBenchmark {
  metric: string
  userValue: number
  populationAverage: number
  healthyMin: number
  healthyMax: number
  userPercentile: number
  ageGroup: string
  gender: string
  unit: string
}

interface ComparisonCategory {
  category: string
  score: number // 0-100, how well user is doing
  metrics: PopulationBenchmark[]
}

// Mock data generator for population benchmarks
const generatePopulationBenchmarks = (
  userAge: number,
  userGender: 'male' | 'female',
  userMetrics: HealthMetric[]
): PopulationBenchmark[] => {
  const ageGroup = userAge < 30 ? '18-29' : userAge < 50 ? '30-49' : userAge < 65 ? '50-64' : '65+'

  // Population norms (simplified - would come from CDC/WHO data in production)
  const populationNorms: Record<string, any> = {
    'blood_pressure_systolic': {
      average: userGender === 'male' ? 125 : 120,
      healthyMin: 90,
      healthyMax: 120,
    },
    'blood_pressure_diastolic': {
      average: userGender === 'male' ? 80 : 78,
      healthyMin: 60,
      healthyMax: 80,
    },
    'heart_rate': {
      average: userGender === 'male' ? 72 : 75,
      healthyMin: 60,
      healthyMax: 100,
    },
    'weight': {
      average: userGender === 'male' ? 180 : 150,
      healthyMin: userGender === 'male' ? 140 : 110,
      healthyMax: userGender === 'male' ? 185 : 155,
    },
    'glucose': {
      average: 95,
      healthyMin: 70,
      healthyMax: 100,
    },
    'cholesterol_total': {
      average: 195,
      healthyMin: 125,
      healthyMax: 200,
    },
    'bmi': {
      average: 26.5,
      healthyMin: 18.5,
      healthyMax: 24.9,
    },
    'body_fat': {
      average: userGender === 'male' ? 22 : 28,
      healthyMin: userGender === 'male' ? 10 : 20,
      healthyMax: userGender === 'male' ? 20 : 25,
    },
  }

  const benchmarks: PopulationBenchmark[] = []

  userMetrics.forEach(metric => {
    const norm = populationNorms[metric.type]
    if (!norm) return

    // Calculate percentile (simplified z-score approach)
    const stdDev = (norm.healthyMax - norm.healthyMin) / 4 // approximate
    const zScore = (metric.value - norm.average) / stdDev
    const percentile = Math.round(
      50 + (zScore * 20) // rough percentile approximation
    )
    const clampedPercentile = Math.max(1, Math.min(99, percentile))

    benchmarks.push({
      metric: metric.type,
      userValue: metric.value,
      populationAverage: norm.average,
      healthyMin: norm.healthyMin,
      healthyMax: norm.healthyMax,
      userPercentile: clampedPercentile,
      ageGroup,
      gender: userGender,
      unit: metric.unit,
    })
  })

  return benchmarks
}

// Calculate category scores
const categorizeComparisons = (benchmarks: PopulationBenchmark[]): ComparisonCategory[] => {
  const categories: ComparisonCategory[] = [
    {
      category: 'Cardiovascular Health',
      score: 0,
      metrics: benchmarks.filter(b =>
        ['blood_pressure_systolic', 'blood_pressure_diastolic', 'heart_rate', 'cholesterol_total'].includes(b.metric)
      ),
    },
    {
      category: 'Metabolic Health',
      score: 0,
      metrics: benchmarks.filter(b =>
        ['glucose', 'weight', 'bmi', 'body_fat'].includes(b.metric)
      ),
    },
    {
      category: 'Body Composition',
      score: 0,
      metrics: benchmarks.filter(b =>
        ['weight', 'bmi', 'body_fat'].includes(b.metric)
      ),
    },
  ]

  // Calculate scores for each category
  categories.forEach(cat => {
    if (cat.metrics.length === 0) {
      cat.score = 0
      return
    }

    const scores = cat.metrics.map(m => {
      const inHealthyRange = m.userValue >= m.healthyMin && m.userValue <= m.healthyMax
      if (inHealthyRange) return 100

      // Calculate how far outside healthy range
      if (m.userValue < m.healthyMin) {
        const distance = (m.healthyMin - m.userValue) / (m.healthyMax - m.healthyMin)
        return Math.max(0, 100 - distance * 100)
      } else {
        const distance = (m.userValue - m.healthyMax) / (m.healthyMax - m.healthyMin)
        return Math.max(0, 100 - distance * 100)
      }
    })

    cat.score = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
  })

  return categories.filter(c => c.metrics.length > 0)
}

// Metric display names
const metricNames: Record<string, string> = {
  blood_pressure_systolic: 'Systolic BP',
  blood_pressure_diastolic: 'Diastolic BP',
  heart_rate: 'Heart Rate',
  weight: 'Weight',
  glucose: 'Blood Glucose',
  cholesterol_total: 'Total Cholesterol',
  bmi: 'BMI',
  body_fat: 'Body Fat %',
}

export function ComparativeBenchmarksDashboard() {
  // Mock user data
  const [userAge] = useState(35)
  const [userGender] = useState<'male' | 'female'>('male')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Mock health metrics
  const userMetrics: HealthMetric[] = [
    { type: 'blood_pressure_systolic', value: 128, unit: 'mmHg', date: new Date() },
    { type: 'blood_pressure_diastolic', value: 82, unit: 'mmHg', date: new Date() },
    { type: 'heart_rate', value: 68, unit: 'bpm', date: new Date() },
    { type: 'weight', value: 175, unit: 'lbs', date: new Date() },
    { type: 'glucose', value: 92, unit: 'mg/dL', date: new Date() },
    { type: 'cholesterol_total', value: 188, unit: 'mg/dL', date: new Date() },
    { type: 'bmi', value: 24.2, unit: '', date: new Date() },
    { type: 'body_fat', value: 19, unit: '%', date: new Date() },
  ]

  const benchmarks = useMemo(
    () => generatePopulationBenchmarks(userAge, userGender, userMetrics),
    [userAge, userGender]
  )

  const categories = useMemo(
    () => categorizeComparisons(benchmarks),
    [benchmarks]
  )

  const overallScore = useMemo(() => {
    if (categories.length === 0) return 0
    return Math.round(
      categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length
    )
  }, [categories])

  // Get status based on score
  const getScoreStatus = (score: number): {
    text: string
    color: string
    icon: React.ReactNode
  } => {
    if (score >= 90) return {
      text: 'Excellent',
      color: 'bg-green-500',
      icon: <Award className="h-4 w-4" />
    }
    if (score >= 75) return {
      text: 'Good',
      color: 'bg-blue-500',
      icon: <CheckCircle className="h-4 w-4" />
    }
    if (score >= 60) return {
      text: 'Fair',
      color: 'bg-yellow-500',
      icon: <Info className="h-4 w-4" />
    }
    return {
      text: 'Needs Improvement',
      color: 'bg-red-500',
      icon: <AlertTriangle className="h-4 w-4" />
    }
  }

  const overallStatus = getScoreStatus(overallScore)

  // Prepare data for radar chart
  const radarData = categories.map(cat => ({
    category: cat.category.replace(' Health', ''),
    score: cat.score,
    fullMark: 100,
  }))

  // Prepare comparison chart data for selected category
  const selectedCategoryData = selectedCategory
    ? categories.find(c => c.category === selectedCategory)
    : categories[0]

  const comparisonChartData = selectedCategoryData?.metrics.map(m => ({
    metric: metricNames[m.metric] || m.metric,
    'Your Value': m.userValue,
    'Population Average': m.populationAverage,
    'Healthy Min': m.healthyMin,
    'Healthy Max': m.healthyMax,
    unit: m.unit,
    inRange: m.userValue >= m.healthyMin && m.userValue <= m.healthyMax,
  })) || []

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Health Benchmarks Comparison</h1>
        <p className="text-muted-foreground">
          Compare your health metrics against population averages and healthy ranges for your age group ({userAge} years, {userGender})
        </p>
      </div>

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Health Score
          </CardTitle>
          <CardDescription>
            Based on {benchmarks.length} health metrics compared to population norms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-5xl font-bold">{overallScore}</span>
                <Badge className={overallStatus.color + ' text-white'}>
                  <span className="flex items-center gap-1">
                    {overallStatus.icon}
                    {overallStatus.text}
                  </span>
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${overallStatus.color}`}
                  style={{ width: `${overallScore}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                You're performing {overallScore >= 75 ? 'above' : overallScore >= 50 ? 'at' : 'below'} population average across all metrics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <div className="grid gap-4 md:grid-cols-3">
        {categories.map((cat) => {
          const status = getScoreStatus(cat.score)
          return (
            <Card
              key={cat.category}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedCategory(cat.category)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{cat.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{cat.score}</span>
                    <Badge className={status.color + ' text-white'}>
                      {status.icon}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${status.color}`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {cat.metrics.length} metrics tracked
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Radar Chart - Overall Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Category Performance Overview
          </CardTitle>
          <CardDescription>
            Visual comparison of your health across all categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Your Score"
                dataKey="score"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Metric Comparison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Detailed Metric Comparison: {selectedCategoryData?.category}
              </CardTitle>
              <CardDescription>
                Your values vs. population average and healthy ranges
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <ChevronDown className="h-4 w-4 mr-2" />
              Change Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={comparisonChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow-lg">
                      <p className="font-semibold mb-1">{data.metric}</p>
                      <p className="text-sm">
                        Your Value: <span className="font-bold">{data['Your Value']}</span> {data.unit}
                      </p>
                      <p className="text-sm">
                        Population Avg: <span className="font-bold">{data['Population Average']}</span> {data.unit}
                      </p>
                      <p className="text-sm text-green-600">
                        Healthy Range: {data['Healthy Min']} - {data['Healthy Max']} {data.unit}
                      </p>
                      <Badge className={data.inRange ? 'bg-green-500 text-white mt-1' : 'bg-yellow-500 text-white mt-1'}>
                        {data.inRange ? 'In Healthy Range' : 'Outside Range'}
                      </Badge>
                    </div>
                  )
                }}
              />
              <Legend />
              <Bar dataKey="Your Value" fill="#3b82f6">
                {comparisonChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.inRange ? '#22c55e' : '#eab308'} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="Population Average" stroke="#94a3b8" strokeWidth={2} />
              <ReferenceLine y={0} stroke="#000" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Percentile Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Percentile Rankings
          </CardTitle>
          <CardDescription>
            Where you stand compared to others in your age group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {benchmarks.map((benchmark) => {
              const isGood = benchmark.userValue >= benchmark.healthyMin &&
                            benchmark.userValue <= benchmark.healthyMax
              const percentile = benchmark.userPercentile

              return (
                <div key={benchmark.metric} className="border-b pb-4 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">
                        {metricNames[benchmark.metric] || benchmark.metric}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {benchmark.userValue} {benchmark.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {percentile}
                        <span className="text-sm align-super">th</span>
                      </p>
                      <p className="text-xs text-muted-foreground">percentile</p>
                    </div>
                  </div>

                  {/* Percentile visualization */}
                  <div className="relative w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`absolute h-3 rounded-full ${isGood ? 'bg-green-500' : 'bg-yellow-500'}`}
                      style={{ width: `${percentile}%` }}
                    />
                    {/* Marker for 50th percentile */}
                    <div className="absolute h-5 w-0.5 bg-gray-600" style={{ left: '50%', top: '-2px' }} />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>
                      {percentile > 50
                        ? `Better than ${percentile}% of population`
                        : `${100 - percentile}% performing better`
                      }
                    </span>
                    <span>
                      Healthy: {benchmark.healthyMin} - {benchmark.healthyMax} {benchmark.unit}
                    </span>
                  </div>

                  {/* Recommendation */}
                  {!isGood && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                      <p className="font-semibold text-yellow-800">Recommendation:</p>
                      <p className="text-yellow-700">
                        {benchmark.userValue < benchmark.healthyMin
                          ? `Your ${metricNames[benchmark.metric]} is below the healthy range. Consider consulting with your healthcare provider.`
                          : `Your ${metricNames[benchmark.metric]} is above the healthy range. Lifestyle modifications may help bring it within the optimal range.`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Educational Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding Your Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1">What are population benchmarks?</h4>
              <p className="text-muted-foreground">
                Population benchmarks represent average health metric values from large-scale health studies
                (CDC, WHO) for people in your age group and gender. They help contextualize your health data.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">How are percentiles calculated?</h4>
              <p className="text-muted-foreground">
                Your percentile rank shows what percentage of the population has values lower than yours.
                For example, being in the 75th percentile means you're doing better than 75% of people in your demographic group.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-1">What's the difference between "average" and "healthy"?</h4>
              <p className="text-muted-foreground">
                Population averages represent typical values, while healthy ranges represent optimal values
                recommended by medical guidelines. It's better to aim for the healthy range rather than the average.
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800">
                <strong>Note:</strong> These comparisons are for informational purposes only. Individual health
                needs vary, and you should always consult with your healthcare provider for personalized medical advice.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
