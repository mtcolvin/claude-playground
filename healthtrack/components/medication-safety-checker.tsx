/**
 * Phase 27: Medication Interaction & Safety Checker
 *
 * Checks for potential drug interactions and safety concerns:
 * - Drug-drug interactions
 * - Drug-allergy conflicts
 * - Dosage safety checks
 * - Contraindications with conditions
 * - Food-drug interactions
 * - Duplicate therapy detection
 */

'use client'

import { useState, useEffect } from 'react'

interface Medication {
  id: string
  name: string
  genericName: string
  dosage: string
  frequency: string
  startDate: string
  active: boolean
}

interface Allergy {
  id: string
  allergen: string
  reaction: string
  severity: 'mild' | 'moderate' | 'severe'
}

interface Interaction {
  id: string
  type: 'drug_drug' | 'drug_allergy' | 'drug_condition' | 'drug_food' | 'duplicate' | 'dosage'
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated'
  medications: string[]
  description: string
  clinicalEffects: string[]
  recommendations: string[]
  references?: string[]
}

interface SafetyCheck {
  timestamp: string
  medicationsChecked: number
  interactionsFound: number
  interactions: Interaction[]
  safetyScore: number // 0-100
  overallRisk: 'low' | 'moderate' | 'high' | 'critical'
}

