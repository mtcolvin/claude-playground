/**
 * Phase 18: Fitness & Exercise Tracking
 */

'use client'

import { useState, useEffect } from 'react'
import { HealthMetricChart } from './charts/health-metric-chart'

interface ExerciseSession {
  id: string
  date: string
  activityType: 'CARDIO' | 'STRENGTH' | 'FLEXIBILITY' | 'SPORTS' | 'OTHER'
  activityName: string
  duration: number // minutes
  caloriesBurned?: number
  distance?: number // km
  distanceUnit?: 'km' | 'miles'
  heartRateAvg?: number
  heartRateMax?: number
  intensity?: 'LOW' | 'MODERATE' | 'HIGH' | 'VIGOROUS'
  exercises?: Array<{
    name: string
    sets?: number
    reps?: number
    weight?: number
    weightUnit?: 'kg' | 'lbs'
  }>
  notes?: string
}

interface WeeklyStats {
  totalWorkouts: number
  totalDuration: number
  totalCalories: number
  totalDistance: number
  avgHeartRate: number
}

export function FitnessTracker() {
  const [sessions, setSessions] = useState<ExerciseSession[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSession, setNewSession] = useState<{
    activityType: 'CARDIO' | 'STRENGTH' | 'FLEXIBILITY' | 'SPORTS' | 'OTHER'
    activityName: string
    duration: number
    caloriesBurned: number
    distance: number
    intensity: 'LOW' | 'MODERATE' | 'HIGH' | 'VIGOROUS'
    exercises: Array<{ name: string; sets: number; reps: number; weight: number }>
    notes: string
  }>({
    activityType: 'CARDIO',
    activityName: '',
    duration: 30,
    caloriesBurned: 0,
    distance: 0,
    intensity: 'MODERATE',
    exercises: [],
    notes: '',
  })

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/v1/exercise-sessions?sortBy=date&sortOrder=desc&limit=90')
      const data = await response.json()
      if (data.success) {
        setSessions(data.data)
      }
    } catch (error) {
      console.error('Failed to load exercise sessions:', error)
    }
  }

  const addSession = async () => {
    try {
      const response = await fetch('/api/v1/exercise-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSession,
          date: new Date().toISOString(),
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSessions([data.data, ...sessions])
        setShowAddModal(false)
        setNewSession({
          activityType: 'CARDIO',
          activityName: '',
          duration: 30,
          caloriesBurned: 0,
          distance: 0,
          intensity: 'MODERATE',
          exercises: [],
          notes: '',
        })
      }
    } catch (error) {
      console.error('Failed to add session:', error)
    }
  }

  const getActivityIcon = (type: string): string => {
    switch (type) {
      case 'CARDIO': return '🏃'
      case 'STRENGTH': return '💪'
      case 'FLEXIBILITY': return '🧘'
      case 'SPORTS': return '⚽'
      default: return '🏋️'
    }
  }

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'CARDIO': return 'bg-red-100 text-red-800'
      case 'STRENGTH': return 'bg-blue-100 text-blue-800'
      case 'FLEXIBILITY': return 'bg-purple-100 text-purple-800'
      case 'SPORTS': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getIntensityColor = (intensity: string): string => {
    switch (intensity) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'VIGOROUS': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Calculate stats for selected period
  const now = new Date()
  const periodDays = selectedPeriod === 'week' ? 7 : 30
  const periodSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date)
    const daysDiff = (now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= periodDays
  })

  const weeklyStats: WeeklyStats = {
    totalWorkouts: periodSessions.length,
    totalDuration: periodSessions.reduce((sum, s) => sum + s.duration, 0),
    totalCalories: periodSessions.reduce((sum, s) => sum + (s.caloriesBurned || 0), 0),
    totalDistance: periodSessions.reduce((sum, s) => sum + (s.distance || 0), 0),
    avgHeartRate: periodSessions.filter(s => s.heartRateAvg).length > 0
      ? periodSessions.filter(s => s.heartRateAvg).reduce((sum, s) => sum + (s.heartRateAvg || 0), 0) /
        periodSessions.filter(s => s.heartRateAvg).length
      : 0,
  }

  const CARDIO_ACTIVITIES = [
    'Running', 'Cycling', 'Swimming', 'Walking', 'Rowing', 'Elliptical',
    'Jump Rope', 'Dancing', 'Hiking', 'Stair Climbing'
  ]

  const STRENGTH_EXERCISES = [
    'Bench Press', 'Squats', 'Deadlifts', 'Pull-ups', 'Push-ups', 'Shoulder Press',
    'Bicep Curls', 'Tricep Dips', 'Lunges', 'Plank'
  ]

  const addExercise = () => {
    setNewSession({
      ...newSession,
      exercises: [...newSession.exercises, { name: '', sets: 3, reps: 10, weight: 0 }]
    })
  }

  const removeExercise = (index: number) => {
    setNewSession({
      ...newSession,
      exercises: newSession.exercises.filter((_, i) => i !== index)
    })
  }

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...newSession.exercises]
    updated[index] = { ...updated[index], [field]: value }
    setNewSession({ ...newSession, exercises: updated })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Fitness Tracker</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Log Workout
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Workouts */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="text-blue-100 text-sm font-medium">Workouts</div>
          <div className="text-3xl font-bold mt-1">{weeklyStats.totalWorkouts}</div>
          <div className="text-blue-100 text-sm mt-1">
            {selectedPeriod === 'week' ? 'This week' : 'This month'}
          </div>
        </div>

        {/* Total Duration */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <div className="text-green-100 text-sm font-medium">Duration</div>
          <div className="text-3xl font-bold mt-1">
            {Math.floor(weeklyStats.totalDuration / 60)}h {weeklyStats.totalDuration % 60}m
          </div>
          <div className="text-green-100 text-sm mt-1">Total time</div>
        </div>

        {/* Calories Burned */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow p-6 text-white">
          <div className="text-orange-100 text-sm font-medium">Calories</div>
          <div className="text-3xl font-bold mt-1">{weeklyStats.totalCalories.toLocaleString()}</div>
          <div className="text-orange-100 text-sm mt-1">Burned</div>
        </div>

        {/* Total Distance */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <div className="text-purple-100 text-sm font-medium">Distance</div>
          <div className="text-3xl font-bold mt-1">{weeklyStats.totalDistance.toFixed(1)}</div>
          <div className="text-purple-100 text-sm mt-1">Kilometers</div>
        </div>

        {/* Avg Heart Rate */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
          <div className="text-red-100 text-sm font-medium">Avg Heart Rate</div>
          <div className="text-3xl font-bold mt-1">
            {weeklyStats.avgHeartRate > 0 ? Math.round(weeklyStats.avgHeartRate) : 'N/A'}
          </div>
          <div className="text-red-100 text-sm mt-1">BPM</div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Workout Progress</h2>
        {periodSessions.length > 0 ? (
          <HealthMetricChart
            data={periodSessions.map(s => ({ date: s.date, value: s.duration }))}
            dataKey="value"
            name="Duration"
            color="#3b82f6"
            unit=" min"
            type="bar"
            height={300}
          />
        ) : (
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500">
            No workout data yet. Log your first workout to see progress!
          </div>
        )}
      </div>

      {/* Recent Workouts */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Workouts</h2>

        {periodSessions.map((session) => (
          <div key={session.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{getActivityIcon(session.activityType)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{session.activityName}</h3>
                    <div className="text-sm text-gray-500">
                      {new Date(session.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="font-semibold text-gray-900">{session.duration} min</div>
                  </div>
                  {session.caloriesBurned && session.caloriesBurned > 0 && (
                    <div>
                      <div className="text-xs text-gray-500">Calories</div>
                      <div className="font-semibold text-gray-900">{session.caloriesBurned} kcal</div>
                    </div>
                  )}
                  {session.distance && session.distance > 0 && (
                    <div>
                      <div className="text-xs text-gray-500">Distance</div>
                      <div className="font-semibold text-gray-900">
                        {session.distance} {session.distanceUnit || 'km'}
                      </div>
                    </div>
                  )}
                  {session.heartRateAvg && (
                    <div>
                      <div className="text-xs text-gray-500">Heart Rate</div>
                      <div className="font-semibold text-gray-900">
                        {session.heartRateAvg} bpm
                        {session.heartRateMax && ` / ${session.heartRateMax}`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Exercises (for strength training) */}
                {session.exercises && session.exercises.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Exercises:</div>
                    <div className="space-y-2">
                      {session.exercises.map((exercise, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-900">{exercise.name}</span>
                          <span className="text-sm text-gray-600">
                            {exercise.sets} × {exercise.reps} reps
                            {exercise.weight && ` @ ${exercise.weight}${exercise.weightUnit || 'kg'}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getActivityColor(session.activityType)}`}>
                    {session.activityType}
                  </span>
                  {session.intensity && (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getIntensityColor(session.intensity)}`}>
                      {session.intensity}
                    </span>
                  )}
                </div>

                {/* Notes */}
                {session.notes && (
                  <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-gray-700">
                    {session.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {periodSessions.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            No workouts logged yet. Start tracking your fitness journey today!
          </div>
        )}
      </div>

      {/* Add Workout Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-6">
              <h2 className="text-2xl font-bold text-gray-900">Log Workout</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Activity Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {(['CARDIO', 'STRENGTH', 'FLEXIBILITY', 'SPORTS', 'OTHER'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewSession({ ...newSession, activityType: type })}
                      className={`px-4 py-2 rounded-lg text-sm ${
                        newSession.activityType === type
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {getActivityIcon(type)} {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activity Name</label>
                <input
                  type="text"
                  value={newSession.activityName}
                  onChange={(e) => setNewSession({ ...newSession, activityName: e.target.value })}
                  placeholder="e.g., Morning Run, Leg Day, Yoga Session"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  list="activity-suggestions"
                />
                <datalist id="activity-suggestions">
                  {(newSession.activityType === 'CARDIO' ? CARDIO_ACTIVITIES : STRENGTH_EXERCISES).map(activity => (
                    <option key={activity} value={activity} />
                  ))}
                </datalist>
              </div>

              {/* Duration & Intensity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({ ...newSession, duration: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intensity</label>
                  <select
                    value={newSession.intensity}
                    onChange={(e) => setNewSession({ ...newSession, intensity: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LOW">Low</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HIGH">High</option>
                    <option value="VIGOROUS">Vigorous</option>
                  </select>
                </div>
              </div>

              {/* Calories & Distance */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calories Burned</label>
                  <input
                    type="number"
                    value={newSession.caloriesBurned}
                    onChange={(e) => setNewSession({ ...newSession, caloriesBurned: Number(e.target.value) })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newSession.distance}
                    onChange={(e) => setNewSession({ ...newSession, distance: Number(e.target.value) })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Strength Training Exercises */}
              {newSession.activityType === 'STRENGTH' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Exercises</label>
                    <button
                      onClick={addExercise}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Exercise
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newSession.exercises.map((exercise, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={exercise.name}
                            onChange={(e) => updateExercise(index, 'name', e.target.value)}
                            placeholder="Exercise name"
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            list="strength-suggestions"
                          />
                          <button
                            onClick={() => removeExercise(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => updateExercise(index, 'sets', Number(e.target.value))}
                              placeholder="Sets"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => updateExercise(index, 'reps', Number(e.target.value))}
                              placeholder="Reps"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={exercise.weight}
                              onChange={(e) => updateExercise(index, 'weight', Number(e.target.value))}
                              placeholder="Weight (kg)"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <datalist id="strength-suggestions">
                    {STRENGTH_EXERCISES.map(ex => (
                      <option key={ex} value={ex} />
                    ))}
                  </datalist>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How did the workout feel? Any achievements or struggles?"
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
                Save Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
