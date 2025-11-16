// Chronic Disease Management Module
// Research: 86% of chronic disease apps include self-management features
// Digital health interventions reduce HbA1c by 0.3-0.5% in diabetes
// Apps improve medication adherence by 40-60%

import type { HealthMetric, MetricType } from './types';

// ==================== DIABETES MANAGEMENT ====================

export interface DiabetesProfile {
  type: 'type1' | 'type2' | 'gestational' | 'prediabetes';
  diagnosisDate: string;
  targetGlucoseRange: { min: number; max: number }; // mg/dL
  targetA1C: number; // %
  insulinRegimen?: 'basal_bolus' | 'pump' | 'multiple_daily' | 'none';
  medications: string[];
  complications?: ('retinopathy' | 'neuropathy' | 'nephropathy' | 'cardiovascular')[];
}

export interface InsulinDose {
  id: string;
  timestamp: string;
  type: 'rapid' | 'short' | 'intermediate' | 'long';
  units: number;
  insulinName: string;
  carbsConsumed?: number;
  glucoseAtTime?: number;
  notes?: string;
}

export interface DiabetesInsights {
  timeInRange: number; // Percentage of readings in target range
  averageGlucose: number; // mg/dL
  glucoseVariability: number; // Coefficient of variation
  hypoglycemiaEvents: number; // Readings < 70 mg/dL
  hyperglycemiaEvents: number; // Readings > 180 mg/dL
  estimatedA1C: number; // Calculated from average glucose
  trends: {
    fasting: 'improving' | 'stable' | 'worsening';
    postprandial: 'improving' | 'stable' | 'worsening';
  };
  recommendations: string[];
  alerts: string[];
}

// Calculate Time in Range (TIR) - Gold standard metric for diabetes management
export function calculateTimeInRange(
  glucoseReadings: HealthMetric[],
  targetRange: { min: number; max: number } = { min: 70, max: 180 }
): {
  timeInRange: number;
  timeBelowRange: number;
  timeAboveRange: number;
  veryLow: number; // < 54 mg/dL
  veryHigh: number; // > 250 mg/dL
} {
  if (glucoseReadings.length === 0) {
    return { timeInRange: 0, timeBelowRange: 0, timeAboveRange: 0, veryLow: 0, veryHigh: 0 };
  }

  const inRange = glucoseReadings.filter((r) => r.value >= targetRange.min && r.value <= targetRange.max).length;
  const belowRange = glucoseReadings.filter((r) => r.value < targetRange.min).length;
  const aboveRange = glucoseReadings.filter((r) => r.value > targetRange.max).length;
  const veryLow = glucoseReadings.filter((r) => r.value < 54).length;
  const veryHigh = glucoseReadings.filter((r) => r.value > 250).length;

  const total = glucoseReadings.length;

  return {
    timeInRange: Math.round((inRange / total) * 100),
    timeBelowRange: Math.round((belowRange / total) * 100),
    timeAboveRange: Math.round((aboveRange / total) * 100),
    veryLow: Math.round((veryLow / total) * 100),
    veryHigh: Math.round((veryHigh / total) * 100),
  };
}

// Estimate A1C from average glucose (Nathan et al. formula)
export function estimateA1CFromGlucose(averageGlucoseMgDl: number): number {
  // A1C = (average glucose + 46.7) / 28.7
  return Math.round(((averageGlucoseMgDl + 46.7) / 28.7) * 10) / 10;
}

