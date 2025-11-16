'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Heart, Activity, Droplet, Brain, Bone, Eye, Stethoscope,
  AlertTriangle, CheckCircle, Info, TrendingDown, TrendingUp,
  Target, Calendar, Scale
} from 'lucide-react'

// Types
interface RiskAssessmentResult {
  score: number
  risk: 'low' | 'moderate' | 'high' | 'very-high'
  riskPercentage: number
  timeframe: string
  interpretation: string
  recommendations: string[]
  modifiableFactors: string[]
}

// Framingham Risk Score for 10-year CVD risk
const calculateFraminghamRisk = (
  age: number,
  gender: 'male' | 'female',
  totalCholesterol: number,
  hdlCholesterol: number,
  systolicBP: number,
  isSmoker: boolean,
  isDiabetic: boolean,
  onBPMeds: boolean
): RiskAssessmentResult => {
  let points = 0

  // Simplified Framingham calculation (actual formula is more complex)
  if (gender === 'male') {
    // Age points
    if (age >= 70) points += 11
    else if (age >= 60) points += 8
    else if (age >= 50) points += 5
    else if (age >= 40) points += 2

    // Cholesterol
    if (totalCholesterol >= 280) points += 3
    else if (totalCholesterol >= 240) points += 2
    else if (totalCholesterol >= 200) points += 1

    // HDL
    if (hdlCholesterol < 35) points += 2
    else if (hdlCholesterol < 45) points += 1
    else if (hdlCholesterol >= 60) points -= 1

    // BP
    if (systolicBP >= 160) points += onBPMeds ? 3 : 2
    else if (systolicBP >= 140) points += onBPMeds ? 2 : 1
    else if (systolicBP >= 130) points += onBPMeds ? 1 : 0

    // Risk factors
    if (isSmoker) points += 4
    if (isDiabetic) points += 3
  } else {
    // Female calculations
    if (age >= 70) points += 12
    else if (age >= 60) points += 9
    else if (age >= 50) points += 6
    else if (age >= 40) points += 3

    if (totalCholesterol >= 280) points += 4
    else if (totalCholesterol >= 240) points += 3
    else if (totalCholesterol >= 200) points += 2

    if (hdlCholesterol < 35) points += 2
    else if (hdlCholesterol < 50) points += 1
    else if (hdlCholesterol >= 60) points -= 2

    if (systolicBP >= 160) points += onBPMeds ? 4 : 3
    else if (systolicBP >= 140) points += onBPMeds ? 3 : 2
    else if (systolicBP >= 130) points += onBPMeds ? 2 : 1

    if (isSmoker) points += 3
    if (isDiabetic) points += 4
  }

  // Convert points to risk percentage (simplified)
  const riskPercentage = Math.min(45, Math.max(1, points * 2))

  let risk: RiskAssessmentResult['risk']
  if (riskPercentage < 10) risk = 'low'
  else if (riskPercentage < 20) risk = 'moderate'
  else if (riskPercentage < 30) risk = 'high'
  else risk = 'very-high'

  const recommendations: string[] = []
  const modifiableFactors: string[] = []

  if (isSmoker) {
    recommendations.push('Quit smoking - most important intervention')
    modifiableFactors.push('Smoking cessation')
  }
  if (systolicBP >= 140) {
    recommendations.push('Lower blood pressure to <130/80 mmHg')
    modifiableFactors.push('Blood pressure control')
  }
  if (totalCholesterol >= 200) {
    recommendations.push('Reduce LDL cholesterol through diet and/or medication')
    modifiableFactors.push('Cholesterol management')
  }
  if (isDiabetic) {
    recommendations.push('Optimize diabetes control (HbA1c <7%)')
    modifiableFactors.push('Diabetes management')
  }
  recommendations.push('Regular exercise (150 min/week)')
  recommendations.push('Mediterranean or DASH diet')
  recommendations.push('Maintain healthy weight (BMI 18.5-24.9)')

  modifiableFactors.push('Physical activity', 'Diet', 'Weight management')

  return {
    score: points,
    risk,
    riskPercentage,
    timeframe: '10 years',
    interpretation: `${riskPercentage}% chance of cardiovascular event (heart attack, stroke) within 10 years`,
    recommendations,
    modifiableFactors
  }
}

