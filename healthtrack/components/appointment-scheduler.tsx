'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar, Clock, MapPin, Users, Phone, Video, FileText, Bell,
  CheckCircle, XCircle, AlertTriangle, Plus, Edit, Trash2,
  Download, Mail, ChevronLeft, ChevronRight
} from 'lucide-react'

// Types
interface Appointment {
  id: string
  title: string
  provider: string
  specialty: string
  type: 'in-person' | 'telemedicine' | 'phone'
  date: Date
  duration: number // minutes
  location?: string
  address?: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  preparation?: string[]
  reminders: {
    sent: boolean
    type: '24h' | '1h' | '15min'
    sentAt?: Date
  }[]
}

interface ReminderSettings {
  enabled: boolean
  email: boolean
  sms: boolean
  push: boolean
  timing: ('1-week' | '24h' | '1h' | '15min')[]
}

// Mock appointments
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    title: 'Annual Physical Exam',
    provider: 'Dr. Sarah Johnson',
    specialty: 'Family Medicine',
    type: 'in-person',
    date: new Date('2025-04-10T09:00:00'),
    duration: 45,
    location: 'City Health Medical Group',
    address: '123 Main St, Suite 200, Springfield, ST 12345',
    status: 'confirmed',
    preparation: [
      'Fasting required (no food or drink after midnight)',
      'Bring current medication list',
      'Bring insurance card',
      'Arrive 15 minutes early for check-in'
    ],
    notes: 'Annual checkup with lab work',
    reminders: [
      { sent: false, type: '24h' },
      { sent: false, type: '1h' }
    ]
  },
  {
    id: 'a2',
    title: 'Cardiology Follow-Up',
    provider: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    type: 'telemedicine',
    date: new Date('2025-03-20T14:30:00'),
    duration: 30,
    status: 'scheduled',
    preparation: [
      'Have blood pressure readings ready',
      'Test video/audio 5 minutes before',
      'Have medication list available'
    ],
    notes: '6-month follow-up for hypertension',
    reminders: [
      { sent: false, type: '24h' },
      { sent: false, type: '15min' }
    ]
  },
  {
    id: 'a3',
    title: 'Eye Exam',
    provider: 'Dr. Emily Martinez',
    specialty: 'Optometry',
    type: 'in-person',
    date: new Date('2025-11-05T10:00:00'),
    duration: 60,
    location: 'Vision Care Associates',
    address: '789 Eye St, Springfield, ST 12345',
    status: 'scheduled',
    preparation: [
      'Bring current glasses/contacts',
      'List any vision changes or concerns'
    ],
    notes: 'Annual eye exam',
    reminders: [
      { sent: false, type: '24h' }
    ]
  }
]