// Calculate glucose variability (coefficient of variation)
export function calculateGlucoseVariability(glucoseReadings: HealthMetric[]): number {
  if (glucoseReadings.length < 2) return 0;

  const values = glucoseReadings.map((r) => r.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return mean > 0 ? Math.round((stdDev / mean) * 100) : 0;
}

// Generate diabetes insights
export function generateDiabetesInsights(
  glucoseReadings: HealthMetric[],
  profile: DiabetesProfile
): DiabetesInsights {
  const recommendations: string[] = [];
  const alerts: string[] = [];

  if (glucoseReadings.length === 0) {
    return {
      timeInRange: 0,
      averageGlucose: 0,
      glucoseVariability: 0,
      hypoglycemiaEvents: 0,
      hyperglycemiaEvents: 0,
      estimatedA1C: 0,
      trends: { fasting: 'stable', postprandial: 'stable' },
      recommendations: ['Start tracking glucose regularly to gain insights.'],
      alerts: [],
    };
  }

  const tir = calculateTimeInRange(glucoseReadings, profile.targetGlucoseRange);
  const averageGlucose = Math.round(
    glucoseReadings.reduce((sum, r) => sum + r.value, 0) / glucoseReadings.length
  );
  const glucoseVariability = calculateGlucoseVariability(glucoseReadings);
  const estimatedA1C = estimateA1CFromGlucose(averageGlucose);

  const hypoglycemiaEvents = glucoseReadings.filter((r) => r.value < 70).length;
  const hyperglycemiaEvents = glucoseReadings.filter((r) => r.value > 180).length;

  // Time in Range insights
  if (tir.timeInRange >= 70) {
    recommendations.push('✅ Excellent glucose control! Time in range > 70%. Keep it up!');
  } else if (tir.timeInRange >= 50) {
    recommendations.push('📊 Good progress. Aim for >70% time in range for optimal control.');
  } else {
    alerts.push('⚠️ Low time in range. Review diet, medications, and activity with your doctor.');
  }

  // Hypoglycemia alerts
  if (tir.veryLow > 0) {
    alerts.push('🚨 SEVERE HYPOGLYCEMIA detected (<54 mg/dL). Review with doctor immediately.');
  } else if (tir.timeBelowRange > 4) {
    alerts.push('⚠️ Frequent low glucose. Consider reducing medication or adjusting carb intake.');
  }

  // Hyperglycemia alerts
  if (tir.veryHigh > 5) {
    alerts.push('⚠️ Frequent very high glucose (>250 mg/dL). Check ketones and contact doctor.');
  } else if (tir.timeAboveRange > 25) {
    recommendations.push('High glucose levels detected. Review carb counting and medication timing.');
  }

  // Variability insights
  if (glucoseVariability > 36) {
    recommendations.push('High glucose variability. Focus on consistent meal timing and carb portions.');
  } else if (glucoseVariability < 33) {
    recommendations.push('Good glucose stability. Consistency is key to diabetes management.');
  }

  // A1C insights
  if (estimatedA1C > profile.targetA1C + 1) {
    alerts.push(`Estimated A1C (${estimatedA1C}%) above target. Discuss treatment adjustment with doctor.`);
  } else if (estimatedA1C <= profile.targetA1C) {
    recommendations.push(`🎯 Estimated A1C (${estimatedA1C}%) at or below target!`);
  }

  // Fasting vs postprandial trends (simplified - would need timestamps)
  const trends = {
    fasting: 'stable' as const,
    postprandial: 'stable' as const,
  };

  return {
    timeInRange: tir.timeInRange,
    averageGlucose,
    glucoseVariability,
    hypoglycemiaEvents,
    hyperglycemiaEvents,
    estimatedA1C,
    trends,
    recommendations,
    alerts,
  };
}

// ==================== HYPERTENSION MANAGEMENT ====================

export interface HypertensionProfile {
  stage: 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis';
  targetSystolic: number; // mmHg
  targetDiastolic: number; // mmHg
  medications: string[];
  diagnosisDate?: string;
  riskFactors?: ('smoking' | 'diabetes' | 'high_cholesterol' | 'obesity' | 'family_history')[];
}

export interface BloodPressureInsights {
  averageSystolic: number;
  averageDiastolic: number;
  currentStage: HypertensionProfile['stage'];
  readingsInTarget: number; // percentage
  highReadings: number; // count
  trend: 'improving' | 'stable' | 'worsening';
  variability: 'low' | 'moderate' | 'high';
  recommendations: string[];
  alerts: string[];
}

// Classify blood pressure stage (per AHA 2017 guidelines)
export function classifyBloodPressureStage(systolic: number, diastolic: number): HypertensionProfile['stage'] {
  if (systolic >= 180 || diastolic >= 120) {
    return 'crisis';
  } else if (systolic >= 140 || diastolic >= 90) {
    return 'stage2';
  } else if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return 'stage1';
  } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return 'elevated';
  } else {
    return 'normal';
  }
}