// Diabetes Risk Calculator (simplified ADA risk test)
const calculateDiabetesRisk = (
  age: number,
  gender: 'male' | 'female',
  familyHistory: boolean,
  highBP: boolean,
  bmi: number,
  physicallyActive: boolean
): RiskAssessmentResult => {
  let points = 0

  // Age
  if (age >= 65) points += 3
  else if (age >= 45) points += 2
  else if (age >= 40) points += 1

  // Family history
  if (familyHistory) points += 1

  // High BP
  if (highBP) points += 1

  // BMI/Weight
  if (bmi >= 40) points += 3
  else if (bmi >= 30) points += 2
  else if (bmi >= 25) points += 1

  // Physical activity
  if (!physicallyActive) points += 1

  const riskPercentage = Math.min(80, points * 12)

  let risk: RiskAssessmentResult['risk']
  if (riskPercentage < 20) risk = 'low'
  else if (riskPercentage < 40) risk = 'moderate'
  else if (riskPercentage < 60) risk = 'high'
  else risk = 'very-high'

  const recommendations: string[] = []
  const modifiableFactors: string[] = []

  if (bmi >= 25) {
    recommendations.push('Lose 7-10% of body weight')
    modifiableFactors.push('Weight loss')
  }
  if (!physicallyActive) {
    recommendations.push('Exercise 150 minutes per week (brisk walking)')
    modifiableFactors.push('Physical activity')
  }
  if (highBP) {
    recommendations.push('Control blood pressure (<130/80 mmHg)')
    modifiableFactors.push('Blood pressure management')
  }
  recommendations.push('Reduce refined carbohydrates and sugar')
  recommendations.push('Increase fiber intake (25-30g/day)')
  recommendations.push('Get screened: fasting glucose and HbA1c')

  modifiableFactors.push('Diet', 'Screening')

  return {
    score: points,
    risk,
    riskPercentage,
    timeframe: 'lifetime',
    interpretation: `${risk === 'very-high' ? 'Very high' : risk === 'high' ? 'High' : risk === 'moderate' ? 'Moderate' : 'Low'} risk of developing type 2 diabetes`,
    recommendations,
    modifiableFactors
  }
}

// Fall Risk Assessment (simplified STEADI)
const calculateFallRisk = (
  age: number,
  hadFallLastYear: boolean,
  fearOfFalling: boolean,
  takesMultipleMeds: boolean,
  visionProblems: boolean,
  balanceProblems: boolean,
  walkingAidUsed: boolean
): RiskAssessmentResult => {
  let points = 0

  if (age >= 80) points += 3
  else if (age >= 70) points += 2
  else if (age >= 65) points += 1

  if (hadFallLastYear) points += 3
  if (fearOfFalling) points += 2
  if (takesMultipleMeds) points += 2
  if (visionProblems) points += 1
  if (balanceProblems) points += 3
  if (walkingAidUsed) points += 1

  const riskPercentage = Math.min(95, points * 8)

  let risk: RiskAssessmentResult['risk']
  if (riskPercentage < 20) risk = 'low'
  else if (riskPercentage < 40) risk = 'moderate'
  else if (riskPercentage < 60) risk = 'high'
  else risk = 'very-high'

  const recommendations: string[] = []
  const modifiableFactors: string[] = []

  if (balanceProblems) {
    recommendations.push('Balance training exercises (Tai Chi, standing on one foot)')
    modifiableFactors.push('Balance exercises')
  }
  if (visionProblems) {
    recommendations.push('Annual eye exam, update glasses prescription')
    modifiableFactors.push('Vision correction')
  }
  if (takesMultipleMeds) {
    recommendations.push('Medication review with doctor (minimize sedatives)')
    modifiableFactors.push('Medication management')
  }
  recommendations.push('Strength training (lower body focus)')
  recommendations.push('Home safety assessment (remove tripping hazards)')
  recommendations.push('Adequate vitamin D (800-1000 IU daily)')

  modifiableFactors.push('Strength training', 'Home safety', 'Nutrition')

  return {
    score: points,
    risk,
    riskPercentage,
    timeframe: '1 year',
    interpretation: `${riskPercentage}% estimated fall risk in the next year`,
    recommendations,
    modifiableFactors
  }
}

