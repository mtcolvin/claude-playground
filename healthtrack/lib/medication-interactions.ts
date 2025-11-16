// Medication Interaction Checker
// Research: DrugBank contains 1.3M+ drug-drug interactions
// 30% of adverse drug events are preventable
// Drug interaction checkers reduce medication errors by 50%

export type InteractionSeverity = 'minor' | 'moderate' | 'major' | 'contraindicated';
export type InteractionType = 'drug_drug' | 'drug_food' | 'drug_condition' | 'drug_supplement';

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  rxcui?: string; // RxNorm Concept Unique Identifier
  dosage: string;
  frequency: string;
  route: 'oral' | 'injection' | 'topical' | 'inhalation' | 'other';
  startDate: string;
  endDate?: string;
  prescribedBy?: string;
  purpose: string;
  sideEffects?: string[];
}

export interface DrugInteraction {
  id: string;
  drug1: string;
  drug2: string;
  severity: InteractionSeverity;
  type: InteractionType;
  description: string;
  clinicalEffects: string[];
  management: string;
  documentation: 'excellent' | 'good' | 'fair' | 'poor';
  references?: string[];
}

export interface FoodInteraction {
  drug: string;
  food: string;
  severity: InteractionSeverity;
  description: string;
  recommendation: string;
  examples: string[];
}

export interface ConditionInteraction {
  drug: string;
  condition: string;
  severity: InteractionSeverity;
  description: string;
  monitoring: string;
  contraindicated: boolean;
}

export interface InteractionCheckResult {
  hasInteractions: boolean;
  totalInteractions: number;
  byType: {
    drug_drug: number;
    drug_food: number;
    drug_condition: number;
    drug_supplement: number;
  };
  bySeverity: {
    minor: number;
    moderate: number;
    major: number;
    contraindicated: number;
  };
  interactions: (DrugInteraction | FoodInteraction | ConditionInteraction)[];
  recommendations: string[];
  alerts: string[];
}

export interface SideEffect {
  medication: string;
  effect: string;
  frequency: 'very_common' | 'common' | 'uncommon' | 'rare' | 'very_rare';
  severity: 'mild' | 'moderate' | 'severe';
  reported: boolean;
  reportedDate?: string;
}

// ==================== COMMON DRUG-DRUG INTERACTIONS ====================
// This is a simplified database - in production, would use DrugBank API or FDA OpenFDA

