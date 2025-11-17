'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search, AlertTriangle, Info, CheckCircle, Phone, Hospital,
  Clock, ThermometerSun, Activity, Brain, Heart, Stethoscope,
  ChevronRight, User, Calendar, MapPin, XCircle, Plus
} from 'lucide-react'

// Types
interface Symptom {
  id: string
  name: string
  category: string
  severity: 'mild' | 'moderate' | 'severe'
  duration: string
  bodyPart?: string
  description?: string
}

interface Condition {
  id: string
  name: string
  probability: number // 0-100
  description: string
  commonSymptoms: string[]
  redFlags: string[]
  selfCare: string[]
  whenToSeekCare: string
  urgency: 'emergency' | 'urgent' | 'routine' | 'watch'
}

interface TriageResult {
  level: 'emergency' | 'urgent' | 'routine' | 'self-care'
  title: string
  description: string
  action: string
  icon: React.ReactNode
  color: string
  timeframe: string
}

// Symptom database (simplified - would be comprehensive in production)
const SYMPTOM_DATABASE = {
  'Cardiovascular': [
    { id: 's1', name: 'Chest pain', redFlag: true },
    { id: 's2', name: 'Palpitations', redFlag: false },
    { id: 's3', name: 'Shortness of breath', redFlag: true },
    { id: 's4', name: 'Irregular heartbeat', redFlag: false },
    { id: 's5', name: 'Swelling in legs', redFlag: false },
  ],
  'Respiratory': [
    { id: 's6', name: 'Cough', redFlag: false },
    { id: 's7', name: 'Difficulty breathing', redFlag: true },
    { id: 's8', name: 'Wheezing', redFlag: false },
    { id: 's9', name: 'Sore throat', redFlag: false },
    { id: 's10', name: 'Runny nose', redFlag: false },
  ],
  'Neurological': [
    { id: 's11', name: 'Headache', redFlag: false },
    { id: 's12', name: 'Dizziness', redFlag: false },
    { id: 's13', name: 'Confusion', redFlag: true },
    { id: 's14', name: 'Vision changes', redFlag: true },
    { id: 's15', name: 'Numbness/tingling', redFlag: true },
  ],
  'Gastrointestinal': [
    { id: 's16', name: 'Abdominal pain', redFlag: false },
    { id: 's17', name: 'Nausea', redFlag: false },
    { id: 's18', name: 'Vomiting', redFlag: false },
    { id: 's19', name: 'Diarrhea', redFlag: false },
    { id: 's20', name: 'Blood in stool', redFlag: true },
  ],
  'Musculoskeletal': [
    { id: 's21', name: 'Joint pain', redFlag: false },
    { id: 's22', name: 'Muscle pain', redFlag: false },
    { id: 's23', name: 'Back pain', redFlag: false },
    { id: 's24', name: 'Swelling', redFlag: false },
    { id: 's25', name: 'Stiffness', redFlag: false },
  ],
  'General': [
    { id: 's26', name: 'Fever', redFlag: false },
    { id: 's27', name: 'Fatigue', redFlag: false },
    { id: 's28', name: 'Weight loss', redFlag: false },
    { id: 's29', name: 'Night sweats', redFlag: false },
    { id: 's30', name: 'Chills', redFlag: false },
  ],
}

