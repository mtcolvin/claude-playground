'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Lightbulb, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Heart, Brain, Activity, Apple, Moon, Pill, Target, Sparkles,
  ChevronRight, Star, Info, Award, Calendar
} from 'lucide-react'

// Types
interface HealthMetric {
  type: string
  value: number
  unit: string
  date: Date
}

interface Insight {
  id: string
  category: 'positive' | 'warning' | 'alert' | 'info' | 'achievement'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  evidence: string[]
  recommendations: string[]
  impact: 'high' | 'medium' | 'low'
  confidence: number // 0-100
  icon: React.ReactNode
  color: string
  relatedMetrics: string[]
  actionable: boolean
}

interface Recommendation {
  id: string
  category: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  timeframe: string
  effort: 'easy' | 'moderate' | 'challenging'
  expectedBenefit: string
  steps: string[]
  icon: React.ReactNode
}

// Insight generation engine
const generateInsights = (
  metrics: HealthMetric[],
  historicalData?: HealthMetric[]
): Insight[] => {
  const insights: Insight[] = []

  // Analyze cardiovascular health
  const systolicBP = metrics.find(m => m.type === 'blood_pressure_systolic')
  const diastolicBP = metrics.find(m => m.type === 'blood_pressure_diastolic')
  const heartRate = metrics.find(m => m.type === 'heart_rate')

  if (systolicBP && diastolicBP) {
    const isHealthy = systolicBP.value < 120 && diastolicBP.value < 80

    if (isHealthy) {
      insights.push({
        id: 'cv-healthy',
        category: 'positive',
        priority: 'low',
        title: 'Excellent Blood Pressure',
        description: 'Your blood pressure is within the optimal range, indicating good cardiovascular health.',
        evidence: [
          `Systolic: ${systolicBP.value} mmHg (Optimal: <120)`,
          `Diastolic: ${diastolicBP.value} mmHg (Optimal: <80)`,
          'Consistently maintained over the past month'
        ],
        recommendations: [
          'Continue your current lifestyle habits',
          'Maintain regular exercise routine',
          'Keep monitoring monthly'
        ],
        impact: 'high',
        confidence: 95,
        icon: <Heart className="h-5 w-5" />,
        color: 'text-green-600',
        relatedMetrics: ['blood_pressure_systolic', 'blood_pressure_diastolic'],
        actionable: false
      })
    } else if (systolicBP.value >= 130 || diastolicBP.value >= 80) {
      insights.push({
        id: 'cv-elevated',
        category: 'warning',
        priority: 'high',
        title: 'Elevated Blood Pressure Detected',
        description: 'Your blood pressure readings indicate stage 1 hypertension. This requires attention.',
        evidence: [
          `Systolic: ${systolicBP.value} mmHg (Normal: <120)`,
          `Diastolic: ${diastolicBP.value} mmHg (Normal: <80)`,
          'Stage 1 Hypertension range'
        ],
        recommendations: [
          'Schedule appointment with your healthcare provider',
          'Reduce sodium intake to <2,300mg/day',
          'Increase physical activity to 150 min/week',
          'Monitor blood pressure daily',
          'Reduce stress through meditation or yoga'
        ],
        impact: 'high',
        confidence: 88,
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'text-orange-600',
        relatedMetrics: ['blood_pressure_systolic', 'blood_pressure_diastolic'],
        actionable: true
      })
    }
  }

  // Analyze metabolic health
  const glucose = metrics.find(m => m.type === 'glucose')
  const weight = metrics.find(m => m.type === 'weight')
  const bmi = metrics.find(m => m.type === 'bmi')

  if (glucose && glucose.value > 100) {
    insights.push({
      id: 'glucose-elevated',
      category: 'warning',
      priority: 'high',
      title: 'Prediabetic Glucose Levels',
      description: 'Your fasting glucose is in the prediabetic range (100-125 mg/dL).',
      evidence: [
        `Fasting glucose: ${glucose.value} mg/dL`,
        'Normal range: 70-99 mg/dL',
        'Prediabetic range: 100-125 mg/dL'
      ],
      recommendations: [
        'Get HbA1c test to assess 3-month average',
        'Reduce refined carbohydrate intake',
        'Increase fiber consumption to 25-30g/day',
        'Aim for 7-9% weight reduction if overweight',
        'Exercise 30 minutes after meals'
      ],
      impact: 'high',
      confidence: 92,
      icon: <Activity className="h-5 w-5" />,
      color: 'text-orange-600',
      relatedMetrics: ['glucose', 'weight', 'exercise'],
      actionable: true
    })
  }

  // Analyze mental health patterns
  const recentMood = metrics.filter(m => m.type === 'mood')
  if (recentMood.length >= 7) {
    const avgMood = recentMood.reduce((sum, m) => sum + m.value, 0) / recentMood.length

    if (avgMood >= 7) {
      insights.push({
        id: 'mood-positive',
        category: 'positive',
        priority: 'medium',
        title: 'Excellent Mental Well-being',
        description: 'Your mood has been consistently positive over the past week.',
        evidence: [
          `Average mood score: ${avgMood.toFixed(1)}/10`,
          `${recentMood.filter(m => m.value >= 7).length} out of ${recentMood.length} days were positive`,
          'Upward trend detected'
        ],
        recommendations: [
          "Document what's working well",
          'Maintain sleep schedule',
          'Continue social activities',
          'Practice gratitude journaling'
        ],
        impact: 'medium',
        confidence: 85,
        icon: <Brain className="h-5 w-5" />,
        color: 'text-blue-600',
        relatedMetrics: ['mood', 'stress', 'sleep'],
        actionable: false
      })
    } else if (avgMood < 5) {
      insights.push({
        id: 'mood-concerning',
        category: 'alert',
        priority: 'high',
        title: 'Low Mood Pattern Detected',
        description: 'Your mood has been below average for over a week. Consider seeking support.',
        evidence: [
          `Average mood: ${avgMood.toFixed(1)}/10`,
          `${recentMood.filter(m => m.value < 5).length} days with low mood`,
          'Declining trend over 7 days'
        ],
        recommendations: [
          'Schedule appointment with mental health professional',
          'Reach out to trusted friends or family',
          'Consider therapy or counseling',
          'Maintain regular sleep schedule',
          'Engage in physical activity daily',
          'Limit alcohol and caffeine',
          'Call crisis hotline if needed: 988'
        ],
        impact: 'high',
        confidence: 90,
        icon: <AlertTriangle className="h-5 w-5" />,
        color: 'text-red-600',
        relatedMetrics: ['mood', 'anxiety', 'stress', 'sleep'],
        actionable: true
      })
    }
  }

  // Analyze sleep patterns
  const sleepSessions = metrics.filter(m => m.type === 'sleep_duration')
  if (sleepSessions.length >= 7) {
    const avgSleep = sleepSessions.reduce((sum, s) => sum + s.value, 0) / sleepSessions.length

    if (avgSleep < 7) {
      insights.push({
        id: 'sleep-insufficient',
        category: 'warning',
        priority: 'high',
        title: 'Chronic Sleep Deprivation',
        description: "You're averaging less than 7 hours of sleep per night.",
        evidence: [
          `Average sleep: ${avgSleep.toFixed(1)} hours/night`,
          'Recommended: 7-9 hours',
          `Only ${sleepSessions.filter(s => s.value >= 7).length} nights met minimum`
        ],
        recommendations: [
          'Set consistent bedtime (10:30 PM recommended)',
          'Avoid screens 1 hour before bed',
          'Keep bedroom cool (65-68°F)',
          'Avoid caffeine after 2 PM',
          'Create relaxing bedtime routine'
        ],
        impact: 'high',
        confidence: 88,
        icon: <Moon className="h-5 w-5" />,
        color: 'text-indigo-600',
        relatedMetrics: ['sleep_duration', 'sleep_quality', 'mood'],
        actionable: true
      })
    } else if (avgSleep >= 7 && avgSleep <= 9) {
      insights.push({
        id: 'sleep-optimal',
        category: 'achievement',
        priority: 'low',
        title: 'Excellent Sleep Habits',
        description: "You're consistently getting the recommended amount of sleep.",
        evidence: [
          `Average: ${avgSleep.toFixed(1)} hours/night`,
          'Within optimal range (7-9 hours)',
          `${sleepSessions.filter(s => s.value >= 7).length} nights met goal`
        ],
        recommendations: [
          'Maintain your current sleep schedule',
          'Continue prioritizing rest',
          'Track sleep quality over time'
        ],
        impact: 'medium',
        confidence: 92,
        icon: <Award className="h-5 w-5" />,
        color: 'text-purple-600',
        relatedMetrics: ['sleep_duration', 'sleep_quality'],
        actionable: false
      })
    }
  }

  // Analyze exercise patterns
  const exerciseSessions = metrics.filter(m => m.type === 'exercise_duration')
  if (exerciseSessions.length > 0) {
    const totalMinutes = exerciseSessions.reduce((sum, e) => sum + e.value, 0)
    const weeksTracked = Math.max(1, exerciseSessions.length / 7)
    const weeklyAvg = totalMinutes / weeksTracked

    if (weeklyAvg >= 150) {
      insights.push({
        id: 'exercise-excellent',
        category: 'achievement',
        priority: 'medium',
        title: 'Meeting Exercise Guidelines',
        description: "You're exceeding the CDC recommendation of 150 minutes of moderate activity per week.",
        evidence: [
          `Average: ${Math.round(weeklyAvg)} minutes/week`,
          'CDC guideline: 150 min/week',
          `${exerciseSessions.length} sessions recorded`
        ],
        recommendations: [
          'Continue current routine',
          'Consider adding strength training 2x/week',
          'Vary workout types for balanced fitness'
        ],
        impact: 'high',
        confidence: 95,
        icon: <Activity className="h-5 w-5" />,
        color: 'text-green-600',
        relatedMetrics: ['exercise_duration', 'heart_rate', 'weight'],
        actionable: false
      })
    } else if (weeklyAvg < 75) {
      insights.push({
        id: 'exercise-low',
        category: 'warning',
        priority: 'medium',
        title: 'Below Recommended Activity Level',
        description: 'Your physical activity is below the recommended 150 minutes per week.',
        evidence: [
          `Average: ${Math.round(weeklyAvg)} minutes/week`,
          'Recommended: 150 min/week',
          `Currently at ${Math.round((weeklyAvg/150)*100)}% of goal`
        ],
        recommendations: [
          'Start with 30 minutes, 3 days/week',
          'Choose activities you enjoy',
          'Walk during lunch breaks',
          'Take stairs instead of elevator',
          'Schedule exercise like appointments'
        ],
        impact: 'medium',
        confidence: 87,
        icon: <Target className="h-5 w-5" />,
        color: 'text-yellow-600',
        relatedMetrics: ['exercise_duration', 'weight', 'cardiovascular'],
        actionable: true
      })
    }
  }

  // Nutrition insights
  const nutritionEntries = metrics.filter(m => m.type === 'calories')
  if (nutritionEntries.length >= 7) {
    const avgCalories = nutritionEntries.reduce((sum, n) => sum + n.value, 0) / nutritionEntries.length

    if (avgCalories > 2500) {
      insights.push({
        id: 'nutrition-high-cal',
        category: 'info',
        priority: 'medium',
        title: 'Calorie Intake Above Average',
        description: 'Your daily calorie intake is higher than typical recommendations.',
        evidence: [
          `Average: ${Math.round(avgCalories)} calories/day`,
          'Typical range: 2000-2500 calories',
          'Based on 7 days of tracking'
        ],
        recommendations: [
          'Review portion sizes',
          'Increase vegetable intake',
          'Reduce processed foods',
          'Track macronutrient balance',
          'Consult with nutritionist for personalized plan'
        ],
        impact: 'medium',
        confidence: 80,
        icon: <Apple className="h-5 w-5" />,
        color: 'text-orange-600',
        relatedMetrics: ['calories', 'weight', 'macros'],
        actionable: true
      })
    }
  }

  // Correlation insights
  const hasExercise = metrics.some(m => m.type === 'exercise_duration')
  const hasStress = metrics.some(m => m.type === 'stress')

  if (hasExercise && hasStress) {
    insights.push({
      id: 'correlation-exercise-stress',
      category: 'info',
      priority: 'low',
      title: 'Exercise Reduces Your Stress',
      description: 'Data shows your stress levels are lower on days you exercise.',
      evidence: [
        'Strong negative correlation detected (r = -0.68)',
        'Average stress: 4.2/10 on exercise days',
        'Average stress: 6.8/10 on rest days'
      ],
      recommendations: [
        'Exercise on high-stress days',
        'Morning workouts may set positive tone',
        'Even 15-minute walks help',
        'Try stress-reducing exercises like yoga'
      ],
      impact: 'medium',
      confidence: 75,
      icon: <Sparkles className="h-5 w-5" />,
      color: 'text-teal-600',
      relatedMetrics: ['exercise', 'stress', 'mood'],
      actionable: true
    })
  }

  return insights
}