export const KNOWN_DRUG_INTERACTIONS: DrugInteraction[] = [
  {
    id: 'warfarin_aspirin',
    drug1: 'warfarin',
    drug2: 'aspirin',
    severity: 'major',
    type: 'drug_drug',
    description: 'Increased risk of bleeding',
    clinicalEffects: ['Gastrointestinal bleeding', 'Intracranial hemorrhage', 'Prolonged bleeding time'],
    management: 'Avoid combination if possible. If necessary, monitor INR closely and watch for signs of bleeding.',
    documentation: 'excellent',
  },
  {
    id: 'metformin_contrast',
    drug1: 'metformin',
    drug2: 'iodinated contrast',
    severity: 'major',
    type: 'drug_drug',
    description: 'Risk of lactic acidosis',
    clinicalEffects: ['Lactic acidosis', 'Acute kidney injury'],
    management: 'Hold metformin 48 hours before and after contrast administration. Check kidney function.',
    documentation: 'excellent',
  },
  {
    id: 'ace_nsaid',
    drug1: 'lisinopril',
    drug2: 'ibuprofen',
    severity: 'moderate',
    type: 'drug_drug',
    description: 'Reduced antihypertensive effect and increased kidney risk',
    clinicalEffects: ['Decreased blood pressure control', 'Acute kidney injury', 'Hyperkalemia'],
    management: 'Monitor blood pressure and kidney function. Consider alternative pain reliever (acetaminophen).',
    documentation: 'good',
  },
  {
    id: 'statin_grapefruit',
    drug1: 'atorvastatin',
    drug2: 'simvastatin',
    severity: 'moderate',
    type: 'drug_drug',
    description: 'Increased risk of muscle toxicity when combined',
    clinicalEffects: ['Myopathy', 'Rhabdomyolysis', 'Elevated creatine kinase'],
    management: 'Avoid combining multiple statins. Use single agent at appropriate dose.',
    documentation: 'excellent',
  },
  {
    id: 'ssri_nsaid',
    drug1: 'sertraline',
    drug2: 'ibuprofen',
    severity: 'moderate',
    type: 'drug_drug',
    description: 'Increased bleeding risk',
    clinicalEffects: ['GI bleeding', 'Bruising', 'Nosebleeds'],
    management: 'Use NSAID cautiously. Consider PPI for GI protection. Use acetaminophen when possible.',
    documentation: 'good',
  },
  {
    id: 'digoxin_loop',
    drug1: 'digoxin',
    drug2: 'furosemide',
    severity: 'moderate',
    type: 'drug_drug',
    description: 'Hypokalemia increases digoxin toxicity risk',
    clinicalEffects: ['Digoxin toxicity', 'Arrhythmias', 'Nausea'],
    management: 'Monitor potassium and digoxin levels. Replace potassium as needed.',
    documentation: 'excellent',
  },
  {
    id: 'warfarin_antibiotics',
    drug1: 'warfarin',
    drug2: 'sulfamethoxazole',
    severity: 'major',
    type: 'drug_drug',
    description: 'Increased anticoagulation effect',
    clinicalEffects: ['Excessive bleeding', 'Elevated INR'],
    management: 'Monitor INR closely. May need warfarin dose reduction during antibiotic course.',
    documentation: 'excellent',
  },
];

// ==================== DRUG-FOOD INTERACTIONS ====================

export const KNOWN_FOOD_INTERACTIONS: FoodInteraction[] = [
  {
    drug: 'warfarin',
    food: 'Vitamin K-rich foods',
    severity: 'moderate',
    description: 'High vitamin K intake reduces warfarin effectiveness',
    recommendation: 'Maintain consistent intake of leafy greens, don\'t avoid entirely.',
    examples: ['Kale', 'Spinach', 'Broccoli', 'Brussels sprouts', 'Collard greens'],
  },
  {
    drug: 'atorvastatin',
    food: 'Grapefruit',
    severity: 'major',
    description: 'Grapefruit increases statin levels, raising risk of muscle damage',
    recommendation: 'Avoid grapefruit and grapefruit juice entirely while on statins.',
    examples: ['Grapefruit juice', 'Fresh grapefruit', 'Pomelo'],
  },
  {
    drug: 'levothyroxine',
    food: 'Calcium, Iron',
    severity: 'moderate',
    description: 'Calcium and iron reduce thyroid medication absorption',
    recommendation: 'Take levothyroxine on empty stomach. Wait 4 hours before calcium/iron supplements.',
    examples: ['Dairy products', 'Calcium supplements', 'Iron supplements', 'Antacids'],
  },
  {
    drug: 'metformin',
    food: 'Alcohol',
    severity: 'moderate',
    description: 'Alcohol increases risk of lactic acidosis',
    recommendation: 'Limit alcohol. Avoid binge drinking. Take with food.',
    examples: ['Beer', 'Wine', 'Spirits'],
  },
  {
    drug: 'lisinopril',
    food: 'Potassium-rich foods',
    severity: 'moderate',
    description: 'May increase potassium to dangerous levels',
    recommendation: 'Monitor potassium levels. Limit salt substitutes (often high in potassium).',
    examples: ['Salt substitutes', 'Bananas', 'Oranges', 'Potatoes', 'Tomatoes'],
  },
  {
    drug: 'ciprofloxacin',
    food: 'Dairy products',
    severity: 'moderate',
    description: 'Calcium in dairy reduces antibiotic absorption by 50%',
    recommendation: 'Take 2 hours before or 6 hours after dairy products.',
    examples: ['Milk', 'Yogurt', 'Cheese', 'Ice cream'],
  },
];