// Condition matching algorithm
const matchConditions = (symptoms: Symptom[]): Condition[] => {
  const conditions: Condition[] = []

  const symptomNames = symptoms.map(s => s.name.toLowerCase())
  const hasSevereSymptom = symptoms.some(s => s.severity === 'severe')

  // Cardiovascular conditions
  if (symptomNames.includes('chest pain') || symptomNames.includes('shortness of breath')) {
    conditions.push({
      id: 'c1',
      name: 'Acute Coronary Syndrome (Possible Heart Attack)',
      probability: symptomNames.includes('chest pain') ? 75 : 45,
      description: 'Chest pain or discomfort that may indicate reduced blood flow to the heart.',
      commonSymptoms: ['Chest pain', 'Shortness of breath', 'Sweating', 'Nausea', 'Palpitations'],
      redFlags: [
        'Crushing chest pain',
        'Pain radiating to arm or jaw',
        'Severe shortness of breath',
        'Loss of consciousness'
      ],
      selfCare: [],
      whenToSeekCare: 'CALL 911 IMMEDIATELY',
      urgency: 'emergency'
    })
  }

  if (symptomNames.includes('palpitations')) {
    conditions.push({
      id: 'c2',
      name: 'Cardiac Arrhythmia',
      probability: 60,
      description: 'Irregular heartbeat that may be benign or require evaluation.',
      commonSymptoms: ['Palpitations', 'Irregular heartbeat', 'Dizziness', 'Fatigue'],
      redFlags: ['Chest pain with palpitations', 'Fainting', 'Severe shortness of breath'],
      selfCare: [
        'Avoid caffeine and stimulants',
        'Reduce stress',
        'Stay hydrated',
        'Track episodes in health journal'
      ],
      whenToSeekCare: 'See doctor within 1-2 weeks if persistent. Seek emergency care if chest pain or fainting occurs.',
      urgency: 'routine'
    })
  }

  // Respiratory conditions
  if (symptomNames.includes('cough') || symptomNames.includes('sore throat')) {
    conditions.push({
      id: 'c3',
      name: 'Upper Respiratory Infection (Common Cold)',
      probability: 70,
      description: 'Viral infection of the nose, throat, and airways.',
      commonSymptoms: ['Cough', 'Sore throat', 'Runny nose', 'Mild fever', 'Fatigue'],
      redFlags: ['High fever >103°F', 'Difficulty breathing', 'Symptoms >10 days'],
      selfCare: [
        'Rest and stay hydrated',
        'Use humidifier',
        'Gargle with salt water',
        'Over-the-counter pain relievers',
        'Honey for cough (if >1 year old)'
      ],
      whenToSeekCare: 'See doctor if symptoms worsen or persist >10 days.',
      urgency: 'routine'
    })
  }

  if (symptomNames.includes('difficulty breathing') || symptomNames.includes('wheezing')) {
    conditions.push({
      id: 'c4',
      name: 'Asthma Exacerbation',
      probability: 55,
      description: 'Worsening of asthma symptoms requiring treatment.',
      commonSymptoms: ['Wheezing', 'Difficulty breathing', 'Cough', 'Chest tightness'],
      redFlags: [
        'Severe difficulty breathing',
        'Inability to speak full sentences',
        'Blue lips or fingernails',
        'No improvement with inhaler'
      ],
      selfCare: [
        'Use rescue inhaler as prescribed',
        'Sit upright',
        'Practice breathing exercises',
        'Avoid triggers'
      ],
      whenToSeekCare: 'Seek emergency care if no improvement with inhaler or severe breathing difficulty.',
      urgency: 'urgent'
    })
  }

  // Neurological conditions
  if (symptomNames.includes('headache')) {
    const severity = symptoms.find(s => s.name === 'Headache')?.severity
    conditions.push({
      id: 'c5',
      name: severity === 'severe' ? 'Severe Headache (Possible Migraine)' : 'Tension Headache',
      probability: 65,
      description: severity === 'severe'
        ? 'Severe headache that may be a migraine or other serious condition.'
        : 'Common headache caused by muscle tension and stress.',
      commonSymptoms: severity === 'severe'
        ? ['Severe headache', 'Nausea', 'Light sensitivity', 'Visual disturbances']
        : ['Mild-moderate headache', 'Muscle tension', 'Fatigue'],
      redFlags: [
        'Worst headache of your life',
        'Sudden onset ("thunderclap")',
        'With fever and stiff neck',
        'With vision changes or confusion',
        'After head injury'
      ],
      selfCare: severity === 'severe'
        ? ['Rest in dark, quiet room', 'Cold compress', 'Prescribed migraine medication']
        : ['Rest', 'Over-the-counter pain reliever', 'Hydration', 'Stress reduction'],
      whenToSeekCare: severity === 'severe'
        ? 'Seek emergency care if worst headache ever, with red flag symptoms, or not responding to medication.'
        : 'See doctor if headaches are frequent or worsening.',
      urgency: severity === 'severe' ? 'urgent' : 'routine'
    })
  }

  if (symptomNames.includes('confusion') || symptomNames.includes('vision changes')) {
    conditions.push({
      id: 'c6',
      name: 'Neurological Emergency (Possible Stroke)',
      probability: 80,
      description: 'Sudden neurological symptoms that may indicate stroke or other emergency.',
      commonSymptoms: ['Confusion', 'Vision changes', 'Weakness', 'Speech difficulty', 'Numbness'],
      redFlags: [
        'Sudden weakness on one side',
        'Sudden speech difficulty',
        'Sudden severe headache',
        'Sudden vision loss',
        'Loss of balance'
      ],
      selfCare: [],
      whenToSeekCare: 'CALL 911 IMMEDIATELY - Time = Brain',
      urgency: 'emergency'
    })
  }

  // GI conditions
  if (symptomNames.includes('abdominal pain')) {
    const severity = symptoms.find(s => s.name === 'Abdominal pain')?.severity
    conditions.push({
      id: 'c7',
      name: severity === 'severe' ? 'Acute Abdomen' : 'Gastritis/Indigestion',
      probability: 50,
      description: severity === 'severe'
        ? 'Severe abdominal pain requiring urgent evaluation.'
        : 'Stomach inflammation or indigestion.',
      commonSymptoms: severity === 'severe'
        ? ['Severe abdominal pain', 'Vomiting', 'Fever', 'Rigid abdomen']
        : ['Mild abdominal discomfort', 'Bloating', 'Nausea'],
      redFlags: [
        'Severe, worsening pain',
        'Rigid, board-like abdomen',
        'Vomiting blood',
        'Black, tarry stools',
        'High fever'
      ],
      selfCare: severity === 'severe'
        ? []
        : ['Bland diet', 'Avoid irritating foods', 'Antacids', 'Small, frequent meals'],
      whenToSeekCare: severity === 'severe'
        ? 'Seek emergency care immediately.'
        : 'See doctor if pain persists >3 days or worsens.',
      urgency: severity === 'severe' ? 'emergency' : 'routine'
    })
  }

  // Fever evaluation
  if (symptomNames.includes('fever')) {
    conditions.push({
      id: 'c8',
      name: 'Fever (Infection)',
      probability: 70,
      description: 'Elevated body temperature indicating possible infection.',
      commonSymptoms: ['Fever', 'Chills', 'Sweating', 'Fatigue', 'Body aches'],
      redFlags: [
        'Fever >104°F (40°C)',
        'Fever >3 days',
        'With severe headache and stiff neck',
        'With rash',
        'With difficulty breathing'
      ],
      selfCare: [
        'Rest and hydrate',
        'Acetaminophen or ibuprofen',
        'Light clothing',
        'Lukewarm bath',
        'Monitor temperature'
      ],
      whenToSeekCare: 'Seek care if fever >104°F, lasts >3 days, or has red flag symptoms.',
      urgency: hasSevereSymptom ? 'urgent' : 'watch'
    })
  }

  return conditions.sort((a, b) => b.probability - a.probability)
}

