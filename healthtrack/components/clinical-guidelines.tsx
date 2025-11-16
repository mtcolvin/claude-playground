'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen, Heart, Droplet, Brain, Activity, Pill,
  CheckCircle, AlertTriangle, Info, Search, FileText, Calendar,
  Target, TrendingUp, Shield, Stethoscope
} from 'lucide-react'

// Types
interface ClinicalGuideline {
  id: string
  condition: string
  category: string
  lastUpdated: string
  source: string
  summary: string
  diagnosis: {
    criteria: string[]
    tests: string[]
  }
  treatment: {
    firstLine: string[]
    secondLine: string[]
    lifestyle: string[]
  }
  monitoring: {
    frequency: string
    parameters: string[]
  }
  goals: {
    target: string
    metric: string
  }[]
  redFlags: string[]
  references: string[]
}

// Clinical Guidelines Database
const CLINICAL_GUIDELINES: ClinicalGuideline[] = [
  {
    id: 'hypertension',
    condition: 'Hypertension (High Blood Pressure)',
    category: 'Cardiovascular',
    lastUpdated: '2024',
    source: 'ACC/AHA 2024 Guidelines',
    summary: 'Evidence-based management of elevated blood pressure in adults',
    diagnosis: {
      criteria: [
        'Stage 1: Systolic 130-139 OR Diastolic 80-89 mmHg',
        'Stage 2: Systolic ≥140 OR Diastolic ≥90 mmHg',
        'Confirm with out-of-office measurements (HBPM or ABPM)',
        'Average of 2-3 readings on 2-3 separate occasions'
      ],
      tests: [
        'Complete blood count (CBC)',
        'Basic metabolic panel (electrolytes, creatinine)',
        'Fasting lipid panel',
        'Fasting glucose or HbA1c',
        'Urinalysis',
        'ECG (baseline)'
      ]
    },
    treatment: {
      firstLine: [
        'Thiazide diuretics (chlorthalidone 12.5-25mg daily)',
        'ACE inhibitors (lisinopril 10-40mg daily)',
        'ARBs (losartan 50-100mg daily)',
        'CCBs (amlodipine 5-10mg daily)'
      ],
      secondLine: [
        'Beta-blockers (if comorbid CAD or HF)',
        'Aldosterone antagonists (spironolactone)',
        'Alpha-blockers',
        'Direct vasodilators'
      ],
      lifestyle: [
        'DASH diet (high fruits, vegetables, low-fat dairy)',
        'Sodium restriction (<2,300mg/day, ideal <1,500mg/day)',
        'Weight loss (goal BMI 18.5-24.9)',
        'Exercise 150 minutes/week moderate aerobic',
        'Limit alcohol (≤2 drinks/day men, ≤1 drink/day women)',
        'Stress reduction (meditation, yoga)',
        'Adequate sleep (7-9 hours/night)'
      ]
    },
    monitoring: {
      frequency: 'Every 3-6 months until controlled, then every 6-12 months',
      parameters: [
        'Blood pressure (home monitoring encouraged)',
        'Renal function (creatinine, eGFR)',
        'Electrolytes (potassium if on ACEI/ARB/diuretic)',
        'Medication adherence',
        'Adverse effects'
      ]
    },
    goals: [
      { target: '<130/80 mmHg', metric: 'Blood Pressure (General)' },
      { target: '<130/80 mmHg', metric: 'BP with diabetes or CKD' },
      { target: '<65 years: <130/80; ≥65 years: <130/80 if tolerated', metric: 'BP by age' }
    ],
    redFlags: [
      'Hypertensive emergency (BP >180/120 with organ damage)',
      'Severe headache, vision changes, chest pain',
      'Sudden shortness of breath',
      'Neurological symptoms'
    ],
    references: [
      'Whelton PK, et al. 2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA Guideline',
      'SPRINT Research Group. N Engl J Med 2015;373:2103-2116'
    ]
  },
  {
    id: 'diabetes-t2',
    condition: 'Type 2 Diabetes Mellitus',
    category: 'Endocrine',
    lastUpdated: '2024',
    source: 'ADA Standards of Care 2024',
    summary: 'Comprehensive diabetes management and glycemic control',
    diagnosis: {
      criteria: [
        'Fasting glucose ≥126 mg/dL (on 2 occasions)',
        'HbA1c ≥6.5% (on 2 occasions)',
        'Random glucose ≥200 mg/dL with symptoms',
        '2-hour OGTT ≥200 mg/dL'
      ],
      tests: [
        'HbA1c (every 3-6 months)',
        'Fasting lipid panel (annually)',
        'Urine albumin-to-creatinine ratio (annually)',
        'Serum creatinine and eGFR (annually)',
        'Comprehensive foot exam (annually)',
        'Dilated eye exam (annually or biannually)'
      ]
    },
    treatment: {
      firstLine: [
        'Metformin 500-2000mg daily (if eGFR >30)',
        'Lifestyle modification (diet, exercise, weight loss)',
        'Diabetes self-management education'
      ],
      secondLine: [
        'GLP-1 agonists (semaglutide, liraglutide) - if ASCVD or high risk',
        'SGLT-2 inhibitors (empagliflozin, dapagliflozin) - if HF or CKD',
        'DPP-4 inhibitors (sitagliptin)',
        'Sulfonylureas (glipizide) - caution for hypoglycemia',
        'Insulin (basal or basal-bolus regimen)'
      ],
      lifestyle: [
        'Medical nutrition therapy (carb counting, portion control)',
        'Weight loss 5-10% (if overweight)',
        'Exercise 150 min/week moderate + 2-3 days resistance',
        'Self-monitoring blood glucose (frequency per provider)',
        'Smoking cessation',
        'Adequate sleep',
        'Stress management'
      ]
    },
    monitoring: {
      frequency: 'Every 3 months until goal HbA1c achieved, then every 6 months',
      parameters: [
        'HbA1c (goal <7% for most, individualized)',
        'Fasting and postprandial glucose',
        'Blood pressure (<130/80 mmHg)',
        'Lipids (LDL <70 mg/dL if high ASCVD risk)',
        'Weight and BMI',
        'Kidney function (eGFR, UACR)',
        'Foot exam',
        'Eye exam'
      ]
    },
    goals: [
      { target: '<7%', metric: 'HbA1c (General)' },
      { target: '<6.5%', metric: 'HbA1c (if achievable without hypoglycemia)' },
      { target: '<8%', metric: 'HbA1c (elderly, comorbidities)' },
      { target: '80-130 mg/dL', metric: 'Fasting Glucose' },
      { target: '<180 mg/dL', metric: 'Postprandial Glucose (2hr)' },
      { target: '<130/80 mmHg', metric: 'Blood Pressure' },
      { target: '<70 mg/dL', metric: 'LDL Cholesterol (if ASCVD)' }
    ],
    redFlags: [
      'Severe hypoglycemia (<54 mg/dL) with confusion',
      'Diabetic ketoacidosis (DKA): nausea, vomiting, fruity breath',
      'Hyperosmolar hyperglycemic state: severe dehydration, confusion',
      'Signs of infection (especially foot ulcers)',
      'Vision changes (possible retinopathy)'
    ],
    references: [
      'American Diabetes Association. Diabetes Care 2024;47(Suppl 1)',
      'UK Prospective Diabetes Study (UKPDS) Group'
    ]
  },
  {
    id: 'hyperlipidemia',
    condition: 'Hyperlipidemia (High Cholesterol)',
    category: 'Cardiovascular',
    lastUpdated: '2024',
    source: 'ACC/AHA Cholesterol Guidelines',
    summary: 'Management of blood cholesterol to reduce ASCVD risk',
    diagnosis: {
      criteria: [
        'LDL ≥190 mg/dL (severe hyperlipidemia)',
        'LDL 160-189 mg/dL (moderate elevation)',
        'LDL 130-159 mg/dL (borderline high)',
        'LDL 100-129 mg/dL (near optimal)',
        'Assess 10-year ASCVD risk with pooled cohort equations'
      ],
      tests: [
        'Fasting lipid panel (TC, LDL, HDL, TG)',
        'Non-HDL cholesterol',
        'ApoB (if triglycerides >200)',
        'Lp(a) (if family history of premature ASCVD)',
        'hsCRP (if intermediate risk)',
        'Coronary artery calcium score (if risk uncertain)'
      ]
    },
    treatment: {
      firstLine: [
        'High-intensity statin: Atorvastatin 40-80mg or Rosuvastatin 20-40mg',
        'Moderate-intensity statin: Atorvastatin 10-20mg, Simvastatin 20-40mg',
        'Goal: ≥50% LDL reduction (high-intensity) or 30-49% (moderate)'
      ],
      secondLine: [
        'Ezetimibe 10mg (add to statin if LDL goal not met)',
        'PCSK9 inhibitors (evolocumab, alirocumab) - if very high risk',
        'Bempedoic acid (if statin intolerant)',
        'Icosapent ethyl (if TG 150-499 on statin)',
        'Fibrates (if TG >500 mg/dL)'
      ],
      lifestyle: [
        'Heart-healthy diet (Mediterranean, DASH)',
        'Reduce saturated fat (<7% of calories)',
        'Eliminate trans fats',
        'Increase soluble fiber (10-25g/day)',
        'Plant stanols/sterols (2g/day)',
        'Weight loss if overweight',
        'Exercise 150 min/week',
        'Smoking cessation'
      ]
    },
    monitoring: {
      frequency: 'Lipids at 4-12 weeks after initiation, then every 3-12 months',
      parameters: [
        'Fasting lipid panel',
        'Liver enzymes (baseline, if symptoms)',
        'CK (if muscle symptoms)',
        'Medication adherence',
        'Side effects (muscle pain, memory issues)'
      ]
    },
    goals: [
      { target: '<70 mg/dL', metric: 'LDL (very high risk: prior ASCVD)' },
      { target: '<100 mg/dL', metric: 'LDL (high risk: diabetes, 10yr risk >20%)' },
      { target: '<130 mg/dL', metric: 'LDL (moderate risk)' },
      { target: '>40 mg/dL (men), >50 mg/dL (women)', metric: 'HDL' },
      { target: '<150 mg/dL', metric: 'Triglycerides' }
    ],
    redFlags: [
      'Severe muscle pain or weakness (possible rhabdomyolysis)',
      'Dark urine',
      'Unexplained fatigue',
      'Chest pain or symptoms of MI'
    ],
    references: [
      'Grundy SM, et al. 2018 AHA/ACC Guideline on Management of Blood Cholesterol',
      'IMPROVE-IT, FOURIER, ODYSSEY Outcomes trials'
    ]
  },
  {
    id: 'asthma',
    condition: 'Asthma',
    category: 'Respiratory',
    lastUpdated: '2024',
    source: 'GINA 2024 Guidelines',
    summary: 'Stepwise management of asthma in adults and adolescents',
    diagnosis: {
      criteria: [
        'History of variable respiratory symptoms (wheeze, SOB, chest tightness, cough)',
        'Variable expiratory airflow limitation',
        'Symptoms worse at night or early morning',
        'Symptoms triggered by exercise, allergens, cold air'
      ],
      tests: [
        'Spirometry with bronchodilator reversibility',
        'Peak expiratory flow (PEF) monitoring',
        'Fractional exhaled nitric oxide (FeNO)',
        'Allergy testing (skin prick or specific IgE)',
        'Chest X-ray (baseline)'
      ]
    },
    treatment: {
      firstLine: [
        'Step 1: As-needed low-dose ICS-formoterol',
        'Step 2: Daily low-dose ICS or as-needed ICS-formoterol',
        'Step 3: Low-dose ICS-LABA daily',
        'Step 4: Medium-dose ICS-LABA',
        'Step 5: High-dose ICS-LABA, add-on therapies'
      ],
      secondLine: [
        'Leukotriene modifiers (montelukast)',
        'Long-acting muscarinic antagonist (tiotropium)',
        'Biologics (omalizumab, mepolizumab, benralizumab) - severe asthma',
        'Oral corticosteroids (short course for exacerbations)'
      ],
      lifestyle: [
        'Identify and avoid triggers',
        'Smoking cessation (critical)',
        'Weight loss if obese',
        'Regular exercise (improves lung function)',
        'Influenza and pneumococcal vaccination',
        'Allergen avoidance (dust mites, pets, mold)',
        'Written asthma action plan'
      ]
    },
    monitoring: {
      frequency: 'Every 3-6 months for stable asthma, more frequent if uncontrolled',
      parameters: [
        'Asthma Control Test (ACT) score',
        'Frequency of rescue inhaler use',
        'Nighttime awakenings',
        'Limitation of activities',
        'Spirometry (annually or when changing therapy)',
        'Medication adherence',
        'Inhaler technique'
      ]
    },
    goals: [
      { target: '≥20', metric: 'ACT Score (controlled)' },
      { target: '<2 days/week', metric: 'Daytime symptoms' },
      { target: '<2 times/week', metric: 'Rescue inhaler use' },
      { target: 'None', metric: 'Nighttime awakenings' },
      { target: 'None', metric: 'Activity limitation' },
      { target: '>80% predicted', metric: 'FEV1' }
    ],
    redFlags: [
      'Severe shortness of breath at rest',
      'Inability to speak full sentences',
      'Blue lips or fingernails',
      'No improvement with rescue inhaler',
      'Peak flow <50% of personal best'
    ],
    references: [
      'Global Initiative for Asthma (GINA). Global Strategy for Asthma Management and Prevention, 2024',
      'National Asthma Education and Prevention Program (NAEPP)'
    ]
  },
  {
    id: 'depression',
    condition: 'Major Depressive Disorder',
    category: 'Mental Health',
    lastUpdated: '2024',
    source: 'APA Practice Guidelines',
    summary: 'Evidence-based treatment of depression in adults',
    diagnosis: {
      criteria: [
        '≥5 symptoms for ≥2 weeks including depressed mood OR anhedonia',
        'Depressed mood most of the day',
        'Anhedonia (loss of interest/pleasure)',
        'Weight/appetite changes',
        'Sleep disturbance (insomnia or hypersomnia)',
        'Psychomotor agitation or retardation',
        'Fatigue or loss of energy',
        'Feelings of worthlessness or guilt',
        'Difficulty concentrating',
        'Recurrent thoughts of death or suicide'
      ],
      tests: [
        'PHQ-9 (Patient Health Questionnaire-9)',
        'GAD-7 (for comorbid anxiety)',
        'Thyroid function tests (TSH)',
        'CBC, CMP (rule out medical causes)',
        'Vitamin D, B12 levels',
        'Substance use screening'
      ]
    },
    treatment: {
      firstLine: [
        'SSRIs: Sertraline 50-200mg, Escitalopram 10-20mg, Fluoxetine 20-80mg',
        'SNRIs: Venlafaxine XR 75-225mg, Duloxetine 60-120mg',
        'Psychotherapy: CBT or IPT (12-16 sessions)',
        'Combined medication + psychotherapy (most effective)'
      ],
      secondLine: [
        'Bupropion SR/XL 150-450mg (if fatigue, smoking)',
        'Mirtazapine 15-45mg (if insomnia, poor appetite)',
        'Tricyclic antidepressants (if others ineffective)',
        'Augmentation: Aripiprazole, quetiapine',
        'TMS (transcranial magnetic stimulation)',
        'ECT (electroconvulsive therapy) - severe/refractory'
      ],
      lifestyle: [
        'Regular exercise (30 min/day, 5 days/week)',
        'Sleep hygiene (7-9 hours, consistent schedule)',
        'Balanced diet (Mediterranean diet)',
        'Social support and connections',
        'Stress reduction (mindfulness, meditation)',
        'Limit alcohol',
        'Light therapy (if seasonal pattern)',
        'Structured daily routine'
      ]
    },
    monitoring: {
      frequency: 'Weekly for first month, then every 2-4 weeks during acute phase',
      parameters: [
        'PHQ-9 score (at each visit)',
        'Suicidal ideation assessment',
        'Medication side effects',
        'Adherence to treatment',
        'Sleep, appetite, energy',
        'Functional improvement (work, relationships)',
        'Response to treatment (50% symptom reduction)',
        'Remission (PHQ-9 <5)'
      ]
    },
    goals: [
      { target: '<5', metric: 'PHQ-9 Score (remission)' },
      { target: '5-9', metric: 'PHQ-9 (minimal symptoms)' },
      { target: '≥50% reduction', metric: 'Symptom Improvement' },
      { target: 'Return to baseline', metric: 'Functional Status' }
    ],
    redFlags: [
      'Active suicidal ideation with plan/intent',
      'Psychotic symptoms',
      'Severe functional impairment',
      'Self-harm behaviors',
      'Substance abuse',
      'Rapid worsening of symptoms'
    ],
    references: [
      'American Psychiatric Association. Practice Guideline for the Treatment of Patients with Major Depressive Disorder',
      'STAR*D Trial: Rush AJ, et al. Am J Psychiatry 2006'
    ]
  }
]