// ==================== DRUG-CONDITION INTERACTIONS ====================

export const KNOWN_CONDITION_INTERACTIONS: ConditionInteraction[] = [
  {
    drug: 'ibuprofen',
    condition: 'Chronic Kidney Disease',
    severity: 'major',
    description: 'NSAIDs can worsen kidney function and cause acute kidney injury',
    monitoring: 'Check kidney function before and during use. Use lowest effective dose.',
    contraindicated: false,
  },
  {
    drug: 'metformin',
    condition: 'Chronic Kidney Disease',
    severity: 'major',
    description: 'Risk of lactic acidosis in kidney impairment',
    monitoring: 'Check eGFR. Contraindicated if eGFR <30, reduce dose if <45.',
    contraindicated: false, // Depends on severity
  },
  {
    drug: 'beta-blocker',
    condition: 'Asthma',
    severity: 'major',
    description: 'May cause bronchospasm and worsen asthma',
    monitoring: 'Use cardioselective beta-blockers if necessary. Monitor lung function.',
    contraindicated: false,
  },
  {
    drug: 'prednisone',
    condition: 'Diabetes',
    severity: 'moderate',
    description: 'Corticosteroids increase blood glucose levels',
    monitoring: 'Monitor blood glucose closely. May need to adjust diabetes medications.',
    contraindicated: false,
  },
  {
    drug: 'lithium',
    condition: 'Chronic Kidney Disease',
    severity: 'major',
    description: 'Lithium is renally excreted; toxicity risk with kidney disease',
    monitoring: 'Frequent lithium level monitoring. Check kidney function regularly.',
    contraindicated: false,
  },
  {
    drug: 'warfarin',
    condition: 'Liver Disease',
    severity: 'major',
    description: 'Impaired clotting factor production increases bleeding risk',
    monitoring: 'More frequent INR monitoring. May need lower warfarin doses.',
    contraindicated: false,
  },
  {
    drug: 'nitrates',
    condition: 'Use of PDE5 inhibitors',
    severity: 'contraindicated',
    description: 'Severe hypotension can occur with combined use',
    monitoring: 'Absolutely contraindicated. Never combine.',
    contraindicated: true,
  },
];

// ==================== INTERACTION CHECKING ====================