// Triage algorithm
const performTriage = (symptoms: Symptom[], conditions: Condition[]): TriageResult => {
  // Emergency red flags
  const redFlagSymptoms = [
    'chest pain', 'difficulty breathing', 'confusion', 'vision changes',
    'numbness/tingling', 'blood in stool', 'severe shortness of breath'
  ]

  const hasRedFlag = symptoms.some(s =>
    redFlagSymptoms.some(rf => s.name.toLowerCase().includes(rf))
  )

  const hasSevereSymptom = symptoms.some(s => s.severity === 'severe')
  const hasEmergencyCondition = conditions.some(c => c.urgency === 'emergency')

  if (hasRedFlag || hasEmergencyCondition) {
    return {
      level: 'emergency',
      title: 'Seek Emergency Care Immediately',
      description: 'Your symptoms suggest a potentially serious condition that requires immediate medical attention.',
      action: 'Call 911 or go to the nearest emergency room NOW',
      icon: <Phone className="h-8 w-8" />,
      color: 'bg-red-500',
      timeframe: 'Immediate'
    }
  }

  const hasUrgentCondition = conditions.some(c => c.urgency === 'urgent')
  if (hasSevereSymptom || hasUrgentCondition) {
    return {
      level: 'urgent',
      title: 'Seek Medical Care Today',
      description: 'Your symptoms require prompt medical evaluation within the next few hours.',
      action: 'Call your doctor or visit urgent care today',
      icon: <Hospital className="h-8 w-8" />,
      color: 'bg-orange-500',
      timeframe: 'Within 24 hours'
    }
  }

  const hasRoutineCondition = conditions.some(c => c.urgency === 'routine')
  if (hasRoutineCondition) {
    return {
      level: 'routine',
      title: 'Schedule Doctor Appointment',
      description: 'Your symptoms should be evaluated by a healthcare provider, but are not urgent.',
      action: 'Schedule appointment with your doctor within 1-2 weeks',
      icon: <Calendar className="h-8 w-8" />,
      color: 'bg-yellow-500',
      timeframe: 'Within 1-2 weeks'
    }
  }

  return {
    level: 'self-care',
    title: 'Self-Care Recommended',
    description: 'Your symptoms can likely be managed at home with self-care measures.',
    action: 'Try self-care recommendations. See doctor if symptoms worsen or persist.',
    icon: <CheckCircle className="h-8 w-8" />,
    color: 'bg-green-500',
    timeframe: 'Monitor at home'
  }
}