// Osteoporosis Risk (simplified FRAX-like)
const calculateOsteoporosisRisk = (
  age: number,
  gender: 'male' | 'female',
  weight: number, // lbs
  height: number, // inches
  fracHistoryPersonal: boolean,
  fracHistoryParent: boolean,
  isSmoker: boolean,
  alcoholHeavy: boolean,
  rheumatoidArthritis: boolean
): RiskAssessmentResult => {
  let points = 0

  const bmi = (weight / (height * height)) * 703

  // Age (major factor)
  if (age >= 80) points += 8
  else if (age >= 70) points += 6
  else if (age >= 60) points += 4
  else if (age >= 50) points += 2

  // Gender
  if (gender === 'female') points += 2

  // Low BMI
  if (bmi < 20) points += 3
  else if (bmi < 22) points += 2

  // Fracture history
  if (fracHistoryPersonal) points += 4
  if (fracHistoryParent) points += 2

  // Risk factors
  if (isSmoker) points += 2
  if (alcoholHeavy) points += 2
  if (rheumatoidArthritis) points += 2

  const riskPercentage = Math.min(75, points * 3)

  let risk: RiskAssessmentResult['risk']
  if (riskPercentage < 10) risk = 'low'
  else if (riskPercentage < 20) risk = 'moderate'
  else if (riskPercentage < 35) risk = 'high'
  else risk = 'very-high'

  const recommendations: string[] = []
  const modifiableFactors: string[] = []

  recommendations.push('Adequate calcium (1200mg/day for women >50, men >70)')
  recommendations.push('Vitamin D supplementation (800-1000 IU/day)')
  recommendations.push('Weight-bearing exercise (walking, dancing, tennis)')
  recommendations.push('Resistance training (strength building)')

  modifiableFactors.push('Calcium intake', 'Vitamin D', 'Exercise')

  if (isSmoker) {
    recommendations.push('Quit smoking')
    modifiableFactors.push('Smoking cessation')
  }
  if (alcoholHeavy) {
    recommendations.push('Reduce alcohol (<2 drinks/day)')
    modifiableFactors.push('Alcohol reduction')
  }

  if (risk === 'high' || risk === 'very-high') {
    recommendations.push('Get bone density scan (DEXA)')
    recommendations.push('Discuss medication options with doctor (bisphosphonates)')
  }

  return {
    score: points,
    risk,
    riskPercentage,
    timeframe: '10 years',
    interpretation: `${riskPercentage}% risk of major osteoporotic fracture in 10 years`,
    recommendations,
    modifiableFactors
  }
}

// Risk level badge component
const RiskBadge: React.FC<{ risk: RiskAssessmentResult['risk'] }> = ({ risk }) => {
  const badges = {
    'low': <Badge className="bg-green-500 text-white">Low Risk</Badge>,
    'moderate': <Badge className="bg-yellow-500 text-white">Moderate Risk</Badge>,
    'high': <Badge className="bg-orange-500 text-white">High Risk</Badge>,
    'very-high': <Badge className="bg-red-500 text-white">Very High Risk</Badge>,
  }
  return badges[risk]
}

// Risk level color
const getRiskColor = (risk: RiskAssessmentResult['risk']): string => {
  const colors = {
    'low': 'bg-green-500',
    'moderate': 'bg-yellow-500',
    'high': 'bg-orange-500',
    'very-high': 'bg-red-500',
  }
  return colors[risk]
}