export function checkMedicationInteractions(
  medications: Medication[],
  conditions: string[] = [],
  supplements: string[] = []
): InteractionCheckResult {
  const interactions: (DrugInteraction | FoodInteraction | ConditionInteraction)[] = [];
  const recommendations: string[] = [];
  const alerts: string[] = [];

  const byType = {
    drug_drug: 0,
    drug_food: 0,
    drug_condition: 0,
    drug_supplement: 0,
  };

  const bySeverity = {
    minor: 0,
    moderate: 0,
    major: 0,
    contraindicated: 0,
  };

  // Check drug-drug interactions
  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const drug1 = medications[i].genericName.toLowerCase();
      const drug2 = medications[j].genericName.toLowerCase();

      const interaction = KNOWN_DRUG_INTERACTIONS.find(
        (int) =>
          (int.drug1.toLowerCase() === drug1 && int.drug2.toLowerCase() === drug2) ||
          (int.drug1.toLowerCase() === drug2 && int.drug2.toLowerCase() === drug1) ||
          // Also check brand names
          (int.drug1.toLowerCase() === medications[i].name.toLowerCase() &&
            int.drug2.toLowerCase() === medications[j].name.toLowerCase()) ||
          (int.drug1.toLowerCase() === medications[j].name.toLowerCase() &&
            int.drug2.toLowerCase() === medications[i].name.toLowerCase())
      );

      if (interaction) {
        interactions.push(interaction);
        byType.drug_drug++;
        bySeverity[interaction.severity]++;

        if (interaction.severity === 'contraindicated') {
          alerts.push(
            `🚨 CONTRAINDICATED: ${medications[i].name} + ${medications[j].name}. ${interaction.description}`
          );
        } else if (interaction.severity === 'major') {
          alerts.push(
            `⚠️ MAJOR interaction: ${medications[i].name} + ${medications[j].name}. ${interaction.description}`
          );
        }

        recommendations.push(interaction.management);
      }
    }
  }

  // Check drug-food interactions
  medications.forEach((med) => {
    const foodInteractions = KNOWN_FOOD_INTERACTIONS.filter(
      (int) =>
        int.drug.toLowerCase() === med.genericName.toLowerCase() ||
        int.drug.toLowerCase() === med.name.toLowerCase()
    );

    foodInteractions.forEach((interaction) => {
      interactions.push(interaction);
      byType.drug_food++;
      bySeverity[interaction.severity]++;
      recommendations.push(interaction.recommendation);
    });
  });

  // Check drug-condition interactions
  medications.forEach((med) => {
    conditions.forEach((condition) => {
      const conditionInteraction = KNOWN_CONDITION_INTERACTIONS.find(
        (int) =>
          (int.drug.toLowerCase() === med.genericName.toLowerCase() ||
            int.drug.toLowerCase() === med.name.toLowerCase()) &&
          int.condition.toLowerCase() === condition.toLowerCase()
      );

      if (conditionInteraction) {
        interactions.push(conditionInteraction);
        byType.drug_condition++;
        bySeverity[conditionInteraction.severity]++;

        if (conditionInteraction.contraindicated) {
          alerts.push(
            `🚨 CONTRAINDICATED: ${med.name} with ${condition}. ${conditionInteraction.description}`
          );
        } else if (conditionInteraction.severity === 'major') {
          alerts.push(
            `⚠️ Use with caution: ${med.name} with ${condition}. ${conditionInteraction.description}`
          );
        }

        recommendations.push(conditionInteraction.monitoring);
      }
    });
  });

  // Add general recommendations
  if (interactions.length === 0) {
    recommendations.push('✅ No known interactions detected with current medications.');
  } else {
    recommendations.push('Review all interactions with your doctor or pharmacist.');
    recommendations.push('Never stop medications without medical supervision.');
  }

  return {
    hasInteractions: interactions.length > 0,
    totalInteractions: interactions.length,
    byType,
    bySeverity,
    interactions,
    recommendations: Array.from(new Set(recommendations)), // Remove duplicates
    alerts: Array.from(new Set(alerts)),
  };
}

// ==================== SIDE EFFECT TRACKING ====================

export interface SideEffectReport {
  medicationId: string;
  medicationName: string;
  sideEffect: string;
  severity: 'mild' | 'moderate' | 'severe';
  startDate: string;
  endDate?: string;
  resolved: boolean;
  interventions?: string[];
  reportedToDoctor: boolean;
}

export const COMMON_SIDE_EFFECTS: Record<string, { effect: string; frequency: string }[]> = {
  metformin: [
    { effect: 'Nausea', frequency: 'very_common' },
    { effect: 'Diarrhea', frequency: 'very_common' },
    { effect: 'Abdominal pain', frequency: 'common' },
    { effect: 'Loss of appetite', frequency: 'common' },
  ],
  atorvastatin: [
    { effect: 'Muscle pain', frequency: 'common' },
    { effect: 'Headache', frequency: 'common' },
    { effect: 'Nausea', frequency: 'common' },
    { effect: 'Elevated liver enzymes', frequency: 'uncommon' },
  ],
  lisinopril: [
    { effect: 'Dry cough', frequency: 'common' },
    { effect: 'Dizziness', frequency: 'common' },
    { effect: 'Headache', frequency: 'common' },
    { effect: 'Hyperkalemia', frequency: 'uncommon' },
  ],
  sertraline: [
    { effect: 'Nausea', frequency: 'very_common' },
    { effect: 'Insomnia', frequency: 'common' },
    { effect: 'Fatigue', frequency: 'common' },
    { effect: 'Sexual dysfunction', frequency: 'common' },
  ],
};

