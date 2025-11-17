/**
 * Phase 20: Women's Health Features
 */

'use client'

import { useState, useEffect } from 'react'

interface MenstrualCycle {
  id: string
  startDate: string
  endDate?: string
  flowIntensity?: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'SPOTTING'
  symptoms?: string[]
  mood?: string[]
  painLevel?: number // 1-10
  notes?: string
}

interface PregnancyTracking {
  id: string
  dueDate: string
  lastPeriodDate: string
  currentWeek: number
  currentDay: number
  weight?: number
  bloodPressureSystolic?: number
  bloodPressureDiastolic?: number
  symptoms?: string[]
  appointments?: Array<{
    date: string
    type: string
    notes?: string
  }>
}

export function WomensHealthTracker() {
  const [cycles, setCycles] = useState<MenstrualCycle[]>([])
  const [pregnancy, setPregnancy] = useState<PregnancyTracking | null>(null)
  const [view, setView] = useState<'cycle' | 'pregnancy' | 'symptoms'>('cycle')
  const [showAddCycleModal, setShowAddCycleModal] = useState(false)
  const [newCycle, setNewCycle] = useState<{
    startDate: string
    endDate: string
    flowIntensity: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'SPOTTING'
    painLevel: number
    symptoms: string[]
    mood: string[]
    notes: string
  }>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    flowIntensity: 'MEDIUM',
    painLevel: 3,
    symptoms: [],
    mood: [],
    notes: '',
  })

  useEffect(() => {
    loadCycles()
    loadPregnancy()
  }, [])

  const loadCycles = async () => {
    try {
      const response = await fetch('/api/v1/menstrual-cycles?sortBy=startDate&sortOrder=desc&limit=12')
      const data = await response.json()
      if (data.success) {
        setCycles(data.data)
      }
    } catch (error) {
      console.error('Failed to load cycles:', error)
    }
  }

  const loadPregnancy = async () => {
    try {
      const response = await fetch('/api/v1/pregnancy-tracking')
      const data = await response.json()
      if (data.success && data.data.length > 0) {
        setPregnancy(data.data[0])
      }
    } catch (error) {
      console.error('Failed to load pregnancy data:', error)
    }
  }

  const addCycle = async () => {
    try {
      const response = await fetch('/api/v1/menstrual-cycles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCycle),
      })

      const data = await response.json()
      if (data.success) {
        setCycles([data.data, ...cycles])
        setShowAddCycleModal(false)
        setNewCycle({
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          flowIntensity: 'MEDIUM',
          painLevel: 3,
          symptoms: [],
          mood: [],
          notes: '',
        })
      }
    } catch (error) {
      console.error('Failed to add cycle:', error)
    }
  }

  const getFlowColor = (intensity: string): string => {
    switch (intensity) {
      case 'SPOTTING': return 'bg-pink-100 text-pink-800'
      case 'LIGHT': return 'bg-red-100 text-red-700'
      case 'MEDIUM': return 'bg-red-200 text-red-800'
      case 'HEAVY': return 'bg-red-300 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateCycleLength = (startDate: string, endDate: string): number => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }

  const predictNextPeriod = (): string => {
    if (cycles.length < 2) return 'Not enough data'

    // Calculate average cycle length from recent cycles
    const completeCycles = cycles.filter(c => c.endDate)
    if (completeCycles.length === 0) return 'Not enough data'

    const cycleLengths = []
    for (let i = 0; i < completeCycles.length - 1; i++) {
      const start1 = new Date(completeCycles[i].startDate)
      const start2 = new Date(completeCycles[i + 1].startDate)
      const length = Math.round((start1.getTime() - start2.getTime()) / (1000 * 60 * 60 * 24))
      cycleLengths.push(length)
    }

    const avgLength = cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length
    const lastCycleStart = new Date(cycles[0].startDate)
    const nextPeriod = new Date(lastCycleStart.getTime() + avgLength * 24 * 60 * 60 * 1000)

    return nextPeriod.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const SYMPTOMS = [
    'Cramps', 'Bloating', 'Headache', 'Fatigue', 'Breast Tenderness',
    'Nausea', 'Back Pain', 'Acne', 'Food Cravings', 'Insomnia'
  ]

  const MOODS = [
    'Happy', 'Sad', 'Irritable', 'Anxious', 'Energetic',
    'Calm', 'Stressed', 'Emotional', 'Focused', 'Tired'
  ]

  const PREGNANCY_SYMPTOMS = [
    'Nausea', 'Fatigue', 'Breast Tenderness', 'Frequent Urination',
    'Food Aversions', 'Heartburn', 'Back Pain', 'Swelling', 'Constipation'
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Women's Health</h1>
        <button
          onClick={() => setShowAddCycleModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log Period
        </button>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'cycle', label: 'Cycle Tracking', icon: '🌸' },
          { id: 'pregnancy', label: 'Pregnancy', icon: '🤰' },
          { id: 'symptoms', label: 'Symptoms', icon: '📊' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as any)}
            className={`px-4 py-2 font-medium flex items-center gap-2 ${
              view === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-700 hover:text-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Cycle Tracking View */}
      {view === 'cycle' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Next Period Prediction */}
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg shadow p-6 text-white">
              <div className="text-pink-100 text-sm font-medium">Next Period</div>
              <div className="text-3xl font-bold mt-1">{predictNextPeriod()}</div>
              <div className="text-pink-100 text-sm mt-1">Predicted</div>
            </div>

            {/* Average Cycle */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
              <div className="text-purple-100 text-sm font-medium">Avg Cycle</div>
              <div className="text-3xl font-bold mt-1">
                {cycles.length >= 2 ? '28' : '--'} days
              </div>
              <div className="text-purple-100 text-sm mt-1">Last 3 months</div>
            </div>

            {/* Period Length */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
              <div className="text-red-100 text-sm font-medium">Avg Period</div>
              <div className="text-3xl font-bold mt-1">
                {cycles.filter(c => c.endDate).length > 0 ? '5' : '--'} days
              </div>
              <div className="text-red-100 text-sm mt-1">Duration</div>
            </div>
          </div>

          {/* Calendar Placeholder */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cycle Calendar</h2>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-700">
              Interactive calendar showing periods, ovulation, and fertile window would render here
              <br />
              (Full calendar will be enhanced in Phase 21)
            </div>
          </div>

          {/* Recent Cycles */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Cycle History</h2>

            {cycles.map((cycle) => {
              const duration = cycle.endDate
                ? calculateCycleLength(cycle.startDate, cycle.endDate)
                : null

              return (
                <div key={cycle.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🌸</span>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {new Date(cycle.startDate).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            {cycle.endDate && ` - ${new Date(cycle.endDate).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric'
                            })}`}
                          </div>
                          {duration && (
                            <div className="text-sm text-gray-700">{duration} days duration</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {cycle.flowIntensity && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getFlowColor(cycle.flowIntensity)}`}>
                        {cycle.flowIntensity}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  {cycle.painLevel && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-700 mb-1">Pain Level</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${(cycle.painLevel / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {cycle.painLevel}/10
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Symptoms */}
                  {cycle.symptoms && cycle.symptoms.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-700 mb-1">Symptoms</div>
                      <div className="flex flex-wrap gap-1">
                        {cycle.symptoms.map((symptom, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mood */}
                  {cycle.mood && cycle.mood.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-700 mb-1">Mood</div>
                      <div className="flex flex-wrap gap-1">
                        {cycle.mood.map((mood, idx) => (
                          <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                            {mood}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {cycle.notes && (
                    <div className="p-3 bg-gray-50 rounded text-sm text-gray-700">
                      {cycle.notes}
                    </div>
                  )}
                </div>
              )
            })}

            {cycles.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center text-gray-700">
                Start tracking your menstrual cycle today
              </div>
            )}
          </div>
        </>
      )}

      {/* Pregnancy View */}
      {view === 'pregnancy' && (
        <>
          {pregnancy ? (
            <>
              {/* Pregnancy Overview Card */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow p-8 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Week {pregnancy.currentWeek}</h2>
                    <div className="text-blue-100 text-lg">Day {pregnancy.currentDay}</div>
                    <div className="mt-4 text-blue-100">
                      Due Date: {new Date(pregnancy.dueDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="text-6xl">🤰</div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Pregnancy Progress</span>
                    <span>{Math.round((pregnancy.currentWeek / 40) * 100)}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                    <div
                      className="bg-white rounded-full h-3"
                      style={{ width: `${(pregnancy.currentWeek / 40) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Pregnancy Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pregnancy.weight && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-700">Weight</div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                      {pregnancy.weight} kg
                    </div>
                  </div>
                )}
                {pregnancy.bloodPressureSystolic && pregnancy.bloodPressureDiastolic && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-700">Blood Pressure</div>
                    <div className="text-3xl font-bold text-gray-900 mt-1">
                      {pregnancy.bloodPressureSystolic}/{pregnancy.bloodPressureDiastolic}
                    </div>
                  </div>
                )}
              </div>

              {/* Symptoms */}
              {pregnancy.symptoms && pregnancy.symptoms.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Symptoms</h3>
                  <div className="flex flex-wrap gap-2">
                    {pregnancy.symptoms.map((symptom, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Appointments */}
              {pregnancy.appointments && pregnancy.appointments.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h3>
                  <div className="space-y-3">
                    {pregnancy.appointments.map((apt, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium text-gray-900">{apt.type}</div>
                          <div className="text-sm text-gray-700">
                            {new Date(apt.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">🤰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Track Your Pregnancy
              </h3>
              <p className="text-gray-700 mb-6">
                Monitor your pregnancy journey with personalized insights
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Start Pregnancy Tracking
              </button>
            </div>
          )}
        </>
      )}

      {/* Symptoms View */}
      {view === 'symptoms' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Symptom Analysis</h2>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-700">
            Charts showing symptom patterns across menstrual cycle would render here
            <br />
            (Will be implemented with Recharts in Phase 21)
          </div>
        </div>
      )}

      {/* Add Cycle Modal */}
      {showAddCycleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-6">
              <h2 className="text-2xl font-bold text-gray-900">Log Period</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newCycle.startDate}
                    onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newCycle.endDate}
                    onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Flow Intensity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Flow Intensity</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['SPOTTING', 'LIGHT', 'MEDIUM', 'HEAVY'] as const).map((intensity) => (
                    <button
                      key={intensity}
                      onClick={() => setNewCycle({ ...newCycle, flowIntensity: intensity })}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        newCycle.flowIntensity === intensity
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pain Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pain Level: {newCycle.painLevel}/10
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={newCycle.painLevel}
                  onChange={(e) => setNewCycle({ ...newCycle, painLevel: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Symptoms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOMS.map((symptom) => (
                    <button
                      key={symptom}
                      onClick={() => {
                        const current = newCycle.symptoms
                        setNewCycle({
                          ...newCycle,
                          symptoms: current.includes(symptom)
                            ? current.filter(s => s !== symptom)
                            : [...current, symptom]
                        })
                      }}
                      className={`px-3 py-1 rounded text-sm ${
                        newCycle.symptoms.includes(symptom)
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((mood) => (
                    <button
                      key={mood}
                      onClick={() => {
                        const current = newCycle.mood
                        setNewCycle({
                          ...newCycle,
                          mood: current.includes(mood)
                            ? current.filter(m => m !== mood)
                            : [...current, mood]
                        })
                      }}
                      className={`px-3 py-1 rounded text-sm ${
                        newCycle.mood.includes(mood)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={newCycle.notes}
                  onChange={(e) => setNewCycle({ ...newCycle, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowAddCycleModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addCycle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Period
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
