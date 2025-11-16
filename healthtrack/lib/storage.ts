// Simple storage layer using localStorage for demo
// In production, this would use a database

import type {
  HealthMetric,
  MedicalFile,
  PatientProfile,
  LabResult,
  AIInsight,
  HealthEvent,
} from './types';

const STORAGE_KEYS = {
  METRICS: 'healthtrack_metrics',
  FILES: 'healthtrack_files',
  PROFILE: 'healthtrack_profile',
  LAB_RESULTS: 'healthtrack_lab_results',
  INSIGHTS: 'healthtrack_insights',
  EVENTS: 'healthtrack_events',
};

// Helper functions for localStorage
const getFromStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// Health Metrics
export const getHealthMetrics = (): HealthMetric[] => {
  return getFromStorage<HealthMetric>(STORAGE_KEYS.METRICS);
};

export const addHealthMetric = (metric: Omit<HealthMetric, 'id'>): HealthMetric => {
  const metrics = getHealthMetrics();
  const newMetric: HealthMetric = {
    ...metric,
    id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  metrics.push(newMetric);
  saveToStorage(STORAGE_KEYS.METRICS, metrics);
  return newMetric;
};

export const getMetricsByType = (type: string): HealthMetric[] => {
  return getHealthMetrics().filter((m) => m.type === type);
};

export const deleteHealthMetric = (id: string): void => {
  const metrics = getHealthMetrics().filter((m) => m.id !== id);
  saveToStorage(STORAGE_KEYS.METRICS, metrics);
};

// Medical Files
export const getMedicalFiles = (): MedicalFile[] => {
  return getFromStorage<MedicalFile>(STORAGE_KEYS.FILES);
};

export const addMedicalFile = (file: Omit<MedicalFile, 'id'>): MedicalFile => {
  const files = getMedicalFiles();
  const newFile: MedicalFile = {
    ...file,
    id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  files.push(newFile);
  saveToStorage(STORAGE_KEYS.FILES, files);
  return newFile;
};

export const updateMedicalFile = (id: string, updates: Partial<MedicalFile>): void => {
  const files = getMedicalFiles();
  const index = files.findIndex((f) => f.id === id);
  if (index !== -1) {
    files[index] = { ...files[index], ...updates };
    saveToStorage(STORAGE_KEYS.FILES, files);
  }
};

export const deleteMedicalFile = (id: string): void => {
  const files = getMedicalFiles().filter((f) => f.id !== id);
  saveToStorage(STORAGE_KEYS.FILES, files);
};

// Patient Profile
export const getPatientProfile = (): PatientProfile | null => {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : null;
};

export const savePatientProfile = (profile: PatientProfile): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

// Lab Results
export const getLabResults = (): LabResult[] => {
  return getFromStorage<LabResult>(STORAGE_KEYS.LAB_RESULTS);
};

export const addLabResult = (result: Omit<LabResult, 'id'>): LabResult => {
  const results = getLabResults();
  const newResult: LabResult = {
    ...result,
    id: `lab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  results.push(newResult);
  saveToStorage(STORAGE_KEYS.LAB_RESULTS, results);
  return newResult;
};

// AI Insights
export const getAIInsights = (): AIInsight[] => {
  return getFromStorage<AIInsight>(STORAGE_KEYS.INSIGHTS);
};

export const addAIInsight = (insight: Omit<AIInsight, 'id'>): AIInsight => {
  const insights = getAIInsights();
  const newInsight: AIInsight = {
    ...insight,
    id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  insights.push(newInsight);
  saveToStorage(STORAGE_KEYS.INSIGHTS, insights);
  return newInsight;
};

// Health Events
export const getHealthEvents = (): HealthEvent[] => {
  return getFromStorage<HealthEvent>(STORAGE_KEYS.EVENTS);
};

export const addHealthEvent = (event: Omit<HealthEvent, 'id'>): HealthEvent => {
  const events = getHealthEvents();
  const newEvent: HealthEvent = {
    ...event,
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  events.push(newEvent);
  saveToStorage(STORAGE_KEYS.EVENTS, events);
  return newEvent;
};

// Demo data generator
export const generateDemoData = (): void => {
  // Clear existing data
  if (typeof window === 'undefined') return;

  // Create demo profile
  const demoProfile: PatientProfile = {
    id: 'demo_patient',
    name: 'Demo Patient',
    dateOfBirth: '1985-06-15',
    gender: 'male',
    bloodType: 'A+',
    allergies: ['Penicillin', 'Peanuts'],
    medications: [
      {
        id: 'med_1',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        startDate: '2024-01-01',
        notes: 'Take with meals',
      },
    ],
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1-555-0100',
    },
  };
  savePatientProfile(demoProfile);

  // Create demo metrics
  const demoMetrics: Omit<HealthMetric, 'id'>[] = [
    // Blood Pressure readings over 6 months
    { type: 'blood_pressure_systolic', value: 125, unit: 'mmHg', date: '2024-10-01' },
    { type: 'blood_pressure_diastolic', value: 82, unit: 'mmHg', date: '2024-10-01' },
    { type: 'blood_pressure_systolic', value: 120, unit: 'mmHg', date: '2024-10-15' },
    { type: 'blood_pressure_diastolic', value: 78, unit: 'mmHg', date: '2024-10-15' },
    { type: 'blood_pressure_systolic', value: 118, unit: 'mmHg', date: '2024-11-01' },
    { type: 'blood_pressure_diastolic', value: 76, unit: 'mmHg', date: '2024-11-01' },

    // Glucose readings
    { type: 'glucose', value: 105, unit: 'mg/dL', date: '2024-10-01', notes: 'Fasting' },
    { type: 'glucose', value: 98, unit: 'mg/dL', date: '2024-10-15', notes: 'Fasting' },
    { type: 'glucose', value: 92, unit: 'mg/dL', date: '2024-11-01', notes: 'Fasting' },

    // Cholesterol
    { type: 'cholesterol_total', value: 195, unit: 'mg/dL', date: '2024-09-01' },
    { type: 'cholesterol_ldl', value: 115, unit: 'mg/dL', date: '2024-09-01' },
    { type: 'cholesterol_hdl', value: 58, unit: 'mg/dL', date: '2024-09-01' },
    { type: 'triglycerides', value: 142, unit: 'mg/dL', date: '2024-09-01' },

    // HbA1c
    { type: 'hba1c', value: 6.2, unit: '%', date: '2024-09-01' },
    { type: 'hba1c', value: 5.9, unit: '%', date: '2024-11-01' },

    // Weight/BMI
    { type: 'weight', value: 82, unit: 'kg', date: '2024-10-01' },
    { type: 'weight', value: 80, unit: 'kg', date: '2024-11-01' },
    { type: 'bmi', value: 26.2, unit: 'kg/m²', date: '2024-10-01' },
    { type: 'bmi', value: 25.6, unit: 'kg/m²', date: '2024-11-01' },
  ];

  demoMetrics.forEach((metric) => addHealthMetric(metric));

  // Create demo lab result
  const demoLabResult: Omit<LabResult, 'id'> = {
    testName: 'Comprehensive Metabolic Panel',
    date: '2024-11-01',
    labName: 'Quest Diagnostics',
    results: [
      { biomarker: 'Glucose', value: 92, unit: 'mg/dL', normalRange: '70-100', status: 'normal' },
      { biomarker: 'Creatinine', value: 1.0, unit: 'mg/dL', normalRange: '0.6-1.2', status: 'normal' },
      { biomarker: 'eGFR', value: 95, unit: 'mL/min/1.73m²', normalRange: '>90', status: 'normal' },
      { biomarker: 'Sodium', value: 140, unit: 'mmol/L', normalRange: '136-145', status: 'normal' },
      { biomarker: 'Potassium', value: 4.2, unit: 'mmol/L', normalRange: '3.5-5.0', status: 'normal' },
    ],
  };
  addLabResult(demoLabResult);

  // Create demo AI insight
  const demoInsight: Omit<AIInsight, 'id'> = {
    date: new Date().toISOString(),
    type: 'trend_analysis',
    title: 'Improving Blood Glucose Control',
    description: 'Your fasting glucose levels have shown a positive trend over the past 3 months, decreasing from 105 to 92 mg/dL. This improvement suggests that your current treatment plan is effective.',
    severity: 'info',
    relatedMetrics: ['glucose', 'hba1c'],
  };
  addAIInsight(demoInsight);
};
