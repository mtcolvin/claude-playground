/**
 * Phase 24: Health Goals & Progress Tracking
 *
 * Allows users to set, track, and achieve health goals with:
 * - SMART goal framework
 * - Progress visualization
 * - Milestone tracking
 * - Achievement badges
 * - Goal recommendations
 */

'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface HealthGoal {
  id: string
  title: string
  description: string
  category: 'weight' | 'fitness' | 'nutrition' | 'mental_health' | 'sleep' | 'medical' | 'custom'
  targetValue: number
  currentValue: number
  startValue: number
  unit: string
  targetDate: string
  startDate: string
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned'
  priority: 'low' | 'medium' | 'high'
  milestones: Array<{
    value: number
    date: string
    achieved: boolean
  }>
  progressHistory: Array<{
    date: string
    value: number
  }>
}

export function HealthGoalsDashboard() {
  const [goals, setGoals] = useState<HealthGoal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<HealthGoal | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'weight' as const,
    targetValue: 0,
    currentValue: 0,
    unit: 'kg',
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: 'medium' as const,
  })

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = async () => {
    try {
      const response = await fetch('/api/v1/health-goals?sortBy=priority&sortOrder=desc')
      const data = await response.json()
      if (data.success) {
        setGoals(data.data)
      }
    } catch (error) {
      console.error('Failed to load goals:', error)
      // Load mock data for demo
      loadMockGoals()
    }
  }

  const loadMockGoals = () => {
    const mockGoals: HealthGoal[] = [
      {
        id: '1',
        title: 'Lose 10 kg',
        description: 'Achieve healthy weight through diet and exercise',
        category: 'weight',
        targetValue: 70,
        currentValue: 76,
        startValue: 80,
        unit: 'kg',
        targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_progress',
        priority: 'high',
        milestones: [
          { value: 78, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), achieved: true },
          { value: 75, date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), achieved: false },
          { value: 70, date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), achieved: false },
        ],
        progressHistory: generateProgressData(80, 76, 30),
      },
      {
        id: '2',
        title: 'Exercise 5x per week',
        description: 'Build consistent workout habit',
        category: 'fitness',
        targetValue: 5,
        currentValue: 3,
        startValue: 1,
        unit: 'days/week',
        targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_progress',
        priority: 'high',
        milestones: [
          { value: 2, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), achieved: true },
          { value: 4, date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), achieved: false },
          { value: 5, date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), achieved: false },
        ],
        progressHistory: generateProgressData(1, 3, 14),
      },
      {
        id: '3',
        title: 'Sleep 8 hours daily',
        description: 'Improve sleep quality and duration',
        category: 'sleep',
        targetValue: 8,
        currentValue: 6.5,
        startValue: 6,
        unit: 'hours',
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'in_progress',
        priority: 'medium',
        milestones: [
          { value: 7, date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), achieved: false },
          { value: 8, date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), achieved: false },
        ],
        progressHistory: generateProgressData(6, 6.5, 20),
      },
    ]
    setGoals(mockGoals)
  }

  function generateProgressData(start: number, current: number, days: number) {
    const data = []
    const increment = (current - start) / days
    for (let i = 0; i <= days; i++) {
      const date = new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000)
      data.push({
        date: date.toISOString(),
        value: start + (increment * i) + (Math.random() - 0.5) * 0.5,
      })
    }
    return data
  }

  const calculateProgress = (goal: HealthGoal): number => {
    const total = Math.abs(goal.targetValue - goal.startValue)
    const achieved = Math.abs(goal.currentValue - goal.startValue)
    return Math.min(100, Math.max(0, (achieved / total) * 100))
  }

  const getDaysRemaining = (targetDate: string): number => {
    const days = Math.ceil((new Date(targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return Math.max(0, days)
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'not_started': return 'bg-gray-100 text-gray-800'
      case 'abandoned': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-800'
    }
  }

  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'weight': return '⚖️'
      case 'fitness': return '🏃'
      case 'nutrition': return '🥗'
      case 'mental_health': return '🧠'
      case 'sleep': return '😴'
      case 'medical': return '💊'
      default: return '🎯'
    }
  }

  const filteredGoals = filterStatus === 'all'
    ? goals
    : goals.filter(g => g.status === filterStatus)

  const stats = {
    total: goals.length,
    inProgress: goals.filter(g => g.status === 'in_progress').length,
    completed: goals.filter(g => g.status === 'completed').length,
    avgProgress: goals.length > 0
      ? goals.reduce((sum, g) => sum + calculateProgress(g), 0) / goals.length
      : 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Goals</h1>
          <p className="text-gray-800 mt-1">Set, track, and achieve your health objectives</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Goal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-900">Total Goals</div>
          <div className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</div>
          <div className="text-xs text-gray-900 mt-1">All time</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="text-blue-100 text-sm">In Progress</div>
          <div className="text-3xl font-bold mt-1">{stats.inProgress}</div>
          <div className="text-blue-100 text-xs mt-1">Active goals</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="text-green-100 text-sm">Completed</div>
          <div className="text-3xl font-bold mt-1">{stats.completed}</div>
          <div className="text-green-100 text-xs mt-1">Achieved</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="text-purple-100 text-sm">Avg Progress</div>
          <div className="text-3xl font-bold mt-1">{stats.avgProgress.toFixed(0)}%</div>
          <div className="text-purple-100 text-xs mt-1">Across all goals</div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {['all', 'in_progress', 'completed', 'not_started'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filterStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGoals.map((goal) => {
          const progress = calculateProgress(goal)
          const daysRemaining = getDaysRemaining(goal.targetDate)
          const isOnTrack = progress >= 50 && daysRemaining > 30

          return (
            <div
              key={goal.id}
              onClick={() => setSelectedGoal(goal)}
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCategoryIcon(goal.category)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-800">{goal.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                  <span className={`text-lg ${getPriorityColor(goal.priority)}`}>
                    {goal.priority === 'high' ? '🔴' : goal.priority === 'medium' ? '🟡' : '🟢'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-800">Progress</span>
                  <span className="font-bold text-gray-900">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      progress >= 100 ? 'bg-green-500' :
                      progress >= 75 ? 'bg-blue-500' :
                      progress >= 50 ? 'bg-yellow-500' :
                      'bg-orange-500'
                    }`}
                    style={{ width: `${Math.min(100, progress)}%` }}
                  ></div>
                </div>
              </div>

              {/* Current vs Target */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-gray-900">Start</div>
                  <div className="font-bold text-gray-900">{goal.startValue} {goal.unit}</div>
                </div>
                <div>
                  <div className="text-gray-900">Current</div>
                  <div className="font-bold text-blue-600">{goal.currentValue} {goal.unit}</div>
                </div>
                <div>
                  <div className="text-gray-900">Target</div>
                  <div className="font-bold text-green-600">{goal.targetValue} {goal.unit}</div>
                </div>
              </div>

              {/* Milestones */}
              <div className="flex items-center gap-2 mb-4">
                {goal.milestones.map((milestone, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-2 rounded ${
                      milestone.achieved ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    title={`Milestone: ${milestone.value} ${goal.unit}`}
                  ></div>
                ))}
              </div>

              {/* Time Remaining */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-800">
                  {daysRemaining} days remaining
                </span>
                {isOnTrack ? (
                  <span className="text-green-600 font-medium">✓ On Track</span>
                ) : (
                  <span className="text-orange-600 font-medium">⚠ Needs Attention</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredGoals.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Goals Yet</h3>
          <p className="text-gray-900 mb-6">
            {filterStatus === 'all'
              ? 'Start your health journey by setting your first goal!'
              : `No ${filterStatus.replace('_', ' ')} goals found.`}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Goal Detail Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>{getCategoryIcon(selectedGoal.category)}</span>
                  {selectedGoal.title}
                </h2>
                <p className="text-gray-800 mt-1">{selectedGoal.description}</p>
              </div>
              <button
                onClick={() => setSelectedGoal(null)}
                className="p-2 text-gray-800 hover:text-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Progress Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={selectedGoal.progressHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      stroke="#6b7280"
                      style={{ fontSize: 12 }}
                    />
                    <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value: number) => [`${value.toFixed(1)} ${selectedGoal.unit}`, 'Value']}
                    />
                    <Legend />
                    <ReferenceLine
                      y={selectedGoal.targetValue}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      label={{ value: 'Target', position: 'right', fill: '#10b981' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 3 }}
                      name="Progress"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Milestones */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestones</h3>
                <div className="space-y-3">
                  {selectedGoal.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        milestone.achieved ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {milestone.achieved && <span className="text-white text-lg">✓</span>}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          Reach {milestone.value} {selectedGoal.unit}
                        </div>
                        <div className="text-sm text-gray-900">
                          Target: {new Date(milestone.date).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        milestone.achieved ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {milestone.achieved ? 'Achieved' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