export function SymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([])
  const [currentStep, setCurrentStep] = useState<'select' | 'details' | 'results'>('select')
  const [searchQuery, setSearchQuery] = useState('')

  // Add symptom
  const addSymptom = (symptomId: string, symptomName: string, category: string) => {
    const newSymptom: Symptom = {
      id: symptomId,
      name: symptomName,
      category,
      severity: 'moderate',
      duration: '1-3 days'
    }
    setSelectedSymptoms([...selectedSymptoms, newSymptom])
  }

  // Remove symptom
  const removeSymptom = (symptomId: string) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomId))
  }

  // Update symptom details
  const updateSymptom = (symptomId: string, updates: Partial<Symptom>) => {
    setSelectedSymptoms(selectedSymptoms.map(s =>
      s.id === symptomId ? { ...s, ...updates } : s
    ))
  }

  // Generate results
  const conditions = useMemo(() => matchConditions(selectedSymptoms), [selectedSymptoms])
  const triageResult = useMemo(() => performTriage(selectedSymptoms, conditions), [selectedSymptoms, conditions])

  // Filter symptoms by search
  const filteredSymptoms = useMemo(() => {
    if (!searchQuery) return SYMPTOM_DATABASE

    const query = searchQuery.toLowerCase()
    const filtered: Partial<typeof SYMPTOM_DATABASE> = {}

    Object.entries(SYMPTOM_DATABASE).forEach(([category, symptoms]) => {
      const matchingSymptoms = symptoms.filter(s =>
        s.name.toLowerCase().includes(query)
      )
      if (matchingSymptoms.length > 0) {
        (filtered as any)[category] = matchingSymptoms
      }
    })

    return filtered
  }, [searchQuery])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-blue-600" />
          Symptom Checker
        </h1>
        <p className="text-muted-foreground">
          Answer a few questions about your symptoms to get personalized health guidance
        </p>
      </div>

      {/* Important Disclaimer */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            Important Medical Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700">
            This symptom checker is for informational purposes only and is not a substitute for professional
            medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified
            health provider with any questions you may have regarding a medical condition. In case of emergency,
            call 911 immediately.
          </p>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 ${currentStep === 'select' ? 'text-blue-600 font-semibold' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'select' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span>Select Symptoms</span>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
        <div className={`flex items-center gap-2 ${currentStep === 'details' ? 'text-blue-600 font-semibold' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'details' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span>Add Details</span>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
        <div className={`flex items-center gap-2 ${currentStep === 'results' ? 'text-blue-600 font-semibold' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <span>Get Results</span>
        </div>
      </div>

      {/* Step 1: Select Symptoms */}
      {currentStep === 'select' && (
        <>
          {/* Selected Symptoms */}
          {selectedSymptoms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selected Symptoms ({selectedSymptoms.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedSymptoms.map(symptom => (
                    <Badge
                      key={symptom.id}
                      variant="secondary"
                      className="px-3 py-1 text-sm flex items-center gap-2"
                    >
                      {symptom.name}
                      <button onClick={() => removeSymptom(symptom.id)}>
                        <XCircle className="h-4 w-4" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Button
                  onClick={() => setCurrentStep('details')}
                  disabled={selectedSymptoms.length === 0}
                  className="w-full"
                >
                  Continue to Details
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Symptoms</CardTitle>
              <CardDescription>
                Type to search or browse by category below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search symptoms (e.g., headache, fever, cough)..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Symptom Categories */}
          <Tabs defaultValue={Object.keys(filteredSymptoms)[0]} className="space-y-4">
            <TabsList className="grid grid-cols-3 md:grid-cols-6">
              {Object.keys(filteredSymptoms).map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(filteredSymptoms).map(([category, symptoms]) => (
              <TabsContent key={category} value={category}>
                <Card>
                  <CardHeader>
                    <CardTitle>{category} Symptoms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-2">
                      {symptoms.map(symptom => {
                        const isSelected = selectedSymptoms.some(s => s.id === symptom.id)
                        return (
                          <Button
                            key={symptom.id}
                            variant={isSelected ? 'default' : 'outline'}
                            className="justify-start"
                            onClick={() => {
                              if (isSelected) {
                                removeSymptom(symptom.id)
                              } else {
                                addSymptom(symptom.id, symptom.name, category)
                              }
                            }}
                          >
                            {isSelected && <CheckCircle className="h-4 w-4 mr-2" />}
                            {symptom.name}
                            {symptom.redFlag && (
                              <Badge className="ml-auto bg-red-500 text-white">!</Badge>
                            )}
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}

      {/* Step 2: Symptom Details */}
      {currentStep === 'details' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Symptom Details</CardTitle>
              <CardDescription>
                Provide more information about each symptom
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {selectedSymptoms.map((symptom, idx) => (
                  <div key={symptom.id} className="border-b pb-4 last:border-0">
                    <h4 className="font-semibold mb-3">{idx + 1}. {symptom.name}</h4>

                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Severity */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Severity</label>
                        <div className="flex gap-2">
                          {(['mild', 'moderate', 'severe'] as const).map(sev => (
                            <Button
                              key={sev}
                              size="sm"
                              variant={symptom.severity === sev ? 'default' : 'outline'}
                              onClick={() => updateSymptom(symptom.id, { severity: sev })}
                            >
                              {sev.charAt(0).toUpperCase() + sev.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">Duration</label>
                        <select
                          className="w-full p-2 border rounded-lg"
                          value={symptom.duration}
                          onChange={(e) => updateSymptom(symptom.id, { duration: e.target.value })}
                        >
                          <option value="<1 day">Less than 1 day</option>
                          <option value="1-3 days">1-3 days</option>
                          <option value="3-7 days">3-7 days</option>
                          <option value="1-2 weeks">1-2 weeks</option>
                          <option value=">2 weeks">More than 2 weeks</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setCurrentStep('select')}>
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setCurrentStep('results')}>
                  Get Results
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Step 3: Results */}
      {currentStep === 'results' && (
        <>
          {/* Triage Result */}
          <Card className={`border-2 ${triageResult.level === 'emergency' ? 'border-red-500' : triageResult.level === 'urgent' ? 'border-orange-500' : 'border-green-500'}`}>
            <CardHeader className={triageResult.color + ' text-white'}>
              <div className="flex items-center gap-3">
                {triageResult.icon}
                <div>
                  <CardTitle className="text-white">{triageResult.title}</CardTitle>
                  <CardDescription className="text-white/90">
                    {triageResult.timeframe}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="mb-4">{triageResult.description}</p>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-semibold text-blue-900">Recommended Action:</p>
                <p className="text-blue-800">{triageResult.action}</p>
              </div>
            </CardContent>
          </Card>

          {/* Possible Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Possible Conditions</CardTitle>
              <CardDescription>
                Based on your symptoms, these conditions are possible. Probability indicates likelihood.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conditions.slice(0, 3).map((condition) => (
                  <Card key={condition.id} className="border-l-4 border-blue-500">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{condition.name}</CardTitle>
                          <CardDescription className="mt-1">{condition.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">{condition.probability}%</div>
                          <p className="text-xs text-muted-foreground">Match</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Common Symptoms */}
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Common Symptoms:</h4>
                          <div className="flex flex-wrap gap-1">
                            {condition.commonSymptoms.map((sym, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {sym}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Red Flags */}
                        {condition.redFlags.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-1 text-red-600">Red Flags:</h4>
                            <ul className="text-sm space-y-1">
                              {condition.redFlags.map((flag, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                  {flag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Self-Care */}
                        {condition.selfCare.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Self-Care:</h4>
                            <ul className="text-sm space-y-1">
                              {condition.selfCare.map((care, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                  {care}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* When to Seek Care */}
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm font-semibold text-yellow-900">When to Seek Care:</p>
                          <p className="text-sm text-yellow-800">{condition.whenToSeekCare}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => {
                  setSelectedSymptoms([])
                  setCurrentStep('select')
                }}>
                  Start Over
                </Button>
                <Button variant="outline" onClick={() => setCurrentStep('details')}>
                  Edit Symptoms
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Numbers */}
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Emergency Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3 text-sm">
                <div>
                  <p className="font-semibold">Emergency Services</p>
                  <p className="text-2xl font-bold text-red-600">911</p>
                </div>
                <div>
                  <p className="font-semibold">Poison Control</p>
                  <p className="text-xl font-bold">1-800-222-1222</p>
                </div>
                <div>
                  <p className="font-semibold">Mental Health Crisis</p>
                  <p className="text-xl font-bold">988</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
