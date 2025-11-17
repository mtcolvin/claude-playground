/**
 * Notification Settings Component
 */

'use client'

import { useState, useEffect } from 'react'
import { useNotifications } from '@/hooks/use-notifications'

export function NotificationSettings() {
  const { permission, scheduledCount, requestPermission } = useNotifications()
  const [preferences, setPreferences] = useState({
    medicationReminders: true,
    appointmentReminders: true,
    healthGoalReminders: true,
    labResultAlerts: true,
    systemUpdates: false,
  })

  const handleRequestPermission = async () => {
    const result = await requestPermission()
    if (result === 'granted') {
      alert('Notifications enabled successfully!')
    } else {
      alert('Notification permission denied. You can enable it in browser settings.')
    }
  }

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))

    // Save to server
    fetch('/api/v1/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preferences: {
          notifications: {
            ...preferences,
            [key]: !preferences[key],
          },
        },
      }),
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>

      {/* Permission Status */}
      <div className="mb-6 p-4 rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Browser Notifications</h3>
            <p className="text-sm text-gray-800 mt-1">
              Status:{' '}
              <span
                className={`font-medium ${
                  permission === 'granted'
                    ? 'text-green-600'
                    : permission === 'denied'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`}
              >
                {permission === 'granted'
                  ? 'Enabled'
                  : permission === 'denied'
                  ? 'Blocked'
                  : 'Not Set'}
              </span>
            </p>
            {scheduledCount > 0 && (
              <p className="text-sm text-gray-800 mt-1">
                {scheduledCount} scheduled notification{scheduledCount === 1 ? '' : 's'}
              </p>
            )}
          </div>
          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Enable
            </button>
          )}
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Medication Reminders</h3>
            <p className="text-sm text-gray-800">
              Get notified when it's time to take your medications
            </p>
          </div>
          <button
            onClick={() => handleToggle('medicationReminders')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.medicationReminders ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.medicationReminders ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Appointment Reminders</h3>
            <p className="text-sm text-gray-800">
              Reminders for upcoming medical appointments
            </p>
          </div>
          <button
            onClick={() => handleToggle('appointmentReminders')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.appointmentReminders ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.appointmentReminders ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Health Goal Reminders</h3>
            <p className="text-sm text-gray-800">
              Stay on track with your health goals
            </p>
          </div>
          <button
            onClick={() => handleToggle('healthGoalReminders')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.healthGoalReminders ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.healthGoalReminders ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Lab Result Alerts</h3>
            <p className="text-sm text-gray-800">
              Get notified when new lab results are available
            </p>
          </div>
          <button
            onClick={() => handleToggle('labResultAlerts')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.labResultAlerts ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.labResultAlerts ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">System Updates</h3>
            <p className="text-sm text-gray-800">
              Notifications about app updates and features
            </p>
          </div>
          <button
            onClick={() => handleToggle('systemUpdates')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.systemUpdates ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.systemUpdates ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {permission === 'denied' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Notifications are blocked. To enable them, please update your
            browser settings and reload the page.
          </p>
        </div>
      )}
    </div>
  )
}
