// Core type definitions for the health tracking application

export interface HealthMetric {
  id: string;
  type: MetricType;
  value: number;
  unit: string;
  date: string;
  notes?: string;
  source?: string;
}

export type MetricType =
  | 'blood_pressure_systolic'
  | 'blood_pressure_diastolic'
  | 'heart_rate'
  | 'glucose'
  | 'hba1c'
  | 'cholesterol_total'
  | 'cholesterol_ldl'
  | 'cholesterol_hdl'
  | 'triglycerides'
  | 'weight'
  | 'bmi'
  | 'temperature'
  | 'oxygen_saturation'
  | 'tsh'
  | 'free_t3'
  | 'free_t4'
  | 'vitamin_d'
  | 'vitamin_b12'
  | 'iron'
  | 'ferritin'
  | 'creatinine'
  | 'gfr'
  | 'alt'
  | 'ast'
  | 'albumin'
  | 'calcium'
  | 'hemoglobin'
  | 'white_blood_cells'
  | 'platelets';

export interface MedicalFile {
  id: string;
  name: string;
  type: FileType;
  uploadDate: string;
  fileUrl: string;
  fileSize: number;
  metadata?: Record<string, any>;
  extractedData?: any;
  aiInsights?: string;
}

export type FileType = 'dicom' | 'pdf' | 'image' | 'other';