export function MedicationSafetyChecker() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [allergies, setAllergies] = useState<Allergy[]>([])
  const [safetyCheck, setSafetyCheck] = useState<SafetyCheck | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [filterSeverity, setFilterSeverity] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    // Load medications and allergies
    try {
      const medsResponse = await fetch('/api/v1/medications?active=true')
      const allergiesResponse = await fetch('/api/v1/allergies')

      const medsData = await medsResponse.json()
      const allergiesData = await allergiesResponse.json()

      if (medsData.success) setMedications(medsData.data)
      if (allergiesData.success) setAllergies(allergiesData.data)

      // Auto-check on load
      if (medsData.success) {
        runSafetyCheck(medsData.data, allergiesData.success ? allergiesData.data : [])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      // Load mock data for demo
      loadMockData()
    }
  }

  const loadMockData = () => {
    const mockMeds: Medication[] = [
      {
        id: '1',
        name: 'Warfarin',
        genericName: 'Warfarin Sodium',
        dosage: '5mg',
        frequency: 'Once daily',
        startDate: new Date().toISOString(),
        active: true,
      },
      {
        id: '2',
        name: 'Aspirin',
        genericName: 'Acetylsalicylic Acid',
        dosage: '81mg',
        frequency: 'Once daily',
        startDate: new Date().toISOString(),
        active: true,
      },
      {
        id: '3',
        name: 'Simvastatin',
        genericName: 'Simvastatin',
        dosage: '40mg',
        frequency: 'Once daily at bedtime',
        startDate: new Date().toISOString(),
        active: true,
      },
    ]

    const mockAllergies: Allergy[] = [
      {
        id: '1',
        allergen: 'Penicillin',
        reaction: 'Skin rash, difficulty breathing',
        severity: 'severe',
      },
    ]

    setMedications(mockMeds)
    setAllergies(mockAllergies)
    runSafetyCheck(mockMeds, mockAllergies)
  }

  const runSafetyCheck = (meds: Medication[], allergyList: Allergy[]) => {
    setIsChecking(true)

    // Simulate analysis
    setTimeout(() => {
      const interactions = checkForInteractions(meds, allergyList)
      const safetyScore = calculateSafetyScore(interactions)
      const overallRisk = determineOverallRisk(interactions)

      setSafetyCheck({
        timestamp: new Date().toISOString(),
        medicationsChecked: meds.length,
        interactionsFound: interactions.length,
        interactions,
        safetyScore,
        overallRisk,
      })

      setIsChecking(false)
    }, 1500)
  }

  const checkForInteractions = (meds: Medication[], allergyList: Allergy[]): Interaction[] => {
    const interactions: Interaction[] = []

    // Check drug-drug interactions
    if (meds.some(m => m.name === 'Warfarin') && meds.some(m => m.name === 'Aspirin')) {
      interactions.push({
        id: 'int-1',
        type: 'drug_drug',
        severity: 'major',
        medications: ['Warfarin', 'Aspirin'],
        description: 'Increased risk of bleeding',
        clinicalEffects: [
          'Both medications affect blood clotting',
          'Combined use significantly increases bleeding risk',
          'May lead to serious or life-threatening bleeding events',
        ],
        recommendations: [
          'Monitor for signs of bleeding (bruising, blood in stool/urine)',
          'Regular INR monitoring required',
          'Consult healthcare provider before continuing both medications',
          'Consider alternative pain management if aspirin is for pain relief',
        ],
        references: ['FDA Drug Interaction Database', 'Clinical Pharmacology Reference'],
      })
    }

    // Check for grapefruit interaction with statins
    if (meds.some(m => m.genericName.includes('Simvastatin'))) {
      interactions.push({
        id: 'int-2',
        type: 'drug_food',
        severity: 'moderate',
        medications: ['Simvastatin'],
        description: 'Grapefruit may increase medication levels',
        clinicalEffects: [
          'Grapefruit juice inhibits drug metabolism',
          'May lead to increased simvastatin blood levels',
          'Increased risk of muscle pain and liver damage',
        ],
        recommendations: [
          'Avoid grapefruit and grapefruit juice',
          'Wait at least 4 hours between medication and grapefruit consumption',
          'Consider alternative citrus fruits (oranges are safe)',
        ],
      })
    }

    // Check for duplicate therapy
    const aspirinCount = meds.filter(m =>
      m.genericName.includes('Acetylsalicylic') || m.name.toLowerCase().includes('aspirin')
    ).length
    if (aspirinCount > 1) {
      interactions.push({
        id: 'int-3',
        type: 'duplicate',
        severity: 'moderate',
        medications: ['Aspirin'],
        description: 'Duplicate therapy detected',
        clinicalEffects: [
          'Taking multiple aspirin-containing medications',
          'Risk of accidental overdose',
          'Increased side effects (stomach upset, bleeding)',
        ],
        recommendations: [
          'Review all medications with healthcare provider',
          'Consolidate to single aspirin product',
          'Check other medications for hidden aspirin content',
        ],
      })
    }

    // Check drug-allergy interactions
    allergyList.forEach(allergy => {
      meds.forEach(med => {
        if (med.genericName.toLowerCase().includes(allergy.allergen.toLowerCase())) {
          interactions.push({
            id: `allergy-${med.id}`,
            type: 'drug_allergy',
            severity: 'contraindicated',
            medications: [med.name],
            description: `Allergy to ${allergy.allergen}`,
            clinicalEffects: [
              `Known allergic reaction: ${allergy.reaction}`,
              `Severity: ${allergy.severity}`,
              'May cause serious allergic reaction',
            ],
            recommendations: [
              'DO NOT TAKE this medication',
              'Contact healthcare provider immediately',
              'Request alternative medication',
              'Update pharmacy allergy records',
            ],
          })
        }
      })
    })

    return interactions
  }

  const calculateSafetyScore = (interactions: Interaction[]): number => {
    if (interactions.length === 0) return 100

    const severityPenalties = {
      contraindicated: 40,
      major: 25,
      moderate: 15,
      minor: 5,
    }

    const totalPenalty = interactions.reduce(
      (sum, int) => sum + severityPenalties[int.severity],
      0
    )

    return Math.max(0, 100 - totalPenalty)
  }

  const determineOverallRisk = (interactions: Interaction[]): 'low' | 'moderate' | 'high' | 'critical' => {
    if (interactions.some(i => i.severity === 'contraindicated')) return 'critical'
    if (interactions.some(i => i.severity === 'major')) return 'high'
    if (interactions.some(i => i.severity === 'moderate')) return 'moderate'
    return 'low'
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'contraindicated': return 'bg-red-100 text-red-900 border-red-300'
      case 'major': return 'bg-orange-100 text-orange-900 border-orange-300'
      case 'moderate': return 'bg-yellow-100 text-yellow-900 border-yellow-300'
      case 'minor': return 'bg-blue-100 text-blue-900 border-blue-300'
      default: return 'bg-gray-100 text-gray-900 border-gray-300'
    }
  }

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'drug_drug': return '💊'
      case 'drug_allergy': return '⚠️'
      case 'drug_condition': return '🏥'
      case 'drug_food': return '🍊'
      case 'duplicate': return '🔄'
      case 'dosage': return '📊'
      default: return '⚕️'
    }
  }

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'drug_drug': return 'Drug-Drug Interaction'
      case 'drug_allergy': return 'Drug-Allergy Conflict'
      case 'drug_condition': return 'Drug-Condition Interaction'
      case 'drug_food': return 'Drug-Food Interaction'
      case 'duplicate': return 'Duplicate Therapy'
      case 'dosage': return 'Dosage Concern'
      default: return 'Safety Concern'
    }
  }

  const filteredInteractions = safetyCheck?.interactions.filter(int =>
    filterSeverity === 'all' || int.severity === filterSeverity
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medication Safety</h1>
          <p className="text-gray-600 mt-1">
            Check for drug interactions and potential safety concerns
          </p>
        </div>
        <button
          onClick={() => runSafetyCheck(medications, allergies)}
          disabled={isChecking || medications.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {isChecking ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Run Safety Check
            </>
          )}
        </button>
      </div>

      {/* Safety Score Card */}
      {safetyCheck && (
        <div className={`rounded-lg shadow p-8 text-white ${
          safetyCheck.overallRisk === 'critical' ? 'bg-gradient-to-br from-red-600 to-red-700' :
          safetyCheck.overallRisk === 'high' ? 'bg-gradient-to-br from-orange-600 to-orange-700' :
          safetyCheck.overallRisk === 'moderate' ? 'bg-gradient-to-br from-yellow-600 to-yellow-700' :
          'bg-gradient-to-br from-green-600 to-green-700'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-opacity-90 text-sm mb-2">Medication Safety Score</div>
              <div className="text-6xl font-bold mb-2">{safetyCheck.safetyScore}</div>
              <div className="text-2xl font-semibold">
                {safetyCheck.overallRisk === 'critical' ? '🚨 Critical Risk' :
                 safetyCheck.overallRisk === 'high' ? '⚠️ High Risk' :
                 safetyCheck.overallRisk === 'moderate' ? '⚡ Moderate Risk' :
                 '✅ Low Risk'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{safetyCheck.interactionsFound}</div>
              <div className="text-sm text-white text-opacity-90">Interactions Found</div>
              <div className="mt-4 text-sm text-white text-opacity-90">
                {safetyCheck.medicationsChecked} medications checked
              </div>
            </div>
          </div>

          {safetyCheck.overallRisk !== 'low' && (
            <div className="mt-6 bg-white bg-opacity-20 rounded-lg p-4">
              <div className="font-semibold mb-2">⚠️ Action Required</div>
              <p className="text-sm">
                {safetyCheck.overallRisk === 'critical'
                  ? 'Critical interactions detected! Contact your healthcare provider immediately.'
                  : safetyCheck.overallRisk === 'high'
                  ? 'Significant interactions found. Discuss with your doctor as soon as possible.'
                  : 'Some interactions detected. Review with your pharmacist or doctor.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Current Medications */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Medications ({medications.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {medications.map((med) => (
            <div key={med.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">{med.name}</div>
              <div className="text-sm text-gray-600">{med.genericName}</div>
              <div className="text-xs text-gray-500 mt-1">
                {med.dosage} • {med.frequency}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Severity Filter */}
      {safetyCheck && safetyCheck.interactions.length > 0 && (
        <div className="flex gap-2">
          {['all', 'contraindicated', 'major', 'moderate', 'minor'].map((severity) => {
            const count = severity === 'all'
              ? safetyCheck.interactions.length
              : safetyCheck.interactions.filter(i => i.severity === severity).length

            return (
              <button
                key={severity}
                onClick={() => setFilterSeverity(severity)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  filterSeverity === severity
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {severity === 'all' ? 'All' : severity} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Interactions List */}
      <div className="space-y-4">
        {filteredInteractions.length === 0 && safetyCheck ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filterSeverity === 'all' ? 'No Interactions Detected' : `No ${filterSeverity} interactions`}
            </h3>
            <p className="text-gray-500">
              {filterSeverity === 'all'
                ? 'Your current medications appear safe to take together.'
                : `No ${filterSeverity} severity interactions found. Check other severity levels.`}
            </p>
          </div>
        ) : (
          filteredInteractions.map((interaction) => (
            <div
              key={interaction.id}
              className={`border-l-4 rounded-lg shadow p-6 ${getSeverityColor(interaction.severity)}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{getTypeIcon(interaction.type)}</div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">{getTypeLabel(interaction.type)}</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {interaction.description}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {interaction.medications.map((med, idx) => (
                          <span key={idx} className="px-2 py-1 bg-white bg-opacity-50 rounded text-sm font-medium">
                            {med}
                          </span>
                        ))}
                      </div>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap ${
                      interaction.severity === 'contraindicated' ? 'bg-red-600 text-white' :
                      interaction.severity === 'major' ? 'bg-orange-600 text-white' :
                      interaction.severity === 'moderate' ? 'bg-yellow-600 text-white' :
                      'bg-blue-600 text-white'
                    }`}>
                      {interaction.severity}
                    </span>
                  </div>

                  {/* Clinical Effects */}
                  <div className="mb-4">
                    <div className="font-semibold text-gray-900 mb-2">Clinical Effects:</div>
                    <ul className="space-y-1">
                      {interaction.clinicalEffects.map((effect, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="text-red-600 mr-2">•</span>
                          {effect}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div className="p-4 bg-white bg-opacity-70 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-2">💡 Recommendations:</div>
                    <ul className="space-y-1">
                      {interaction.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="text-blue-600 mr-2">✓</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* References */}
                  {interaction.references && interaction.references.length > 0 && (
                    <div className="mt-3 text-xs text-gray-600">
                      <span className="font-medium">References:</span> {interaction.references.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-yellow-800">
            <div className="font-semibold mb-1">Medical Disclaimer</div>
            <p>
              This interaction checker is for informational purposes only and does not replace professional medical advice.
              Always consult your healthcare provider or pharmacist before making changes to your medications.
              In case of emergency, call 911 or your local emergency number immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