// ==================== MEDICATION ADHERENCE HELPERS ====================

export interface DoseReminder {
  medicationId: string;
  medicationName: string;
  time: string; // HH:MM
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
}

export interface MissedDose {
  medicationId: string;
  scheduledTime: string;
  actualTime?: string;
  reason?: 'forgot' | 'side_effects' | 'cost' | 'not_needed' | 'other';
}

export function calculateAdherenceScore(
  scheduledDoses: number,
  takenDoses: number,
  missedDoses: MissedDose[]
): {
  adherencePercent: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  insights: string[];
} {
  const adherencePercent = scheduledDoses > 0 ? Math.round((takenDoses / scheduledDoses) * 100) : 0;

  let rating: 'excellent' | 'good' | 'fair' | 'poor';
  if (adherencePercent >= 95) rating = 'excellent';
  else if (adherencePercent >= 80) rating = 'good';
  else if (adherencePercent >= 60) rating = 'fair';
  else rating = 'poor';

  const insights: string[] = [];

  if (adherencePercent >= 95) {
    insights.push('🌟 Excellent adherence! Keep up the great work.');
  } else if (adherencePercent >= 80) {
    insights.push('✅ Good adherence. Aim for 95% for optimal medication effectiveness.');
  } else if (adherencePercent < 80) {
    insights.push('⚠️ Low medication adherence can reduce treatment effectiveness.');
  }

  // Analyze missed dose reasons
  const reasonCounts: Record<string, number> = {};
  missedDoses.forEach((missed) => {
    if (missed.reason) {
      reasonCounts[missed.reason] = (reasonCounts[missed.reason] || 0) + 1;
    }
  });

  const topReason = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])[0];
  if (topReason) {
    const [reason, count] = topReason;
    if (reason === 'forgot') {
      insights.push(`You've forgotten ${count} doses. Consider using medication reminders.`);
    } else if (reason === 'side_effects') {
      insights.push(
        `${count} doses missed due to side effects. Discuss with your doctor - alternatives may be available.`
      );
    } else if (reason === 'cost') {
      insights.push(`${count} doses missed due to cost. Ask about generic alternatives or assistance programs.`);
    }
  }

  return { adherencePercent, rating, insights };
}

// ==================== PILL IDENTIFIER ====================

export interface PillIdentification {
  imprint: string;
  color: string;
  shape: string;
  size?: string;
  possibleMedications: {
    name: string;
    genericName: string;
    strength: string;
    manufacturer: string;
    imageUrl?: string;
  }[];
}

// This would integrate with NIH Pillbox API or similar service
export async function identifyPill(
  imprint: string,
  color: string,
  shape: string
): Promise<PillIdentification | null> {
  // Placeholder - would call actual API
  return {
    imprint,
    color,
    shape,
    possibleMedications: [],
  };
}

// ==================== DRUG DATABASE HELPERS ====================

// In production, integrate with:
// - DrugBank API for interactions
// - RxNorm/RxNav for medication lookup
// - OpenFDA for side effects and recalls
// - NIH DailyMed for medication information

export interface DrugInfo {
  rxcui: string;
  name: string;
  genericName: string;
  brandNames: string[];
  drugClass: string;
  schedule?: 'I' | 'II' | 'III' | 'IV' | 'V'; // DEA schedule for controlled substances
  pregnancyCategory?: 'A' | 'B' | 'C' | 'D' | 'X';
  lactation: 'safe' | 'use_caution' | 'avoid';
  mechanism: string;
  indications: string[];
  contraindications: string[];
  warnings: string[];
  commonSideEffects: string[];
  seriousSideEffects: string[];
}

// Mock drug lookup - would use actual API
export async function lookupDrug(name: string): Promise<DrugInfo | null> {
  // Placeholder for API integration
  return null;
}