// Generate hypertension insights
export function generateHypertensionInsights(
  bpReadings: { systolic: number; diastolic: number; date: string }[],
  profile: HypertensionProfile
): BloodPressureInsights {
  const recommendations: string[] = [];
  const alerts: string[] = [];

  if (bpReadings.length === 0) {
    return {
      averageSystolic: 0,
      averageDiastolic: 0,
      currentStage: 'normal',
      readingsInTarget: 0,
      highReadings: 0,
      trend: 'stable',
      variability: 'low',
      recommendations: ['Start tracking blood pressure regularly.'],
      alerts: [],
    };
  }

  const avgSystolic = Math.round(bpReadings.reduce((sum, r) => sum + r.systolic, 0) / bpReadings.length);
  const avgDiastolic = Math.round(bpReadings.reduce((sum, r) => sum + r.diastolic, 0) / bpReadings.length);

  const currentStage = classifyBloodPressureStage(avgSystolic, avgDiastolic);

  const inTargetCount = bpReadings.filter(
    (r) => r.systolic <= profile.targetSystolic && r.diastolic <= profile.targetDiastolic
  ).length;
  const readingsInTarget = Math.round((inTargetCount / bpReadings.length) * 100);

  const highReadings = bpReadings.filter(
    (r) => r.systolic >= 140 || r.diastolic >= 90
  ).length;

  // Calculate variability
  const systolicStdDev = Math.sqrt(
    bpReadings.reduce((sum, r) => sum + Math.pow(r.systolic - avgSystolic, 2), 0) / bpReadings.length
  );
  const variability = systolicStdDev < 10 ? 'low' : systolicStdDev < 15 ? 'moderate' : 'high';

  // Trend (simplified - compare first half vs second half)
  let trend: 'improving' | 'stable' | 'worsening' = 'stable';
  if (bpReadings.length >= 10) {
    const midpoint = Math.floor(bpReadings.length / 2);
    const firstHalfAvg = bpReadings.slice(0, midpoint).reduce((sum, r) => sum + r.systolic, 0) / midpoint;
    const secondHalfAvg = bpReadings.slice(midpoint).reduce((sum, r) => sum + r.systolic, 0) / (bpReadings.length - midpoint);
    const change = firstHalfAvg - secondHalfAvg;
    if (change > 5) trend = 'improving';
    else if (change < -5) trend = 'worsening';
  }

  // Stage-specific insights
  switch (currentStage) {
    case 'crisis':
      alerts.push('🚨 HYPERTENSIVE CRISIS! Seek emergency medical care immediately!');
      break;
    case 'stage2':
      alerts.push('⚠️ Stage 2 Hypertension. Medication may be needed. Consult your doctor.');
      recommendations.push('Reduce sodium intake to <1500mg/day.');
      recommendations.push('Increase physical activity to 150 min/week.');
      break;
    case 'stage1':
      recommendations.push('Stage 1 Hypertension. Lifestyle changes essential.');
      recommendations.push('DASH diet, regular exercise, stress management.');
      break;
    case 'elevated':
      recommendations.push('Elevated BP. Prevent progression with lifestyle changes.');
      recommendations.push('Weight loss if overweight, reduce alcohol, quit smoking.');
      break;
    case 'normal':
      recommendations.push('✅ Blood pressure in normal range! Maintain healthy habits.');
      break;
  }

  // Variability insights
  if (variability === 'high') {
    recommendations.push('High BP variability detected. Measure at same time daily, reduce stress.');
  }

  // Target achievement
  if (readingsInTarget >= 80) {
    recommendations.push('🎯 Excellent control! 80%+ readings at target.');
  } else if (readingsInTarget < 50) {
    alerts.push('Less than 50% of readings at target. Review treatment plan with doctor.');
  }

  return {
    averageSystolic: avgSystolic,
    averageDiastolic: avgDiastolic,
    currentStage,
    readingsInTarget,
    highReadings,
    trend,
    variability,
    recommendations,
    alerts,
  };
}

// ==================== HEART DISEASE MANAGEMENT ====================

export interface CardiacProfile {
  condition: 'coronary_artery' | 'heart_failure' | 'arrhythmia' | 'valve_disease' | 'post_mi';
  ejectionFraction?: number; // % (for heart failure)
  nyhaClass?: 1 | 2 | 3 | 4; // Heart failure classification
  medications: string[];
  lastCardiacEvent?: string; // date
  implantedDevices?: ('pacemaker' | 'icd' | 'crt')[];
}

