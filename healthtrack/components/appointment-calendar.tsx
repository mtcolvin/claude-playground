/**
 * Phase 14: Appointment Calendar UI
 */

'use client'

import { useState, useEffect } from 'react'

interface Appointment {
  id: string
  title: string
  dateTime: string
  duration: number
  provider: string
  location?: string
  type: 'IN_PERSON' | 'TELEMEDICINE' | 'PHONE'
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  notes?: string
}

export function AppointmentCalendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [filterStatus, setFilterStatus] = useState<string>('SCHEDULED')

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      const response = await fetch('/api/v1/appointments?sortBy=dateTime&sortOrder=asc')
      const data = await response.json()
      if (data.success) {
        setAppointments(data.data)
      }
    } catch (error) {
      console.error('Failed to load appointments:', error)
    }
  }

  const upcoming = appointments.filter(a =>
    new Date(a.dateTime) >= new Date() && a.status === 'SCHEDULED'
  )

  const filteredAppointments = filterStatus === 'all'
    ? appointments
    : appointments.filter(a => a.status === filterStatus)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Schedule Appointment
        </button>
      </div>

      {/* Upcoming Appointments Card */}
      {upcoming.length > 0 && (
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">Next Appointment</h2>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-lg font-semibold">{upcoming[0].title}</div>
                <div className="text-green-100 mt-1">{upcoming[0].provider}</div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {new Date(upcoming[0].dateTime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {new Date(upcoming[0].dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {upcoming[0].location && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {upcoming[0].location}
                    </div>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                upcoming[0].type === 'TELEMEDICINE' ? 'bg-blue-100 text-blue-800' :
                upcoming[0].type === 'PHONE' ? 'bg-purple-100 text-purple-800' :
                'bg-white bg-opacity-30'
              }`}>
                {upcoming[0].type.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        {['SCHEDULED', 'COMPLETED', 'CANCELLED', 'all'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 font-medium capitalize ${
              filterStatus === status
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-700 hover:text-gray-700'
            }`}
          >
            {status === 'all' ? 'All' : status.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.map((apt) => {
          const isPast = new Date(apt.dateTime) < new Date()
          return (
            <div key={apt.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{apt.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      apt.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' :
                      apt.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="text-gray-800 mt-1">{apt.provider}</div>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-800">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {new Date(apt.dateTime).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' '}({apt.duration} min)
                    </div>
                    {apt.location && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {apt.location}
                      </div>
                    )}
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      apt.type === 'TELEMEDICINE' ? 'bg-blue-100 text-blue-800' :
                      apt.type === 'PHONE' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {apt.type.replace('_', ' ')}
                    </span>
                  </div>

                  {apt.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      {apt.notes}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button className="p-2 text-gray-800 hover:text-gray-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  {apt.status === 'SCHEDULED' && !isPast && (
                    <button className="p-2 text-red-400 hover:text-red-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12 text-gray-700">
            No appointments found
          </div>
        )}
      </div>
    </div>
  )
}