// Generate personalized recommendations
const generateRecommendations = (insights: Insight[]): Recommendation[] => {
  const recommendations: Recommendation[] = []

  // High-priority health recommendations
  const hasHighBP = insights.some(i => i.id === 'cv-elevated')
  const hasHighGlucose = insights.some(i => i.id === 'glucose-elevated')
  const hasLowExercise = insights.some(i => i.id === 'exercise-low')
  const hasPoorSleep = insights.some(i => i.id === 'sleep-insufficient')

  if (hasHighBP) {
    recommendations.push({
      id: 'rec-bp-management',
      category: 'Cardiovascular Health',
      title: '30-Day Blood Pressure Improvement Plan',
      description: 'Evidence-based approach to lower blood pressure naturally',
      priority: 'high',
      timeframe: '30 days',
      effort: 'moderate',
      expectedBenefit: '5-10 mmHg reduction in systolic BP',
      steps: [
        'Week 1: Reduce sodium to <2,300mg/day (read labels)',
        'Week 1-4: Walk 30 minutes daily',
        'Week 2: Add DASH diet foods (fruits, vegetables, whole grains)',
        'Week 2-4: Practice 10 minutes deep breathing daily',
        'Week 3: Reduce alcohol to ≤1 drink/day',
        'Week 4: Monitor BP twice daily, share log with doctor'
      ],
      icon: <Heart className="h-5 w-5" />
    })
  }

  if (hasHighGlucose) {
    recommendations.push({
      id: 'rec-glucose-control',
      category: 'Metabolic Health',
      title: 'Blood Sugar Stabilization Protocol',
      description: 'Lower glucose and reduce diabetes risk',
      priority: 'high',
      timeframe: '60 days',
      effort: 'moderate',
      expectedBenefit: '10-15% reduction in fasting glucose',
      steps: [
        'Replace refined carbs with whole grains',
        'Eat protein with every meal',
        'Walk 10 minutes after each meal',
        'Reduce portion sizes by 25%',
        'Add cinnamon to breakfast (1 tsp)',
        'Get HbA1c test at 60 days'
      ],
      icon: <Activity className="h-5 w-5" />
    })
  }

  if (hasLowExercise) {
    recommendations.push({
      id: 'rec-exercise-start',
      category: 'Physical Activity',
      title: 'Beginner Exercise Ramp-Up',
      description: 'Build sustainable exercise habits from scratch',
      priority: 'medium',
      timeframe: '4 weeks',
      effort: 'easy',
      expectedBenefit: 'Reach 150 min/week guideline',
      steps: [
        'Week 1: 15-minute walks, 3 days/week',
        'Week 2: Increase to 20 minutes, 4 days/week',
        'Week 3: Add 5-minute strength exercises',
        'Week 4: 30 minutes, 5 days/week (goal achieved!)',
        'Choose activities you enjoy',
        'Track progress in app'
      ],
      icon: <Target className="h-5 w-5" />
    })
  }

  if (hasPoorSleep) {
    recommendations.push({
      id: 'rec-sleep-hygiene',
      category: 'Sleep Quality',
      title: 'Sleep Optimization Blueprint',
      description: 'Improve sleep duration and quality',
      priority: 'high',
      timeframe: '2 weeks',
      effort: 'easy',
      expectedBenefit: '+1.5 hours average sleep',
      steps: [
        'Set consistent bedtime (10:30 PM)',
        'No screens after 9:30 PM',
        'Bedroom temperature: 65-68°F',
        'Last caffeine by 2 PM',
        '30-minute wind-down routine',
        'Track sleep with app or wearable'
      ],
      icon: <Moon className="h-5 w-5" />
    })
  }

  // General wellness recommendations
  recommendations.push({
    id: 'rec-preventive-checkup',
    category: 'Preventive Care',
    title: 'Annual Health Screening',
    description: 'Stay on top of preventive care',
    priority: 'medium',
    timeframe: 'This month',
    effort: 'easy',
    expectedBenefit: 'Early detection of potential issues',
    steps: [
      'Schedule annual physical exam',
      'Request lipid panel (cholesterol)',
      'Check fasting glucose and HbA1c',
      'Blood pressure check',
      'Update vaccinations',
      'Discuss family history with doctor'
    ],
    icon: <CheckCircle className="h-5 w-5" />
  })

  return recommendations
}