export interface CardiacInsights {
  riskLevel: 'low' | 'moderate' | 'high' | 'very_high';
  keyMetrics: {
    avgHeartRate?: number;
    avgBloodPressure?: { systolic: number; diastolic: number };
    recentWeight?: { value: number; trend: 'stable' | 'increasing' | 'decreasing' };
  };
  recommendations: string[];
  alerts: string[];
  emergencyWarnings: string[];
}

// Generate cardiac insights
export function generateCardiacInsights(
  metrics: HealthMetric[],
  profile: CardiacProfile
): CardiacInsights {
  const recommendations: string[] = [];
  const alerts: string[] = [];
  const emergencyWarnings: string[] = [];

  // Heart rate analysis
  const heartRateReadings = metrics.filter((m) => m.type === 'heart_rate');
  const avgHeartRate = heartRateReadings.length > 0
    ? Math.round(heartRateReadings.reduce((sum, r) => sum + r.value, 0) / heartRateReadings.length)
    : undefined;

  if (avgHeartRate) {
    if (avgHeartRate > 100) {
      alerts.push('⚠️ Elevated resting heart rate. Monitor for symptoms and contact doctor if persistent.');
    } else if (avgHeartRate < 50 && !profile.medications.includes('beta-blocker')) {
      alerts.push('Low heart rate detected. Report to your doctor.');
    }
  }

  // Weight monitoring (critical for heart failure)
  const weightReadings = metrics.filter((m) => m.type === 'weight').sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (weightReadings.length >= 2 && profile.condition === 'heart_failure') {
    const recentWeight = weightReadings[0].value;
    const previousWeight = weightReadings[weightReadings.length - 1].value;
    const weightChange = recentWeight - previousWeight;
    const daysSpan = Math.abs(
      (new Date(weightReadings[0].date).getTime() - new Date(weightReadings[weightReadings.length - 1].date).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (weightChange > 2 && daysSpan <= 3) {
      emergencyWarnings.push('🚨 Rapid weight gain (>2kg in 3 days). Contact doctor immediately - possible fluid retention!');
    } else if (weightChange > 3 && daysSpan <= 7) {
      alerts.push('⚠️ Significant weight gain. May indicate worsening heart failure. Call your doctor.');
    }
  }

  // Risk stratification
  let riskLevel: CardiacInsights['riskLevel'] = 'moderate';
  if (profile.condition === 'post_mi' || profile.condition === 'heart_failure') {
    if (profile.ejectionFraction && profile.ejectionFraction < 30) {
      riskLevel = 'very_high';
    } else if (profile.nyhaClass && profile.nyhaClass >= 3) {
      riskLevel = 'high';
    }
  }

  // General recommendations
  recommendations.push('Monitor symptoms: chest pain, shortness of breath, fatigue, swelling.');
  recommendations.push('Cardiac rehab and gentle exercise as tolerated.');
  recommendations.push('Low-sodium diet (<2000mg/day for heart failure).');
  recommendations.push('Take medications exactly as prescribed.');

  if (profile.condition === 'heart_failure') {
    recommendations.push('Weigh yourself daily at the same time. Report gain >2kg in 3 days.');
    recommendations.push('Limit fluids to 1.5-2L/day if advised by doctor.');
  }

  return {
    riskLevel,
    keyMetrics: {
      avgHeartRate,
      recentWeight: weightReadings.length > 0 ? {
        value: weightReadings[0].value,
        trend: 'stable',
      } : undefined,
    },
    recommendations,
    alerts,
    emergencyWarnings,
  };
}

// ==================== RESPIRATORY DISEASE MANAGEMENT ====================

export interface RespiratoryProfile {
  condition: 'asthma' | 'copd' | 'pulmonary_fibrosis';
  severity: 'mild' | 'moderate' | 'severe';
  triggers?: string[];
  medications: {
    controller?: string[]; // Daily prevention
    rescue?: string[]; // Quick relief
  };
  personalBestPeakFlow?: number; // L/min
}

export interface RespiratoryInsights {
  peakFlowZone?: 'green' | 'yellow' | 'red';
  averagePeakFlow?: number;
  rescueInhalerUse: 'normal' | 'increased' | 'excessive';
  exacerbationRisk: 'low' | 'moderate' | 'high';
  recommendations: string[];
  alerts: string[];
}

// Calculate peak flow zone (traffic light system)
export function calculatePeakFlowZone(
  currentPeakFlow: number,
  personalBest: number
): 'green' | 'yellow' | 'red' {
  const percentage = (currentPeakFlow / personalBest) * 100;

  if (percentage >= 80) return 'green'; // Good control
  if (percentage >= 50) return 'yellow'; // Caution
  return 'red'; // Medical alert
}

// Generate respiratory insights
export function generateRespiratoryInsights(
  peakFlowReadings: { value: number; date: string }[],
  profile: RespiratoryProfile
): RespiratoryInsights {
  const recommendations: string[] = [];
  const alerts: string[] = [];

  let peakFlowZone: 'green' | 'yellow' | 'red' | undefined;
  let averagePeakFlow: number | undefined;

  if (peakFlowReadings.length > 0 && profile.personalBestPeakFlow) {
    const latest = peakFlowReadings[0];
    peakFlowZone = calculatePeakFlowZone(latest.value, profile.personalBestPeakFlow);
    averagePeakFlow = Math.round(
      peakFlowReadings.reduce((sum, r) => sum + r.value, 0) / peakFlowReadings.length
    );

    if (peakFlowZone === 'red') {
      alerts.push('🚨 RED ZONE! Peak flow <50% of personal best. Use rescue inhaler and seek medical care!');
    } else if (peakFlowZone === 'yellow') {
      alerts.push('⚠️ YELLOW ZONE. Symptoms worsening. Follow your asthma action plan.');
    } else {
      recommendations.push('✅ GREEN ZONE. Good asthma control. Continue current treatment.');
    }
  }

  // General recommendations
  if (profile.condition === 'asthma') {
    recommendations.push('Use peak flow meter daily, especially if symptomatic.');
    recommendations.push('Avoid known triggers: ' + (profile.triggers?.join(', ') || 'identify yours'));
    recommendations.push('Take controller medications daily, even when feeling well.');
    recommendations.push('Always carry rescue inhaler.');
  } else if (profile.condition === 'copd') {
    recommendations.push('Pulmonary rehabilitation and breathing exercises.');
    recommendations.push('Avoid respiratory infections - get vaccinated (flu, pneumonia, COVID).');
    recommendations.push('Quit smoking if applicable - single most important action.');
    recommendations.push('Monitor for exacerbations: increased sputum, color change, worsening breathlessness.');
  }

  const exacerbationRisk: RespiratoryInsights['exacerbationRisk'] =
    peakFlowZone === 'red' ? 'high' :
    peakFlowZone === 'yellow' ? 'moderate' : 'low';

  return {
    peakFlowZone,
    averagePeakFlow,
    rescueInhalerUse: 'normal', // Would track from medication logs
    exacerbationRisk,
    recommendations,
    alerts,
  };
}

// ==================== MEDICATION ADHERENCE ====================

export interface MedicationAdherence {
  medicationId: string;
  medicationName: string;
  prescribed: number; // doses per day/week
  taken: number; // actual doses taken
  adherenceRate: number; // percentage
  missedDoses: { date: string; reason?: string }[];
}

export function calculateMedicationAdherence(
  scheduledDoses: number,
  takenDoses: number
): number {
  if (scheduledDoses === 0) return 0;
  return Math.round((takenDoses / scheduledDoses) * 100);
}

export function generateAdherenceInsights(adherenceRate: number): string[] {
  const insights: string[] = [];

  if (adherenceRate >= 90) {
    insights.push('✅ Excellent medication adherence! Keep it up.');
  } else if (adherenceRate >= 80) {
    insights.push('Good adherence. Aim for >90% for optimal results.');
  } else if (adherenceRate >= 60) {
    insights.push('⚠️ Medication adherence below target. Set reminders or use a pill organizer.');
  } else {
    insights.push('🚨 Poor medication adherence. This can worsen your condition. Discuss barriers with your doctor.');
  }

  return insights;
}
