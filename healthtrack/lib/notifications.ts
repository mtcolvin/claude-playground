/**
 * Advanced Notification System
 *
 * Handles:
 * - Browser push notifications
 * - In-app notifications
 * - Notification scheduling
 * - Medication reminders
 * - Appointment reminders
 * - Health goal notifications
 */

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  priority?: NotificationPriority
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  data?: any
  url?: string
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications')
    return 'denied'
  }

  if (Notification.permission === 'granted') {
    return 'granted'
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission
  }

  return Notification.permission
}

/**
 * Show browser notification
 */
export async function showNotification(options: NotificationOptions): Promise<void> {
  const permission = await requestNotificationPermission()

  if (permission !== 'granted') {
    console.warn('Notification permission not granted')
    return
  }

  if ('serviceWorker' in navigator) {
    // Use service worker for better control
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192.png',
      badge: options.badge || '/badge-72.png',
      tag: options.tag,
      requireInteraction: options.requireInteraction || options.priority === 'urgent',
      vibrate: getVibrationPattern(options.priority),
      data: options.data,
      actions: options.actions,
    })
  } else {
    // Fallback to basic notification
    new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192.png',
      tag: options.tag,
      data: options.data,
    })
  }
}

/**
 * Get vibration pattern based on priority
 */
function getVibrationPattern(priority?: NotificationPriority): number[] {
  switch (priority) {
    case 'urgent':
      return [200, 100, 200, 100, 200]
    case 'high':
      return [200, 100, 200]
    case 'normal':
      return [200, 100]
    case 'low':
    default:
      return [100]
  }
}

/**
 * Schedule notification
 */
export async function scheduleNotification(
  options: NotificationOptions,
  scheduledTime: Date
): Promise<number> {
  const delay = scheduledTime.getTime() - Date.now()

  if (delay <= 0) {
    await showNotification(options)
    return 0
  }

  // Store in IndexedDB for persistence
  const id = await storeScheduledNotification({
    ...options,
    scheduledTime: scheduledTime.toISOString(),
  })

  // Schedule timeout
  setTimeout(async () => {
    await showNotification(options)
    await removeScheduledNotification(id)
  }, delay)

  return id
}

/**
 * Cancel scheduled notification
 */
export async function cancelScheduledNotification(id: number): Promise<void> {
  await removeScheduledNotification(id)
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<any[]> {
  const db = await openNotificationDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['scheduled'], 'readonly')
    const store = transaction.objectStore('scheduled')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// IndexedDB helpers
const NOTIFICATION_DB = 'HealthTrackNotifications'
const NOTIFICATION_DB_VERSION = 1

async function openNotificationDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(NOTIFICATION_DB, NOTIFICATION_DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains('scheduled')) {
        const store = db.createObjectStore('scheduled', {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('scheduledTime', 'scheduledTime', { unique: false })
      }
    }
  })
}

async function storeScheduledNotification(notification: any): Promise<number> {
  const db = await openNotificationDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['scheduled'], 'readwrite')
    const store = transaction.objectStore('scheduled')
    const request = store.add(notification)

    request.onsuccess = () => resolve(request.result as number)
    request.onerror = () => reject(request.error)
  })
}

async function removeScheduledNotification(id: number): Promise<void> {
  const db = await openNotificationDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['scheduled'], 'readwrite')
    const store = transaction.objectStore('scheduled')
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Create medication reminder
 */
export async function createMedicationReminder(
  medicationName: string,
  times: string[], // Array of time strings like "09:00", "21:00"
  startDate: Date = new Date()
): Promise<number[]> {
  const ids: number[] = []

  for (const time of times) {
    const [hours, minutes] = time.split(':').map(Number)
    const scheduledTime = new Date(startDate)
    scheduledTime.setHours(hours, minutes, 0, 0)

    // If time has passed today, schedule for tomorrow
    if (scheduledTime < new Date()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    const id = await scheduleNotification(
      {
        title: 'Medication Reminder',
        body: `Time to take ${medicationName}`,
        tag: `medication-${medicationName}-${time}`,
        priority: 'high',
        requireInteraction: true,
        actions: [
          { action: 'taken', title: 'Mark as Taken' },
          { action: 'snooze', title: 'Snooze 15 min' },
        ],
        data: {
          type: 'medication',
          medication: medicationName,
          time,
        },
      },
      scheduledTime
    )

    ids.push(id)
  }

  return ids
}

/**
 * Create appointment reminder
 */
export async function createAppointmentReminder(
  appointment: {
    title: string
    dateTime: Date
    provider: string
  },
  reminderMinutes: number[] = [60, 1440] // 1 hour and 1 day before
): Promise<number[]> {
  const ids: number[] = []

  for (const minutes of reminderMinutes) {
    const scheduledTime = new Date(appointment.dateTime.getTime() - minutes * 60 * 1000)

    if (scheduledTime > new Date()) {
      const id = await scheduleNotification(
        {
          title: 'Appointment Reminder',
          body: `${appointment.title} with ${appointment.provider} in ${formatMinutes(minutes)}`,
          tag: `appointment-${appointment.title}-${minutes}`,
          priority: minutes <= 60 ? 'high' : 'normal',
          actions: [
            { action: 'view', title: 'View Details' },
            { action: 'directions', title: 'Get Directions' },
          ],
          data: {
            type: 'appointment',
            appointment,
          },
        },
        scheduledTime
      )

      ids.push(id)
    }
  }

  return ids
}

/**
 * Create health goal reminder
 */
export async function createHealthGoalReminder(
  goal: {
    title: string
    targetDate: Date
  },
  frequency: 'daily' | 'weekly' = 'daily'
): Promise<number> {
  const scheduledTime = new Date()
  scheduledTime.setHours(9, 0, 0, 0) // 9 AM

  if (scheduledTime < new Date()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1)
  }

  return await scheduleNotification(
    {
      title: 'Health Goal Check-in',
      body: `Time to work on: ${goal.title}`,
      tag: `goal-${goal.title}`,
      priority: 'normal',
      actions: [
        { action: 'log', title: 'Log Progress' },
        { action: 'skip', title: 'Skip Today' },
      ],
      data: {
        type: 'health-goal',
        goal,
      },
    },
    scheduledTime
  )
}

/**
 * Format minutes into human-readable string
 */
function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours < 24) {
    return remainingMinutes === 0
      ? `${hours} hour${hours === 1 ? '' : 's'}`
      : `${hours}h ${remainingMinutes}m`
  }

  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'}`
}

/**
 * Initialize notification system
 */
export async function initializeNotifications(): Promise<void> {
  // Request permission
  await requestNotificationPermission()

  // Load and reschedule any persisted notifications
  const scheduled = await getScheduledNotifications()

  for (const notification of scheduled) {
    const scheduledTime = new Date(notification.scheduledTime)

    if (scheduledTime > new Date()) {
      const delay = scheduledTime.getTime() - Date.now()

      setTimeout(async () => {
        await showNotification(notification)
        await removeScheduledNotification(notification.id)
      }, delay)
    } else {
      // Remove expired notifications
      await removeScheduledNotification(notification.id)
    }
  }
}
