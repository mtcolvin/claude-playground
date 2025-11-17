/**
 * Phase 16: Mental Health Tracking Dashboard
 */

'use client'

import { useState, useEffect } from 'react'
import { MultiMetricChart } from './charts/multi-metric-chart'

interface MoodEntry {
  id: string
  date: string
  mood: number // 1-10 scale
  anxiety: number // 1-10 scale
  stress: number // 1-10 scale
  sleep_quality?: number // 1-10 scale
  energy?: number // 1-10 scale
  notes?: string
  activities?: string[]
  triggers?: string[]
}

export function MentalHealthDashboard() {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEntry, setNewEntry] = useState({
    mood: 5,
    anxiety: 5,
    stress: 5,
    sleep_quality: 5,
    energy: 5,
    notes: '',
    activities: [] as string[],
    triggers: [] as string[],
  })

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      const response = await fetch('/api/v1/mood-entries?sortBy=date&sortOrder=desc&limit=90')
      const data = await response.json()
      if (data.success) {
        setEntries(data.data)
      }
    } catch (error) {
      console.error('Failed to load mood entries:', error)
    }
  }

  const addEntry = async () => {
    try {
      const response = await fetch('/api/v1/mood-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEntry,
          date: new Date().toISOString(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        setEntries([data.data, ...entries])
        setShowAddModal(false)
        setNewEntry({
          mood: 5,
          anxiety: 5,
          stress: 5,
          sleep_quality: 5,
          energy: 5,
          notes: '',
          activities: [],
          triggers: [],
        })
      }
    } catch (error) {
      console.error('Failed to add entry:', error)
    }
  }

  const getMoodEmoji = (mood: number): string => {
    if (mood <= 2) return '😢'
    if (mood <= 4) return '😟'
    if (mood <= 6) return '😐'
    if (mood <= 8) return '🙂'
    return '😄'
  }

  const getMoodColor = (mood: number): string => {
    if (mood <= 3) return 'text-red-600'
    if (mood <= 5) return 'text-orange-600'
    if (mood <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getMoodLabel = (mood: number): string => {
    if (mood <= 2) return 'Very Low'
    if (mood <= 4) return 'Low'
    if (mood <= 6) return 'Moderate'
    if (mood <= 8) return 'Good'
    return 'Excellent'
  }

  const getAnxietyColor = (anxiety: number): string => {
    if (anxiety >= 8) return 'text-red-600'
    if (anxiety >= 6) return 'text-orange-600'
    if (anxiety >= 4) return 'text-yellow-600'
    return 'text-green-600'
  }

  // Calculate averages for selected period
  const now = new Date()
  const periodDays = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365
  const periodEntries = entries.filter(e => {
    const entryDate = new Date(e.date)
    const daysDiff = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= periodDays
  })

  const avgMood = periodEntries.length > 0
    ? periodEntries.reduce((sum, e) => sum + e.mood, 0) / periodEntries.length
    : 0

  const avgAnxiety = periodEntries.length > 0
    ? periodEntries.reduce((sum, e) => sum + e.anxiety, 0) / periodEntries.length
    : 0

  const avgStress = periodEntries.length > 0
    ? periodEntries.reduce((sum, e) => sum + e.stress, 0) / periodEntries.length
    : 0

  const avgSleep = periodEntries.length > 0 && periodEntries.some(e => e.sleep_quality)
    ? periodEntries.filter(e => e.sleep_quality).reduce((sum, e) => sum + (e.sleep_quality || 0), 0) /
      periodEntries.filter(e => e.sleep_quality).length
    : 0

  const ACTIVITY_OPTIONS = [
    'Exercise', 'Meditation', 'Therapy', 'Socializing', 'Hobbies',
    'Work', 'Reading', 'Music', 'Nature', 'Rest'
  ]

  const TRIGGER_OPTIONS = [
    'Work Stress', 'Relationship', 'Health', 'Financial', 'Sleep Issues',
    'Social', 'News/Media', 'Weather', 'Physical Pain', 'Other'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Mental Health</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log Mood
        </button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'year'] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg capitalize ${
              selectedPeriod === period
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Mood */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-green-100 text-sm font-medium">Average Mood</div>
              <div className="text-3xl font-bold mt-1">{avgMood.toFixed(1)}/10</div>
              <div className="text-green-100 text-sm mt-1">{getMoodLabel(avgMood)}</div>
            </div>
            <div className="text-5xl">{getMoodEmoji(avgMood)}</div>
          </div>
        </div>

        {/* Average Anxiety */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-orange-100 text-sm font-medium">Average Anxiety</div>
              <div className="text-3xl font-bold mt-1">{avgAnxiety.toFixed(1)}/10</div>
              <div className="text-orange-100 text-sm mt-1">
                {avgAnxiety <= 3 ? 'Low' : avgAnxiety <= 6 ? 'Moderate' : 'High'}
              </div>
            </div>
            <div className="text-5xl">😰</div>
          </div>
        </div>

        {/* Average Stress */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-red-100 text-sm font-medium">Average Stress</div>
              <div className="text-3xl font-bold mt-1">{avgStress.toFixed(1)}/10</div>
              <div className="text-red-100 text-sm mt-1">
                {avgStress <= 3 ? 'Low' : avgStress <= 6 ? 'Moderate' : 'High'}
              </div>
            </div>
            <div className="text-5xl">😣</div>
          </div>
        </div>

        {/* Average Sleep Quality */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-purple-100 text-sm font-medium">Sleep Quality</div>
              <div className="text-3xl font-bold mt-1">
                {avgSleep > 0 ? `${avgSleep.toFixed(1)}/10` : 'N/A'}
              </div>
              <div className="text-purple-100 text-sm mt-1">
                {avgSleep === 0 ? 'No data' : avgSleep <= 5 ? 'Poor' : avgSleep <= 7 ? 'Fair' : 'Good'}
              </div>
            </div>
            <div className="text-5xl">😴</div>
          </div>
        </div>
      </div>

      {/* Mood Trend Visualization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Mood Trends</h2>
        {periodEntries.length > 0 ? (
          <MultiMetricChart
            data={periodEntries}
            metrics={[
              { dataKey: 'mood', name: 'Mood', color: '#10b981', unit: '/10' },
              { dataKey: 'anxiety', name: 'Anxiety', color: '#f59e0b', unit: '/10' },
              { dataKey: 'stress', name: 'Stress', color: '#ef4444', unit: '/10' },
            ]}
            height={320}
          />
        ) : (
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-700">
            No mood data to display. Start logging your mood to see trends!
          </div>
        )}
      </div>

      {/* Recent Entries */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Entries</h2>
        </div>
        <div className="divide-y">
          {periodEntries.slice(0, 10).map((entry) => (
            <div key={entry.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{getMoodEmoji(entry.mood)}</div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-gray-700">
                        {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                    <div>
                      <div className="text-xs text-gray-700">Mood</div>
                      <div className={`text-lg font-bold ${getMoodColor(entry.mood)}`}>
                        {entry.mood}/10
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-700">Anxiety</div>
                      <div className={`text-lg font-bold ${getAnxietyColor(entry.anxiety)}`}>
                        {entry.anxiety}/10
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-700">Stress</div>
                      <div className={`text-lg font-bold ${getAnxietyColor(entry.stress)}`}>
                        {entry.stress}/10
                      </div>
                    </div>
                    {entry.sleep_quality && (
                      <div>
                        <div className="text-xs text-gray-700">Sleep</div>
                        <div className={`text-lg font-bold ${getMoodColor(entry.sleep_quality)}`}>
                          {entry.sleep_quality}/10
                        </div>
                      </div>
                    )}
                    {entry.energy && (
                      <div>
                        <div className="text-xs text-gray-700">Energy</div>
                        <div className={`text-lg font-bold ${getMoodColor(entry.energy)}`}>
                          {entry.energy}/10
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Activities */}
                  {entry.activities && entry.activities.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-700 mb-1">Activities:</div>
                      <div className="flex flex-wrap gap-1">
                        {entry.activities.map((activity, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Triggers */}
                  {entry.triggers && entry.triggers.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-700 mb-1">Triggers:</div>
                      <div className="flex flex-wrap gap-1">
                        {entry.triggers.map((trigger, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                            {trigger}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {entry.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      {entry.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {periodEntries.length === 0 && (
            <div className="p-12 text-center text-gray-700">
              No entries for this period. Start tracking your mental health today!
            </div>
          )}
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-6">
              <h2 className="text-2xl font-bold text-gray-900">Log Your Mood</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Mood Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood: {newEntry.mood}/10 {getMoodEmoji(newEntry.mood)} {getMoodLabel(newEntry.mood)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newEntry.mood}
                  onChange={(e) => setNewEntry({ ...newEntry, mood: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Anxiety Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anxiety: {newEntry.anxiety}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newEntry.anxiety}
                  onChange={(e) => setNewEntry({ ...newEntry, anxiety: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Stress Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stress: {newEntry.stress}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newEntry.stress}
                  onChange={(e) => setNewEntry({ ...newEntry, stress: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Sleep Quality Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Quality: {newEntry.sleep_quality}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newEntry.sleep_quality}
                  onChange={(e) => setNewEntry({ ...newEntry, sleep_quality: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Energy Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Energy Level: {newEntry.energy}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newEntry.energy}
                  onChange={(e) => setNewEntry({ ...newEntry, energy: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Activities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activities Today
                </label>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_OPTIONS.map((activity) => (
                    <button
                      key={activity}
                      onClick={() => {
                        const current = newEntry.activities
                        setNewEntry({
                          ...newEntry,
                          activities: current.includes(activity)
                            ? current.filter(a => a !== activity)
                            : [...current, activity]
                        })
                      }}
                      className={`px-3 py-1 rounded text-sm ${
                        newEntry.activities.includes(activity)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Triggers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Triggers or Stressors
                </label>
                <div className="flex flex-wrap gap-2">
                  {TRIGGER_OPTIONS.map((trigger) => (
                    <button
                      key={trigger}
                      onClick={() => {
                        const current = newEntry.triggers
                        setNewEntry({
                          ...newEntry,
                          triggers: current.includes(trigger)
                            ? current.filter(t => t !== trigger)
                            : [...current, trigger]
                        })
                      }}
                      className={`px-3 py-1 rounded text-sm ${
                        newEntry.triggers.includes(trigger)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {trigger}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How are you feeling? Any thoughts to capture?"
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
                onClick={addEntry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