export function ClinicalGuidelines() {
  const [selectedGuideline, setSelectedGuideline] = useState<ClinicalGuideline | null>(
    CLINICAL_GUIDELINES[0]
  )
  const [searchQuery, setSearchQuery] = useState('')

  // Filter guidelines by search
  const filteredGuidelines = CLINICAL_GUIDELINES.filter(g =>
    g.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group by category
  const categories = Array.from(new Set(CLINICAL_GUIDELINES.map(g => g.category)))

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          Clinical Guidelines & Treatment Protocols
        </h1>
        <p className="text-muted-foreground">
          Evidence-based treatment recommendations from leading medical organizations
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conditions or categories..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Guidelines List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Guidelines ({filteredGuidelines.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredGuidelines.map((guideline) => (
                  <Button
                    key={guideline.id}
                    variant={selectedGuideline?.id === guideline.id ? 'default' : 'outline'}
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => setSelectedGuideline(guideline)}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{guideline.condition}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {guideline.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {guideline.lastUpdated}
                        </span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guideline Details */}
        <div className="md:col-span-2">
          {selectedGuideline && (
            <div className="space-y-4">
              {/* Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{selectedGuideline.condition}</CardTitle>
                      <CardDescription className="mt-2">
                        {selectedGuideline.summary}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge>{selectedGuideline.category}</Badge>
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          Updated {selectedGuideline.lastUpdated}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-900">
                      <strong>Source:</strong> {selectedGuideline.source}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="diagnosis">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                  <TabsTrigger value="treatment">Treatment</TabsTrigger>
                  <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                  <TabsTrigger value="goals">Goals</TabsTrigger>
                </TabsList>

                {/* Diagnosis Tab */}
                <TabsContent value="diagnosis">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5" />
                        Diagnostic Criteria & Testing
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold mb-3">Diagnostic Criteria:</h4>
                          <ul className="space-y-2">
                            {selectedGuideline.diagnosis.criteria.map((criterion, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{criterion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Recommended Tests:</h4>
                          <div className="grid gap-2 md:grid-cols-2">
                            {selectedGuideline.diagnosis.tests.map((test, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <FileText className="h-4 w-4 text-gray-600" />
                                <span className="text-sm">{test}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Treatment Tab */}
                <TabsContent value="treatment">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        Treatment Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* First-Line */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Badge className="bg-green-600">First-Line</Badge>
                            Primary Treatment Options
                          </h4>
                          <ul className="space-y-2">
                            {selectedGuideline.treatment.firstLine.map((treatment, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Target className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{treatment}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Second-Line */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Badge className="bg-blue-600">Second-Line</Badge>
                            Alternative/Add-On Therapies
                          </h4>
                          <ul className="space-y-2">
                            {selectedGuideline.treatment.secondLine.map((treatment, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Activity className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{treatment}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Lifestyle */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Badge className="bg-purple-600">Lifestyle</Badge>
                            Non-Pharmacological Interventions
                          </h4>
                          <ul className="space-y-2">
                            {selectedGuideline.treatment.lifestyle.map((intervention, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Heart className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{intervention}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Monitoring Tab */}
                <TabsContent value="monitoring">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Monitoring & Follow-Up
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-1">Follow-Up Schedule:</h4>
                          <p className="text-sm text-blue-800">
                            {selectedGuideline.monitoring.frequency}
                          </p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Parameters to Monitor:</h4>
                          <div className="grid gap-3 md:grid-cols-2">
                            {selectedGuideline.monitoring.parameters.map((param, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm">{param}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Red Flags */}
                        {selectedGuideline.redFlags.length > 0 && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5" />
                              Red Flags - Seek Immediate Care:
                            </h4>
                            <ul className="space-y-1">
                              {selectedGuideline.redFlags.map((flag, idx) => (
                                <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                                  <span>•</span>
                                  {flag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Goals Tab */}
                <TabsContent value="goals">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Treatment Goals & Targets
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedGuideline.goals.map((goal, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{goal.metric}</h4>
                              <Badge className="bg-green-600 text-white">
                                Target: {goal.target}
                              </Badge>
                            </div>
                          </div>
                        ))}

                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mt-6">
                          <h4 className="font-semibold text-green-900 mb-2">
                            Goals should be individualized based on:
                          </h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Patient age and comorbidities</li>
                            <li>• Risk of adverse effects</li>
                            <li>• Patient preferences and values</li>
                            <li>• Life expectancy</li>
                            <li>• Disease severity</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* References */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Key References
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {selectedGuideline.references.map((ref, idx) => (
                      <li key={idx} className="text-muted-foreground">
                        {idx + 1}. {ref}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Clinical Disclaimer:</strong> These guidelines are for educational purposes and
                    should not replace individualized clinical judgment. Treatment should be tailored to each
                    patient based on their specific circumstances, comorbidities, and preferences. Always
                    consult with a healthcare provider for medical advice.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
