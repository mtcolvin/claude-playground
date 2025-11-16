'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users, Plus, Phone, Mail, MapPin, Calendar, FileText, Star,
  Stethoscope, Heart, Brain, Eye, Activity, Shield, Edit, Trash2
} from 'lucide-react'

// Types
interface Provider {
  id: string
  name: string
  type: 'primary' | 'specialist' | 'therapist' | 'other'
  specialty: string
  organization: string
  phone: string
  fax?: string
  email?: string
  address: string
  website?: string
  isPrimary: boolean
  lastVisit?: Date
  nextAppointment?: Date
  notes?: string
}

interface CareTeamMember {
  id: string
  name: string
  relationship: 'family' | 'friend' | 'caregiver' | 'advocate'
  role: string
  phone: string
  email?: string
  emergencyContact: boolean
  canAccessRecords: boolean
  notes?: string
}

// Mock data
const MOCK_PROVIDERS: Provider[] = [
  {
    id: 'p1',
    name: 'Dr. Sarah Johnson, MD',
    type: 'primary',
    specialty: 'Family Medicine',
    organization: 'City Health Medical Group',
    phone: '(555) 123-4567',
    fax: '(555) 123-4568',
    email: 'sjohnson@cityhealthmed.com',
    address: '123 Main St, Suite 200, Springfield, ST 12345',
    website: 'www.cityhealthmed.com',
    isPrimary: true,
    lastVisit: new Date('2024-01-15'),
    nextAppointment: new Date('2025-04-10'),
    notes: 'Annual physical exam due in April'
  },
  {
    id: 'p2',
    name: 'Dr. Michael Chen, MD, FACC',
    type: 'specialist',
    specialty: 'Cardiology',
    organization: 'Heart & Vascular Center',
    phone: '(555) 234-5678',
    email: 'mchen@heartvascular.com',
    address: '456 Medical Plaza Dr, Springfield, ST 12345',
    isPrimary: false,
    lastVisit: new Date('2024-02-20'),
    notes: 'Follow-up every 6 months for hypertension management'
  },
  {
    id: 'p3',
    name: 'Dr. Emily Martinez, OD',
    type: 'specialist',
    specialty: 'Optometry',
    organization: 'Vision Care Associates',
    phone: '(555) 345-6789',
    address: '789 Eye St, Springfield, ST 12345',
    isPrimary: false,
    lastVisit: new Date('2023-11-05'),
    nextAppointment: new Date('2025-11-05'),
    notes: 'Annual eye exam'
  }
]

const MOCK_CARETEAM: CareTeamMember[] = [
  {
    id: 'c1',
    name: 'Jane Smith',
    relationship: 'family',
    role: 'Spouse / Primary Caregiver',
    phone: '(555) 111-2222',
    email: 'jane.smith@email.com',
    emergencyContact: true,
    canAccessRecords: true,
    notes: 'Main support person, handles medication management'
  },
  {
    id: 'c2',
    name: 'John Smith Jr',
    relationship: 'family',
    role: 'Adult Child',
    phone: '(555) 222-3333',
    email: 'john.jr@email.com',
    emergencyContact: true,
    canAccessRecords: false,
    notes: 'Backup emergency contact'
  }
]

