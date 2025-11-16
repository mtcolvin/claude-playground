/**
 * Phase 19: Sleep Analysis Dashboard
 */

'use client'

import { useState, useEffect } from 'react'
import { MultiMetricChart } from './charts/multi-metric-chart'

interface SleepSession {
  id: string
  date: string
  bedTime: string
  wakeTime: string
  totalDuration: number // minutes
  deepSleep?: number // minutes
  lightSleep?: number // minutes
  remSleep?: number // minutes
  awakeTime?: number // minutes
  quality: number // 1-10 scale
  sleepLatency?: number // minutes to fall asleep
  interruptions?: number
  restfulness: number // 1-10 scale
  notes?: string
  factors?: string[]
}

interface SleepStats {
  avgDuration: number
  avgQuality: number
  avgRestfulness: number
  totalSessions: number
  avgBedtime: string
  avgWakeTime: string
}

export function SleepTracker() {
  const [sessions, setSessions] = useState<SleepSession[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0],
    bedTime: '22:00',
    wakeTime: '07:00',
    quality: 7,
    restfulness: 7,
    sleepLatency: 15,
    interruptions: 0,
    deepSleep: 0,
    lightSleep: 0,
    remSleep: 0,
    awakeTime: 0,
    notes: '',
    factors: [] as string[],
  })

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/v1/sleep-sessions?sortBy=date&sortOrder=desc&limit=90')
      const data = await response.json()
      if (data.success) {
        setSessions(data.data)
      }
    } catch (error) {
      console.error('Failed to load sleep sessions:', error)
    }
  }

  const calculateDuration = (bedTime: string, wakeTime: string, date: string): number => {
    const bed = new Date(`${date}T${bedTime}`)
    let wake = new Date(`${date}T${wakeTime}`)

    // If wake time is earlier than bed time, add a day
    if (wake <= bed) {
      wake = new Date(wake.getTime() + 24 * 60 * 60 * 1000)
    }

    return Math.round((wake.getTime() - bed.getTime()) / (1000 * 60))
  }

  const addSession = async () => {
    const duration = calculateDuration(newSession.bedTime, newSession.wakeTime, newSession.date)

    try {
      const response = await fetch('/api/v1/sleep-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date(newSession.date).toISOString(),
          bedTime: newSession.bedTime,
          wakeTime: newSession.wakeTime,
          totalDuration: duration,
          deepSleep: newSession.deepSleep || undefined,
          lightSleep: newSession.lightSleep || undefined,
          remSleep: newSession.remSleep || undefined,
          awakeTime: newSession.awakeTime || undefined,
          quality: newSession.quality,
          restfulness: newSession.restfulness,
          sleepLatency: newSession.sleepLatency || undefined,
          interruptions: newSession.interruptions || undefined,
          notes: newSession.notes || undefined,
          factors: newSession.factors.length > 0 ? newSession.factors : undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSessions([data.data, ...sessions])
        setShowAddModal(false)
        setNewSession({
          date: new Date().toISOString().split('T')[0],
          bedTime: '22:00',
          wakeTime: '07:00',
          quality: 7,
          restfulness: 7,
          sleepLatency: 15,
          interruptions: 0,
          deepSleep: 0,
          lightSleep: 0,
          remSleep: 0,
          awakeTime: 0,
          notes: '',
          factors: [],
        })
      }
    } catch (error) {
      console.error('Failed to add session:', error)
    }
  }

  const getQualityEmoji = (quality: number): string => {
    if (quality <= 3) return '😴'
    if (quality <= 5) return '😪'
    if (quality <= 7) return '😌'
    return '😊'
  }

  const getQualityColor = (quality: number): string => {
    if (quality <= 3) return 'text-red-600'
    if (quality <= 5) return 'text-orange-600'
    if (quality <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getQualityLabel = (quality: number): string => {
    if (quality <= 3) return 'Poor'
    if (quality <= 5) return 'Fair'
    if (quality <= 7) return 'Good'
    return 'Excellent'
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  // Calculate stats for selected period
  const now = new Date()
  const periodDays = selectedPeriod === 'week' ? 7 : 30
  const periodSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date)
    const daysDiff = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= periodDays
  })

  const stats: SleepStats = {
    totalSessions: periodSessions.length,
    avgDuration: periodSessions.length > 0
      ? periodSessions.reduce((sum, s) => sum + s.totalDuration, 0) / periodSessions.length
      : 0,
    avgQuality: periodSessions.length > 0
      ? periodSessions.reduce((sum, s) => sum + s.quality, 0) / periodSessions.length
      : 0,
    avgRestfulness: periodSessions.length > 0
      ? periodSessions.reduce((sum, s) => sum + s.restfulness, 0) / periodSessions.length
      : 0,
    avgBedtime: '22:00', // Would calculate from actual data
    avgWakeTime: '07:00', // Would calculate from actual data
  }

  const SLEEP_FACTORS = [
    'Caffeine', 'Alcohol', 'Exercise', 'Stress', 'Screen Time',
    'Late Meal', 'Noise', 'Temperature', 'Medication', 'Nap'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Sleep Tracker</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log Sleep
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(['week', 'month'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg capitalize ${
              selectedPeriod === period
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This {period}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Duration */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-purple-100 text-sm font-medium">Avg Sleep</div>
              <div className="text-3xl font-bold mt-1">{formatDuration(Math.round(stats.avgDuration))}</div>
              <div className="text-purple-100 text-sm mt-1">Per night</div>
            </div>
            <div className="text-5xl">🌙</div>
          </div>
        </div>

        {/* Average Quality */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-blue-100 text-sm font-medium">Sleep Quality</div>
              <div className="text-3xl font-bold mt-1">{stats.avgQuality.toFixed(1)}/10</div>
              <div className="text-blue-100 text-sm mt-1">{getQualityLabel(stats.avgQuality)}</div>
            </div>
            <div className="text-5xl">{getQualityEmoji(stats.avgQuality)}</div>
          </div>
        </div>

        {/* Average Restfulness */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-100 text-sm font-medium">Restfulness</div>
              <div className="text-3xl font-bold mt-1">{stats.avgRestfulness.toFixed(1)}/10</div>
              <div className="text-green-100 text-sm mt-1">How rested</div>
            </div>
            <div className="text-5xl">✨</div>
          </div>
        </div>

        {/* Sleep Goal */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-indigo-100 text-sm font-medium">Goal Progress</div>
              <div className="text-3xl font-bold mt-1">
                {Math.round((stats.avgDuration / 480) * 100)}%
              </div>
              <div className="text-indigo-100 text-sm mt-1">8h target</div>
            </div>
            <div className="text-5xl">🎯</div>
          </div>
        </div>
      </div>

      {/* Sleep Pattern Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sleep Pattern</h2>
        {periodSessions.length > 0 ? (
          <MultiMetricChart
            data={periodSessions.map(s => ({
              date: s.date,
              duration: s.totalDuration / 60, // Convert to hours
              quality: s.quality,
            }))}
            metrics={[
              { dataKey: 'duration', name: 'Duration (hours)', color: '#8b5cf6', unit: 'h' },
              { dataKey: 'quality', name: 'Quality', color: '#3b82f6', unit: '/10' },
            ]}
            height={320}
          />
        ) : (
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
            No sleep data yet. Log your first sleep session to see patterns!
          </div>
        )}
      </div>

      {/* Sleep Stages Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sleep Stages Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Deep Sleep', color: 'bg-purple-500', icon: '💤' },
            { label: 'Light Sleep', color: 'bg-blue-400', icon: '😴' },
            { label: 'REM Sleep', color: 'bg-indigo-500', icon: '💭' },
            { label: 'Awake', color: 'bg-yellow-400', icon: '👁️' },
          ].map((stage) => (
            <div key={stage.label} className="text-center">
              <div className={`${stage.color} rounded-lg p-4 text-white mb-2`}>
                <div className="text-3xl mb-1">{stage.icon}</div>
                <div className="text-sm font-medium">{stage.label}</div>
                <div className="text-2xl font-bold mt-1">--</div>
                <div className="text-xs opacity-90">Average</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sleep Sessions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Sleep History</h2>

        {periodSessions.map((session) => (
          <div key={session.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{getQualityEmoji(session.quality)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {session.bedTime} - {session.wakeTime}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="font-semibold text-gray-900">
                      {formatDuration(session.totalDuration)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Quality</div>
                    <div className={`font-semibold ${getQualityColor(session.quality)}`}>
                      {session.quality}/10
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Restfulness</div>
                    <div className={`font-semibold ${getQualityColor(session.restfulness)}`}>
                      {session.restfulness}/10
                    </div>
                  </div>
                  {session.interruptions !== undefined && (
                    <div>
                      <div className="text-xs text-gray-500">Interruptions</div>
                      <div className="font-semibold text-gray-900">{session.interruptions}</div>
                    </div>
                  )}
                </div>

                {/* Sleep Stages */}
                {(session.deepSleep || session.lightSleep || session.remSleep || session.awakeTime) && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-2">Sleep Stages:</div>
                    <div className="grid grid-cols-4 gap-2">
                      {session.deepSleep && (
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="text-xs text-purple-700 font-medium">Deep</div>
                          <div className="text-sm font-bold text-purple-900">
                            {formatDuration(session.deepSleep)}
                          </div>
                        </div>
                      )}
                      {session.lightSleep && (
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="text-xs text-blue-700 font-medium">Light</div>
                          <div className="text-sm font-bold text-blue-900">
                            {formatDuration(session.lightSleep)}
                          </div>
                        </div>
                      )}
                      {session.remSleep && (
                        <div className="text-center p-2 bg-indigo-50 rounded">
                          <div className="text-xs text-indigo-700 font-medium">REM</div>
                          <div className="text-sm font-bold text-indigo-900">
                            {formatDuration(session.remSleep)}
                          </div>
                        </div>
                      )}
                      {session.awakeTime && (
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <div className="text-xs text-yellow-700 font-medium">Awake</div>
                          <div className="text-sm font-bold text-yellow-900">
                            {formatDuration(session.awakeTime)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Factors */}
                {session.factors && session.factors.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1">Factors:</div>
                    <div className="flex flex-wrap gap-1">
                      {session.factors.map((factor, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {session.notes && (
                  <div className="p-3 bg-gray-50 rounded text-sm text-gray-700">
                    {session.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {periodSessions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            No sleep data yet. Start tracking your sleep patterns today!
          </div>
        )}
      </div>

      {/* Add Sleep Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-6">
              <h2 className="text-2xl font-bold text-gray-900">Log Sleep Session</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newSession.date}
                  onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Bed Time & Wake Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bed Time</label>
                  <input
                    type="time"
                    value={newSession.bedTime}
                    onChange={(e) => setNewSession({ ...newSession, bedTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wake Time</label>
                  <input
                    type="time"
                    value={newSession.wakeTime}
                    onChange={(e) => setNewSession({ ...newSession, wakeTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Duration Preview */}
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-sm text-blue-700">Total Sleep Duration</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">
                  {formatDuration(calculateDuration(newSession.bedTime, newSession.wakeTime, newSession.date))}
                </div>
              </div>

              {/* Quality & Restfulness Sliders */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep Quality: {newSession.quality}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newSession.quality}
                    onChange={(e) => setNewSession({ ...newSession, quality: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restfulness: {newSession.restfulness}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newSession.restfulness}
                    onChange={(e) => setNewSession({ ...newSession, restfulness: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Sleep Latency & Interruptions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time to Fall Asleep (min)
                  </label>
                  <input
                    type="number"
                    value={newSession.sleepLatency}
                    onChange={(e) => setNewSession({ ...newSession, sleepLatency: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interruptions
                  </label>
                  <input
                    type="number"
                    value={newSession.interruptions}
                    onChange={(e) => setNewSession({ ...newSession, interruptions: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Factors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Factors Affecting Sleep
                </label>
                <div className="flex flex-wrap gap-2">
                  {SLEEP_FACTORS.map((factor) => (
                    <button
                      key={factor}
                      onClick={() => {
                        const current = newSession.factors
                        setNewSession({
                          ...newSession,
                          factors: current.includes(factor)
                            ? current.filter(f => f !== factor)
                            : [...current, factor]
                        })
                      }}
                      className={`px-3 py-1 rounded text-sm ${
                        newSession.factors.includes(factor)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {factor}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any dreams, sleep issues, or observations?"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addSession}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Sleep Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