export interface PatientProfile {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  allergies: string[];
  medications: Medication[];
  conditions: string[];
  emergencyContact?: EmergencyContact;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface LabResult {
  id: string;
  testName: string;
  date: string;
  results: LabResultItem[];
  fileId?: string;
  labName?: string;
}

export interface LabResultItem {
  biomarker: string;
  value: number | string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
}

export interface AIInsight {
  id: string;
  date: string;
  type: 'trend_analysis' | 'risk_assessment' | 'recommendation' | 'anomaly_detection';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  relatedMetrics: string[];
}

export interface HealthEvent {
  id: string;
  type: 'lab_result' | 'scan' | 'appointment' | 'medication_change' | 'symptom';
  date: string;
  title: string;
  description: string;
  relatedFileId?: string;
}

// New features types
export interface MedicationReminder {
  id: string;
  medicationId: string;
  medicationName: string;
  time: string; // HH:MM format
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  enabled: boolean;
  lastTaken?: string;
}

export interface HealthGoal {
  id: string;
  metricType: MetricType;
  targetValue: number;
  currentValue?: number;
  deadline: string;
  progress: number; // 0-100
  status: 'active' | 'completed' | 'abandoned';
  notes?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty?: string;
  date: string;
  time: string;
  location?: string;
  purpose: string;
  notes?: string;
  reminder?: boolean;
}

export interface Immunization {
  id: string;
  vaccineName: string;
  date: string;
  nextDue?: string;
  provider?: string;
  lotNumber?: string;
  notes?: string;
}

export interface HealthNote {
  id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  symptoms?: string[];
}

// Metric configurations
export const METRIC_CONFIGS: Record<MetricType, {
  label: string;
  unit: string;
  normalRange: { min: number; max: number };
  category: 'vital' | 'blood_test' | 'body_composition';
}> = {
  blood_pressure_systolic: {
    label: 'Blood Pressure (Systolic)',
    unit: 'mmHg',
    normalRange: { min: 90, max: 120 },
    category: 'vital',
  },
  blood_pressure_diastolic: {
    label: 'Blood Pressure (Diastolic)',
    unit: 'mmHg',
    normalRange: { min: 60, max: 80 },
    category: 'vital',
  },
  heart_rate: {
    label: 'Heart Rate',
    unit: 'bpm',
    normalRange: { min: 60, max: 100 },
    category: 'vital',
  },
  glucose: {
    label: 'Blood Glucose',
    unit: 'mg/dL',
    normalRange: { min: 70, max: 100 },
    category: 'blood_test',
  },
  hba1c: {
    label: 'HbA1c',
    unit: '%',
    normalRange: { min: 4, max: 5.6 },
    category: 'blood_test',
  },
  cholesterol_total: {
    label: 'Total Cholesterol',
    unit: 'mg/dL',
    normalRange: { min: 125, max: 200 },
    category: 'blood_test',
  },
  cholesterol_ldl: {
    label: 'LDL Cholesterol',
    unit: 'mg/dL',
    normalRange: { min: 0, max: 100 },
    category: 'blood_test',
  },
  cholesterol_hdl: {
    label: 'HDL Cholesterol',
    unit: 'mg/dL',
    normalRange: { min: 40, max: 200 },
    category: 'blood_test',
  },
  triglycerides: {
    label: 'Triglycerides',
    unit: 'mg/dL',
    normalRange: { min: 0, max: 150 },
    category: 'blood_test',
  },
  weight: {
    label: 'Weight',
    unit: 'kg',
    normalRange: { min: 50, max: 100 },
    category: 'body_composition',
  },
  bmi: {
    label: 'BMI',
    unit: 'kg/m²',
    normalRange: { min: 18.5, max: 24.9 },
    category: 'body_composition',
  },
  temperature: {
    label: 'Body Temperature',
    unit: '°C',
    normalRange: { min: 36.5, max: 37.5 },
    category: 'vital',
  },
  oxygen_saturation: {
    label: 'Oxygen Saturation',
    unit: '%',
    normalRange: { min: 95, max: 100 },
    category: 'vital',
  },
  tsh: {
    label: 'TSH',
    unit: 'mIU/L',
    normalRange: { min: 0.4, max: 4.0 },
    category: 'blood_test',
  },
  free_t3: {
    label: 'Free T3',
    unit: 'pg/mL',
    normalRange: { min: 2.3, max: 4.2 },
    category: 'blood_test',
  },
  free_t4: {
    label: 'Free T4',
    unit: 'ng/dL',
    normalRange: { min: 0.8, max: 1.8 },
    category: 'blood_test',
  },
  vitamin_d: {
    label: 'Vitamin D',
    unit: 'ng/mL',
    normalRange: { min: 30, max: 100 },
    category: 'blood_test',
  },
  vitamin_b12: {
    label: 'Vitamin B12',
    unit: 'pg/mL',
    normalRange: { min: 200, max: 900 },
    category: 'blood_test',
  },
  iron: {
    label: 'Iron',
    unit: 'μg/dL',
    normalRange: { min: 60, max: 170 },
    category: 'blood_test',
  },
  ferritin: {
    label: 'Ferritin',
    unit: 'ng/mL',
    normalRange: { min: 20, max: 200 },
    category: 'blood_test',
  },
  creatinine: {
    label: 'Creatinine',
    unit: 'mg/dL',
    normalRange: { min: 0.6, max: 1.2 },
    category: 'blood_test',
  },
  gfr: {
    label: 'GFR',
    unit: 'mL/min/1.73m²',
    normalRange: { min: 90, max: 120 },
    category: 'blood_test',
  },
  alt: {
    label: 'ALT',
    unit: 'U/L',
    normalRange: { min: 7, max: 56 },
    category: 'blood_test',
  },
  ast: {
    label: 'AST',
    unit: 'U/L',
    normalRange: { min: 10, max: 40 },
    category: 'blood_test',
  },
  albumin: {
    label: 'Albumin',
    unit: 'g/dL',
    normalRange: { min: 3.5, max: 5.5 },
    category: 'blood_test',
  },
  calcium: {
    label: 'Calcium',
    unit: 'mg/dL',
    normalRange: { min: 8.5, max: 10.5 },
    category: 'blood_test',
  },
  hemoglobin: {
    label: 'Hemoglobin',
    unit: 'g/dL',
    normalRange: { min: 13.5, max: 17.5 },
    category: 'blood_test',
  },
  white_blood_cells: {
    label: 'White Blood Cells',
    unit: '10³/μL',
    normalRange: { min: 4.5, max: 11.0 },
    category: 'blood_test',
  },
  platelets: {
    label: 'Platelets',
    unit: '10³/μL',
    normalRange: { min: 150, max: 400 },
    category: 'blood_test',
  },
};
