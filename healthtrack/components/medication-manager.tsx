/**
 * Phase 12: Medication Management UI
 */

'use client'

import { useState, useEffect } from 'react'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  prescribedBy?: string
  isActive: boolean
  reminderTimes: string[]
}

export function MedicationManager() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active')
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadMedications()
  }, [filter])

  const loadMedications = async () => {
    try {
      const isActive = filter === 'all' ? '' : filter === 'active' ? 'true' : 'false'
      const response = await fetch(`/api/v1/medications?isActive=${isActive}`)
      const data = await response.json()
      if (data.success) {
        setMedications(data.data)
      }
    } catch (error) {
      console.error('Failed to load medications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const activeMeds = medications.filter(m => m.isActive)
  const upcomingDoses = getUpcomingDoses(activeMeds)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Medications</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Medication
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900 text-sm">Active Medications</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">{activeMeds.length}</div>
            </div>
            <div className="text-4xl">💊</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900 text-sm">Upcoming Today</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">{upcomingDoses.length}</div>
            </div>
            <div className="text-4xl">⏰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-900 text-sm">Adherence Rate</div>
              <div className="text-3xl font-bold text-green-600 mt-1">94%</div>
            </div>
            <div className="text-4xl">✓</div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      {upcomingDoses.length > 0 && (
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
          <div className="space-y-3">
            {upcomingDoses.map((dose, index) => (
              <div key={index} className="bg-white bg-opacity-20 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{dose.time} - {dose.medication}</div>
                  <div className="text-purple-100 text-sm">{dose.dosage}</div>
                </div>
                <button className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50">
                  Mark Taken
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        {['all', 'active', 'inactive'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as any)}
            className={`px-4 py-2 font-medium capitalize ${
              filter === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-900 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Medications List */}
      <div className="bg-white rounded-lg shadow divide-y">
        {medications.length === 0 ? (
          <div className="p-12 text-center text-gray-900">
            No medications found. Add your first medication to get started.
          </div>
        ) : (
          medications.map((med) => (
            <div key={med.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{med.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      med.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {med.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-900">Dosage</div>
                      <div className="font-medium">{med.dosage}</div>
                    </div>
                    <div>
                      <div className="text-gray-900">Frequency</div>
                      <div className="font-medium">{med.frequency}</div>
                    </div>
                    <div>
                      <div className="text-gray-900">Start Date</div>
                      <div className="font-medium">{new Date(med.startDate).toLocaleDateString()}</div>
                    </div>
                    {med.prescribedBy && (
                      <div>
                        <div className="text-gray-900">Prescribed By</div>
                        <div className="font-medium">{med.prescribedBy}</div>
                      </div>
                    )}
                  </div>

                  {med.reminderTimes.length > 0 && (
                    <div className="mt-3">
                      <div className="text-gray-900 text-sm mb-1">Reminder Times</div>
                      <div className="flex gap-2">
                        {med.reminderTimes.map((time, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button className="p-2 text-gray-800 hover:text-gray-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-800 hover:text-red-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <AddMedicationModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            loadMedications()
            setShowAddModal(false)
          }}
        />
      )}
    </div>
  )
}

function getUpcomingDoses(medications: Medication[]): Array<{ time: string; medication: string; dosage: string }> {
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const doses: Array<{ time: string; medication: string; dosage: string }> = []

  medications.forEach(med => {
    med.reminderTimes.forEach(time => {
      if (time >= currentTime) {
        doses.push({
          time,
          medication: med.name,
          dosage: med.dosage,
        })
      }
    })
  })

  return doses.sort((a, b) => a.time.localeCompare(b.time))
}

function AddMedicationModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    startDate: new Date().toISOString().slice(0, 10),
    prescribedBy: '',
    reminderTimes: ['09:00', '21:00'],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/v1/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isActive: true,
        }),
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to add medication:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 my-8">
        <h2 className="text-xl font-semibold mb-4">Add Medication</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Medication Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Dosage</label>
            <input
              type="text"
              placeholder="e.g., 500mg"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select frequency</option>
              <option value="Once daily">Once daily</option>
              <option value="Twice daily">Twice daily</option>
              <option value="Three times daily">Three times daily</option>
              <option value="Four times daily">Four times daily</option>
              <option value="Every other day">Every other day</option>
              <option value="As needed">As needed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Prescribed By (Optional)</label>
            <input
              type="text"
              value={formData.prescribedBy}
              onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Medication
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