export function CareTeamManagement() {
  const [providers, setProviders] = useState<Provider[]>(MOCK_PROVIDERS)
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>(MOCK_CARETEAM)
  const [activeTab, setActiveTab] = useState<'providers' | 'careteam'>('providers')

  const getProviderIcon = (type: Provider['type']) => {
    const icons = {
      primary: <Stethoscope className="h-5 w-5 text-blue-600" />,
      specialist: <Heart className="h-5 w-5 text-red-600" />,
      therapist: <Brain className="h-5 w-5 text-purple-600" />,
      other: <Activity className="h-5 w-5 text-gray-600" />
    }
    return icons[type]
  }

  const getSpecialtyIcon = (specialty: string) => {
    if (specialty.toLowerCase().includes('cardio')) return <Heart className="h-4 w-4" />
    if (specialty.toLowerCase().includes('eye') || specialty.toLowerCase().includes('ophthalm') || specialty.toLowerCase().includes('optom')) return <Eye className="h-4 w-4" />
    if (specialty.toLowerCase().includes('neuro') || specialty.toLowerCase().includes('psych')) return <Brain className="h-4 w-4" />
    return <Stethoscope className="h-4 w-4" />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            My Care Team
          </h1>
          <p className="text-muted-foreground">
            Manage your healthcare providers and support network
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Total Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{providers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Primary Care
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {providers.filter(p => p.type === 'primary').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Specialists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {providers.filter(p => p.type === 'specialist').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Care Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{careTeam.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'providers' ? 'default' : 'outline'}
          onClick={() => setActiveTab('providers')}
        >
          <Stethoscope className="h-4 w-4 mr-2" />
          Healthcare Providers ({providers.length})
        </Button>
        <Button
          variant={activeTab === 'careteam' ? 'default' : 'outline'}
          onClick={() => setActiveTab('careteam')}
        >
          <Users className="h-4 w-4 mr-2" />
          Care Team ({careTeam.length})
        </Button>
      </div>

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div className="grid gap-4 md:grid-cols-2">
          {providers.map(provider => (
            <Card key={provider.id} className={provider.isPrimary ? 'border-blue-500 border-2' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getProviderIcon(provider.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        {provider.isPrimary && (
                          <Badge className="bg-blue-600 text-white">
                            <Star className="h-3 w-3 mr-1" />
                            Primary
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        {getSpecialtyIcon(provider.specialty)}
                        {provider.specialty}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
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
                <div className="space-y-3">
                  {/* Organization */}
                  <div>
                    <p className="font-semibold text-sm mb-1">{provider.organization}</p>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${provider.phone}`} className="text-blue-600 hover:underline">
                        {provider.phone}
                      </a>
                    </div>
                    {provider.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${provider.email}`} className="text-blue-600 hover:underline">
                          {provider.email}
                        </a>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{provider.address}</span>
                    </div>
                  </div>

                  {/* Appointments */}
                  {(provider.lastVisit || provider.nextAppointment) && (
                    <div className="pt-3 border-t space-y-2">
                      {provider.lastVisit && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Last Visit:</span>
                          <span className="font-medium">
                            {provider.lastVisit.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {provider.nextAppointment && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Next Appointment:</span>
                          <Badge className="bg-green-600 text-white">
                            <Calendar className="h-3 w-3 mr-1" />
                            {provider.nextAppointment.toLocaleDateString()}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {provider.notes && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {provider.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Care Team Tab */}
      {activeTab === 'careteam' && (
        <div className="grid gap-4 md:grid-cols-2">
          {careTeam.map(member => (
            <Card key={member.id} className={member.emergencyContact ? 'border-red-500 border-2' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      {member.emergencyContact && (
                        <Badge className="bg-red-600 text-white">
                          <Shield className="h-3 w-3 mr-1" />
                          Emergency
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{member.role}</CardDescription>
                  </div>
                  <div className="flex gap-1">
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
                <div className="space-y-3">
                  {/* Relationship */}
                  <div>
                    <Badge variant="outline">
                      {member.relationship.charAt(0).toUpperCase() + member.relationship.slice(1)}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${member.phone}`} className="text-blue-600 hover:underline">
                        {member.phone}
                      </a>
                    </div>
                    {member.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">
                          {member.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Permissions */}
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Record Access:</span>
                      <Badge variant={member.canAccessRecords ? 'default' : 'secondary'}>
                        {member.canAccessRecords ? 'Granted' : 'Not Granted'}
                      </Badge>
                    </div>
                  </div>

                  {/* Notes */}
                  {member.notes && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {member.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Reference Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Quick Reference Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Healthcare Provider Types:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Primary Care:</strong> Your main doctor for general health</li>
                <li>• <strong>Specialist:</strong> Doctors focused on specific conditions</li>
                <li>• <strong>Therapist:</strong> Mental health or physical therapy providers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Care Team Roles:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• <strong>Emergency Contact:</strong> Called in medical emergencies</li>
                <li>• <strong>Caregiver:</strong> Assists with daily health management</li>
                <li>• <strong>Healthcare Advocate:</strong> Helps navigate healthcare system</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