export function AppointmentScheduler() {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: true,
    email: true,
    sms: true,
    push: true,
    timing: ['24h', '1h']
  })

  // Filter appointments
  const upcomingAppointments = useMemo(() => {
    const now = new Date()
    return appointments
      .filter(apt => apt.date > now && apt.status !== 'cancelled')
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [appointments])

  const pastAppointments = useMemo(() => {
    const now = new Date()
    return appointments
      .filter(apt => apt.date <= now || apt.status === 'completed')
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [appointments])

  const nextAppointment = upcomingAppointments[0]

  // Get appointment type icon
  const getTypeIcon = (type: Appointment['type']) => {
    const icons = {
      'in-person': <MapPin className="h-4 w-4" />,
      'telemedicine': <Video className="h-4 w-4" />,
      'phone': <Phone className="h-4 w-4" />
    }
    return icons[type]
  }

  // Get status badge
  const getStatusBadge = (status: Appointment['status']) => {
    const badges = {
      'scheduled': <Badge variant="outline">Scheduled</Badge>,
      'confirmed': <Badge className="bg-green-600 text-white">Confirmed</Badge>,
      'completed': <Badge variant="secondary">Completed</Badge>,
      'cancelled': <Badge variant="destructive">Cancelled</Badge>,
      'no-show': <Badge className="bg-gray-600 text-white">No-Show</Badge>
    }
    return badges[status]
  }

  // Format date/time
  const formatDateTime = (date: Date) => {
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
  }

  // Get time until appointment
  const getTimeUntil = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()

    if (diff < 0) return 'Past'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `In ${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `In ${hours} hour${hours > 1 ? 's' : ''}`
    return 'Soon'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            Appointments & Scheduling
          </h1>
          <p className="text-muted-foreground">
            Manage your healthcare appointments and reminders
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Total Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{appointments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {upcomingAppointments.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {appointments.filter(apt => {
                const month = new Date().getMonth()
                return apt.date.getMonth() === month
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Reminders Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {reminderSettings.enabled ? upcomingAppointments.length : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Appointment Highlight */}
      {nextAppointment && (
        <Card className="border-blue-500 border-2 bg-blue-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-xl">{nextAppointment.title}</CardTitle>
                  <Badge className="bg-blue-600 text-white">
                    Next Appointment
                  </Badge>
                </div>
                <CardDescription className="text-base">
                  {nextAppointment.provider} - {nextAppointment.specialty}
                </CardDescription>
              </div>
              {getStatusBadge(nextAppointment.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">
                    {formatDateTime(nextAppointment.date).date}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">
                    {formatDateTime(nextAppointment.date).time} ({nextAppointment.duration} min)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getTypeIcon(nextAppointment.type)}
                  <span>
                    {nextAppointment.type === 'in-person' && nextAppointment.location}
                    {nextAppointment.type === 'telemedicine' && 'Video Call'}
                    {nextAppointment.type === 'phone' && 'Phone Call'}
                  </span>
                </div>
                {nextAppointment.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{nextAppointment.address}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="p-4 bg-white rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    Preparation Checklist:
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {nextAppointment.preparation?.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button size="sm" className="bg-blue-600">
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
              <Button size="sm" variant="outline">
                <MapPin className="h-4 w-4 mr-2" />
                Get Directions
              </Button>
              <Button size="sm" variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Call Office
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="reminders">
            Reminders
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Appointments */}
        <TabsContent value="upcoming">
          <div className="space-y-4">
            {upcomingAppointments.map(apt => {
              const dateTime = formatDateTime(apt.date)
              const timeUntil = getTimeUntil(apt.date)

              return (
                <Card key={apt.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-lg">{apt.title}</CardTitle>
                          <Badge variant="outline">{timeUntil}</Badge>
                        </div>
                        <CardDescription>
                          {apt.provider} - {apt.specialty}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(apt.status)}
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {dateTime.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {dateTime.time} ({apt.duration} minutes)
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {getTypeIcon(apt.type)}
                          <span className="capitalize">{apt.type.replace('-', ' ')}</span>
                        </div>
                        {apt.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {apt.location}
                          </div>
                        )}
                      </div>

                      {apt.notes && (
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="text-sm text-muted-foreground flex items-start gap-2">
                            <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {apt.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            {upcomingAppointments.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No upcoming appointments scheduled
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Past Appointments */}
        <TabsContent value="past">
          <div className="space-y-4">
            {pastAppointments.slice(0, 5).map(apt => {
              const dateTime = formatDateTime(apt.date)

              return (
                <Card key={apt.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{apt.title}</CardTitle>
                        <CardDescription>
                          {apt.provider} - {apt.specialty}
                        </CardDescription>
                      </div>
                      {getStatusBadge(apt.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {dateTime.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {dateTime.time}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Reminder Settings */}
        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Reminder Settings
              </CardTitle>
              <CardDescription>
                Configure how and when you receive appointment reminders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Enable/Disable */}
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold">Appointment Reminders</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications before your appointments
                    </p>
                  </div>
                  <Button
                    variant={reminderSettings.enabled ? 'default' : 'outline'}
                    onClick={() => setReminderSettings({ ...reminderSettings, enabled: !reminderSettings.enabled })}
                  >
                    {reminderSettings.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                {reminderSettings.enabled && (
                  <>
                    {/* Notification Methods */}
                    <div>
                      <h4 className="font-semibold mb-3">Notification Methods:</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>Email</span>
                          </div>
                          <Button
                            size="sm"
                            variant={reminderSettings.email ? 'default' : 'outline'}
                            onClick={() => setReminderSettings({ ...reminderSettings, email: !reminderSettings.email })}
                          >
                            {reminderSettings.email ? 'On' : 'Off'}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>SMS Text</span>
                          </div>
                          <Button
                            size="sm"
                            variant={reminderSettings.sms ? 'default' : 'outline'}
                            onClick={() => setReminderSettings({ ...reminderSettings, sms: !reminderSettings.sms })}
                          >
                            {reminderSettings.sms ? 'On' : 'Off'}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span>Push Notifications</span>
                          </div>
                          <Button
                            size="sm"
                            variant={reminderSettings.push ? 'default' : 'outline'}
                            onClick={() => setReminderSettings({ ...reminderSettings, push: !reminderSettings.push })}
                          >
                            {reminderSettings.push ? 'On' : 'Off'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Timing */}
                    <div>
                      <h4 className="font-semibold mb-3">Reminder Timing:</h4>
                      <div className="grid gap-2 md:grid-cols-2">
                        {[
                          { value: '1-week', label: '1 Week Before' },
                          { value: '24h', label: '24 Hours Before' },
                          { value: '1h', label: '1 Hour Before' },
                          { value: '15min', label: '15 Minutes Before' }
                        ].map(option => (
                          <div
                            key={option.value}
                            className={`p-3 border rounded cursor-pointer transition-colors ${
                              reminderSettings.timing.includes(option.value as any)
                                ? 'border-blue-500 bg-blue-50'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              const timing = reminderSettings.timing.includes(option.value as any)
                                ? reminderSettings.timing.filter(t => t !== option.value)
                                : [...reminderSettings.timing, option.value as any]
                              setReminderSettings({ ...reminderSettings, timing })
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{option.label}</span>
                              {reminderSettings.timing.includes(option.value as any) && (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <Button className="w-full">
                  Save Reminder Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