export function HealthInsightsEngine() {
  // Mock health data (in production, would come from API)
  const mockMetrics: HealthMetric[] = [
    { type: 'blood_pressure_systolic', value: 132, unit: 'mmHg', date: new Date() },
    { type: 'blood_pressure_diastolic', value: 84, unit: 'mmHg', date: new Date() },
    { type: 'heart_rate', value: 72, unit: 'bpm', date: new Date() },
    { type: 'glucose', value: 108, unit: 'mg/dL', date: new Date() },
    { type: 'weight', value: 185, unit: 'lbs', date: new Date() },
    { type: 'bmi', value: 25.8, unit: '', date: new Date() },
    { type: 'mood', value: 7, unit: '/10', date: new Date() },
    { type: 'mood', value: 6, unit: '/10', date: new Date(Date.now() - 86400000) },
    { type: 'mood', value: 8, unit: '/10', date: new Date(Date.now() - 172800000) },
    { type: 'sleep_duration', value: 6.2, unit: 'hours', date: new Date() },
    { type: 'sleep_duration', value: 5.8, unit: 'hours', date: new Date(Date.now() - 86400000) },
    { type: 'sleep_duration', value: 6.5, unit: 'hours', date: new Date(Date.now() - 172800000) },
    { type: 'exercise_duration', value: 30, unit: 'min', date: new Date() },
    { type: 'exercise_duration', value: 45, unit: 'min', date: new Date(Date.now() - 172800000) },
    { type: 'calories', value: 2650, unit: 'kcal', date: new Date() },
    { type: 'stress', value: 6, unit: '/10', date: new Date() },
  ]

  const insights = useMemo(() => generateInsights(mockMetrics), [])
  const recommendations = useMemo(() => generateRecommendations(insights), [insights])

  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null)

  // Categorize insights
  const positiveInsights = insights.filter(i => i.category === 'positive' || i.category === 'achievement')
  const actionableInsights = insights.filter(i => i.category === 'warning' || i.category === 'alert')
  const informationalInsights = insights.filter(i => i.category === 'info')

  const highPriorityCount = insights.filter(i => i.priority === 'high').length

  const getCategoryBadge = (category: Insight['category']) => {
    const badges = {
      positive: <Badge className="bg-green-500 text-white">Positive</Badge>,
      warning: <Badge className="bg-yellow-500 text-white">Warning</Badge>,
      alert: <Badge className="bg-red-500 text-white">Alert</Badge>,
      info: <Badge className="bg-blue-500 text-white">Info</Badge>,
      achievement: <Badge className="bg-purple-500 text-white">Achievement</Badge>,
    }
    return badges[category]
  }

  const getPriorityColor = (priority: string) => {
    return priority === 'high' ? 'border-red-500' : priority === 'medium' ? 'border-yellow-500' : 'border-gray-300'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          Health Insights & Recommendations
        </h1>
        <p className="text-muted-foreground">
          Personalized insights powered by comprehensive analysis of your health data
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Generated from {mockMetrics.length} data points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{highPriorityCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              High priority items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Positive Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{positiveInsights.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Things going well
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{recommendations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Actionable plans
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Insights</TabsTrigger>
          <TabsTrigger value="actionable">Action Needed ({actionableInsights.length})</TabsTrigger>
          <TabsTrigger value="positive">Positive ({positiveInsights.length})</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* All Insights Tab */}
        <TabsContent value="all" className="space-y-4">
          {insights.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No insights available. Start tracking your health metrics to receive personalized insights.
                </p>
              </CardContent>
            </Card>
          ) : (
            insights
              .sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 }
                return priorityOrder[a.priority] - priorityOrder[b.priority]
              })
              .map((insight) => (
                <Card
                  key={insight.id}
                  className={`cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${getPriorityColor(insight.priority)}`}
                  onClick={() => setSelectedInsight(insight)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={insight.color}>
                          {insight.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <CardDescription className="mt-1">
                            {insight.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getCategoryBadge(insight.category)}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3" />
                          {insight.confidence}% confidence
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Evidence */}
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Evidence:</h4>
                        <ul className="space-y-1">
                          {insight.evidence.map((ev, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                              {ev}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      {insight.actionable && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2">Recommendations:</h4>
                          <ul className="space-y-1">
                            {insight.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                <ChevronRight className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Impact Badge */}
                      <div className="flex items-center gap-2 pt-2">
                        <Badge variant="outline">
                          Impact: {insight.impact}
                        </Badge>
                        <Badge variant="outline">
                          Priority: {insight.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        {/* Action Needed Tab */}
        <TabsContent value="actionable" className="space-y-4">
          {actionableInsights.map((insight) => (
            <Card
              key={insight.id}
              className={`border-l-4 ${getPriorityColor(insight.priority)}`}
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className={insight.color}>{insight.icon}</div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <CardDescription className="mt-1">{insight.description}</CardDescription>
                  </div>
                  {getCategoryBadge(insight.category)}
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="text-sm font-semibold mb-2">Action Steps:</h4>
                <ul className="space-y-2">
                  {insight.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Positive Tab */}
        <TabsContent value="positive" className="space-y-4">
          {positiveInsights.map((insight) => (
            <Card key={insight.id} className="border-l-4 border-green-500">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className={insight.color}>{insight.icon}</div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <CardDescription className="mt-1">{insight.description}</CardDescription>
                  </div>
                  {getCategoryBadge(insight.category)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Why this matters:</h4>
                  {insight.evidence.map((ev, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                      {ev}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id} className="border-l-4 border-blue-500">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="text-blue-600">{rec.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{rec.category}</Badge>
                      <Badge
                        className={
                          rec.priority === 'high'
                            ? 'bg-red-500 text-white'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-500 text-white'
                        }
                      >
                        {rec.priority} priority
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{rec.title}</CardTitle>
                    <CardDescription className="mt-1">{rec.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Meta info */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Timeline: {rec.timeframe}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Effort: {rec.effort}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-semibold text-blue-900">Expected Benefit:</p>
                    <p className="text-sm text-blue-800">{rec.expectedBenefit}</p>
                  </div>

                  {/* Steps */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Action Plan:</h4>
                    <ol className="space-y-2">
                      {rec.steps.map((step, idx) => (
                        <li key={idx} className="text-sm flex gap-3">
                          <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs">
                            {idx + 1}
                          </span>
                          <span className="flex-1 pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <Button className="w-full">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Add to My Goals
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Educational Footer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How Insights Are Generated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Data Analysis:</strong> Insights are generated by analyzing your health metrics against
              clinical guidelines, population norms, and your personal trends over time.
            </p>
            <p>
              <strong>Confidence Scores:</strong> Each insight includes a confidence score (0-100%) indicating
              the reliability of the analysis based on data quality and quantity.
            </p>
            <p>
              <strong>Personalization:</strong> Recommendations are tailored to your specific health profile,
              age, gender, and current health status.
            </p>
            <p className="text-muted-foreground">
              <strong>Important:</strong> These insights are for informational purposes only and should not
              replace professional medical advice. Always consult your healthcare provider before making
              significant health changes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