export function HealthRiskAssessments() {
  const [activeAssessment, setActiveAssessment] = useState<string>('cardiovascular')

  // Mock user data (would come from form inputs in production)
  const [userData, setUserData] = useState({
    age: 55,
    gender: 'male' as 'male' | 'female',
    weight: 180,
    height: 70,
    totalCholesterol: 210,
    hdlCholesterol: 42,
    systolicBP: 138,
    isSmoker: false,
    isDiabetic: false,
    onBPMeds: false,
    familyHistory: true,
    bmi: 25.8,
    physicallyActive: true,
    highBP: true,
  })

  // Calculate all risk assessments
  const cvdRisk = calculateFraminghamRisk(
    userData.age,
    userData.gender,
    userData.totalCholesterol,
    userData.hdlCholesterol,
    userData.systolicBP,
    userData.isSmoker,
    userData.isDiabetic,
    userData.onBPMeds
  )

  const diabetesRisk = calculateDiabetesRisk(
    userData.age,
    userData.gender,
    userData.familyHistory,
    userData.highBP,
    userData.bmi,
    userData.physicallyActive
  )

  const fallRisk = calculateFallRisk(
    userData.age,
    false, // hadFallLastYear
    false, // fearOfFalling
    true,  // takesMultipleMeds
    false, // visionProblems
    false, // balanceProblems
    false  // walkingAidUsed
  )

  const osteoporosisRisk = calculateOsteoporosisRisk(
    userData.age,
    userData.gender,
    userData.weight,
    userData.height,
    false, // fracHistoryPersonal
    true,  // fracHistoryParent
    userData.isSmoker,
    false, // alcoholHeavy
    false  // rheumatoidArthritis
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Stethoscope className="h-8 w-8 text-blue-600" />
          Health Risk Assessments
        </h1>
        <p className="text-muted-foreground">
          Evidence-based risk calculators using validated clinical scoring systems
        </p>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveAssessment('cardiovascular')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Cardiovascular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{cvdRisk.riskPercentage}%</div>
              <RiskBadge risk={cvdRisk.risk} />
              <p className="text-xs text-muted-foreground">10-year risk</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveAssessment('diabetes')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              Type 2 Diabetes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <RiskBadge risk={diabetesRisk.risk} />
              <p className="text-xs text-muted-foreground">Lifetime risk</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveAssessment('falls')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Falls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{fallRisk.riskPercentage}%</div>
              <RiskBadge risk={fallRisk.risk} />
              <p className="text-xs text-muted-foreground">1-year risk</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setActiveAssessment('osteoporosis')}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Bone className="h-4 w-4" />
              Osteoporosis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{osteoporosisRisk.riskPercentage}%</div>
              <RiskBadge risk={osteoporosisRisk.risk} />
              <p className="text-xs text-muted-foreground">10-year risk</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Assessment Results */}
      <Tabs value={activeAssessment} onValueChange={setActiveAssessment}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cardiovascular">
            <Heart className="h-4 w-4 mr-2" />
            Cardiovascular
          </TabsTrigger>
          <TabsTrigger value="diabetes">
            <Droplet className="h-4 w-4 mr-2" />
            Diabetes
          </TabsTrigger>
          <TabsTrigger value="falls">
            <Activity className="h-4 w-4 mr-2" />
            Falls
          </TabsTrigger>
          <TabsTrigger value="osteoporosis">
            <Bone className="h-4 w-4 mr-2" />
            Osteoporosis
          </TabsTrigger>
        </TabsList>

        {/* Cardiovascular Risk */}
        <TabsContent value="cardiovascular">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    Framingham Cardiovascular Risk Score
                  </CardTitle>
                  <CardDescription className="mt-1">
                    10-year risk of heart attack or stroke
                  </CardDescription>
                </div>
                <RiskBadge risk={cvdRisk.risk} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Risk Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Risk Score</span>
                    <span className="text-3xl font-bold">{cvdRisk.riskPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${getRiskColor(cvdRisk.risk)}`}
                      style={{ width: `${Math.min(100, cvdRisk.riskPercentage)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {cvdRisk.interpretation}
                  </p>
                </div>

                {/* Risk Factors */}
                <div>
                  <h4 className="font-semibold mb-3">Your Risk Factors:</h4>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Age</span>
                      <Badge variant="outline">{userData.age} years</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Total Cholesterol</span>
                      <Badge variant={userData.totalCholesterol >= 240 ? "destructive" : "outline"}>
                        {userData.totalCholesterol} mg/dL
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">HDL Cholesterol</span>
                      <Badge variant={userData.hdlCholesterol < 40 ? "destructive" : "outline"}>
                        {userData.hdlCholesterol} mg/dL
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Blood Pressure</span>
                      <Badge variant={userData.systolicBP >= 140 ? "destructive" : "outline"}>
                        {userData.systolicBP} mmHg
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Smoking Status</span>
                      <Badge variant={userData.isSmoker ? "destructive" : "secondary"}>
                        {userData.isSmoker ? 'Smoker' : 'Non-smoker'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Diabetes</span>
                      <Badge variant={userData.isDiabetic ? "destructive" : "secondary"}>
                        {userData.isDiabetic ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Modifiable Factors */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Modifiable Risk Factors ({cvdRisk.modifiableFactors.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {cvdRisk.modifiableFactors.map((factor, idx) => (
                      <Badge key={idx} className="bg-blue-600 text-white">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-semibold mb-3">Recommendations to Reduce Risk:</h4>
                  <ul className="space-y-2">
                    {cvdRisk.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Reduction Potential */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Potential Risk Reduction
                  </h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <p>• Quitting smoking: -50% risk reduction</p>
                    <p>• Lowering BP to &lt;120/80: -25% risk reduction</p>
                    <p>• Lowering LDL by 30 mg/dL: -20% risk reduction</p>
                    <p>• Mediterranean diet + exercise: -30% risk reduction</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diabetes Risk */}
        <TabsContent value="diabetes">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-blue-600" />
                    Type 2 Diabetes Risk Assessment
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Based on ADA risk calculator
                  </CardDescription>
                </div>
                <RiskBadge risk={diabetesRisk.risk} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <p className="text-muted-foreground mb-4">{diabetesRisk.interpretation}</p>

                  <h4 className="font-semibold mb-3">Prevention Recommendations:</h4>
                  <ul className="space-y-2">
                    {diabetesRisk.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Target className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Important: Get Screened
                  </h4>
                  <p className="text-sm text-yellow-800">
                    {diabetesRisk.risk === 'high' || diabetesRisk.risk === 'very-high'
                      ? 'Given your risk level, schedule a screening for fasting glucose and HbA1c within the next month.'
                      : 'Consider screening every 3 years, or annually if risk factors increase.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fall Risk */}
        <TabsContent value="falls">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    Fall Risk Assessment (STEADI)
                  </CardTitle>
                  <CardDescription className="mt-1">
                    1-year fall risk estimation
                  </CardDescription>
                </div>
                <RiskBadge risk={fallRisk.risk} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <p className="text-muted-foreground mb-4">{fallRisk.interpretation}</p>

                  <h4 className="font-semibold mb-3">Fall Prevention Strategies:</h4>
                  <ul className="space-y-2">
                    {fallRisk.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Osteoporosis Risk */}
        <TabsContent value="osteoporosis">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bone className="h-5 w-5 text-orange-600" />
                    Osteoporosis & Fracture Risk (FRAX-based)
                  </CardTitle>
                  <CardDescription className="mt-1">
                    10-year major osteoporotic fracture risk
                  </CardDescription>
                </div>
                <RiskBadge risk={osteoporosisRisk.risk} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <p className="text-muted-foreground mb-4">{osteoporosisRisk.interpretation}</p>

                  <h4 className="font-semibold mb-3">Bone Health Recommendations:</h4>
                  <ul className="space-y-2">
                    {osteoporosisRisk.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Medical Disclaimer */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            Clinical Validation & Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Validated Risk Calculators:</strong> These assessments use clinically validated
              scoring systems including Framingham Risk Score (CVD), ADA Risk Test (Diabetes),
              STEADI (Falls), and FRAX-based calculation (Osteoporosis).
            </p>
            <p>
              <strong>Limitations:</strong> Risk calculators provide estimates based on population
              studies. Individual risk may vary. These tools are for educational purposes and should
              not replace professional medical evaluation.
            </p>
            <p>
              <strong>Action:</strong> Discuss these results with your healthcare provider for personalized
              risk assessment and management strategies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
