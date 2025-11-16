// Wearable Device Integration Module
// Research: Health Connect now part of Android 14, supports 50+ data types
// Apple HealthKit has 90+ health metric types
// 30% of US adults use fitness trackers or smartwatches

import type { HealthMetric, MetricType } from './types';

// ==================== COMMON TYPES ====================

export type WearableProvider =
  | 'apple_health'
  | 'google_fit'
  | 'health_connect'
  | 'fitbit'
  | 'garmin'
  | 'whoop'
  | 'oura'
  | 'polar'
  | 'samsung_health';

export interface WearableConnection {
  provider: WearableProvider;
  userId: string;
  connected: boolean;
  lastSync: string;
  accessToken?: string;
  refreshToken?: string;
  scopes: string[];
}

export interface WearableDataSync {
  provider: WearableProvider;
  syncStartDate: string;
  syncEndDate: string;
  dataTypes: string[];
  recordsImported: number;
  lastSyncTimestamp: string;
  errors?: string[];
}

export interface WearableActivityData {
  date: string;
  steps: number;
  activeMinutes: number;
  caloriesBurned: number;
  distance: number; // meters
  floors?: number;
  activeZoneMinutes?: number;
}

export interface WearableSleepData {
  date: string;
  startTime: string;
  endTime: string;
  totalMinutes: number;
  deepSleepMinutes?: number;
  remSleepMinutes?: number;
  lightSleepMinutes?: number;
  awakeMinutes?: number;
  sleepScore?: number; // 0-100
  efficiency?: number; // percentage
}

export interface WearableHeartRateData {
  timestamp: string;
  heartRate: number;
  context?: 'resting' | 'active' | 'sleep' | 'workout';
}

export interface WearableWorkoutData {
  id: string;
  startTime: string;
  endTime: string;
  type: string;
  durationMinutes: number;
  caloriesBurned: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  distance?: number; // meters
  elevationGain?: number; // meters
}

// ==================== APPLE HEALTH / HEALTHKIT ====================

export const APPLE_HEALTH_METRICS = {
  // Vitals
  'HKQuantityTypeIdentifierHeartRate': 'heart_rate',
  'HKQuantityTypeIdentifierBloodPressureSystolic': 'blood_pressure_systolic',
  'HKQuantityTypeIdentifierBloodPressureDiastolic': 'blood_pressure_diastolic',
  'HKQuantityTypeIdentifierRespiratoryRate': 'respiratory_rate',
  'HKQuantityTypeIdentifierBodyTemperature': 'body_temperature',
  'HKQuantityTypeIdentifierOxygenSaturation': 'oxygen_saturation',

  // Body Measurements
  'HKQuantityTypeIdentifierBodyMass': 'weight',
  'HKQuantityTypeIdentifierHeight': 'height',
  'HKQuantityTypeIdentifierBodyMassIndex': 'bmi',
  'HKQuantityTypeIdentifierBodyFatPercentage': 'body_fat',
  'HKQuantityTypeIdentifierLeanBodyMass': 'lean_mass',
  'HKQuantityTypeIdentifierWaistCircumference': 'waist',

  // Activity
  'HKQuantityTypeIdentifierStepCount': 'steps',
  'HKQuantityTypeIdentifierDistanceWalkingRunning': 'distance',
  'HKQuantityTypeIdentifierActiveEnergyBurned': 'calories_burned',
  'HKQuantityTypeIdentifierAppleExerciseTime': 'exercise_minutes',
  'HKQuantityTypeIdentifierFlightsClimbed': 'floors_climbed',

  // Nutrition
  'HKQuantityTypeIdentifierDietaryEnergyConsumed': 'calories_consumed',
  'HKQuantityTypeIdentifierDietaryProtein': 'protein',
  'HKQuantityTypeIdentifierDietaryCarbohydrates': 'carbs',
  'HKQuantityTypeIdentifierDietaryFatTotal': 'fat',
  'HKQuantityTypeIdentifierDietaryWater': 'water',

  // Lab Results
  'HKQuantityTypeIdentifierBloodGlucose': 'glucose',
  'HKQuantityTypeIdentifierInsulinDelivery': 'insulin',
} as const;

export interface AppleHealthData {
  identifier: string;
  value: number;
  unit: string;
  startDate: string;
  endDate: string;
  metadata?: Record<string, any>;
  sourceName?: string;
  sourceVersion?: string;
}

// Map Apple Health data to our HealthMetric format
export function mapAppleHealthToMetric(data: AppleHealthData): HealthMetric | null {
  const metricType = APPLE_HEALTH_METRICS[data.identifier as keyof typeof APPLE_HEALTH_METRICS];
  if (!metricType) return null;

  return {
    id: `apple_${data.startDate}_${metricType}`,
    type: metricType as MetricType,
    value: data.value,
    unit: data.unit,
    date: data.startDate,
    source: 'Apple Health',
    notes: data.sourceName ? `From ${data.sourceName}` : undefined,
  };
}

// Request Apple Health permissions (would be called in iOS app)
export const APPLE_HEALTH_PERMISSIONS_READ = [
  'HKQuantityTypeIdentifierHeartRate',
  'HKQuantityTypeIdentifierBloodPressureSystolic',
  'HKQuantityTypeIdentifierBloodPressureDiastolic',
  'HKQuantityTypeIdentifierBodyMass',
  'HKQuantityTypeIdentifierBloodGlucose',
  'HKQuantityTypeIdentifierOxygenSaturation',
  'HKQuantityTypeIdentifierStepCount',
  'HKCategoryTypeIdentifierSleepAnalysis',
  'HKWorkoutTypeIdentifier',
];

// ==================== GOOGLE FIT / HEALTH CONNECT ====================

export const GOOGLE_FIT_DATA_TYPES = {
  // Vitals
  'com.google.heart_rate.bpm': 'heart_rate',
  'com.google.blood_pressure': 'blood_pressure',
  'com.google.body.temperature': 'body_temperature',
  'com.google.oxygen_saturation': 'oxygen_saturation',

  // Body Measurements
  'com.google.weight': 'weight',
  'com.google.height': 'height',
  'com.google.body.fat.percentage': 'body_fat',

  // Activity
  'com.google.step_count.delta': 'steps',
  'com.google.distance.delta': 'distance',
  'com.google.calories.expended': 'calories_burned',
  'com.google.active_minutes': 'active_minutes',

  // Nutrition
  'com.google.nutrition': 'nutrition',
  'com.google.hydration': 'water',

  // Lab Results
  'com.google.blood_glucose': 'glucose',
} as const;

export interface GoogleFitDataPoint {
  dataTypeName: string;
  value: number | { fpVal: number };
  startTimeNanos: string;
  endTimeNanos: string;
  originDataSourceId?: string;
}

// Map Google Fit data to our HealthMetric format
export function mapGoogleFitToMetric(data: GoogleFitDataPoint): HealthMetric | null {
  const metricType = GOOGLE_FIT_DATA_TYPES[data.dataTypeName as keyof typeof GOOGLE_FIT_DATA_TYPES];
  if (!metricType) return null;

  const value = typeof data.value === 'number' ? data.value : data.value.fpVal;
  const date = new Date(parseInt(data.startTimeNanos) / 1000000).toISOString();

  return {
    id: `googlefit_${date}_${metricType}`,
    type: metricType as MetricType,
    value,
    unit: getUnitForMetric(metricType),
    date,
    source: 'Google Fit',
  };
}

// ==================== FITBIT ====================

export interface FitbitActivitySummary {
  date: string;
  steps: number;
  floors: number;
  caloriesOut: number;
  activeMinutes: number;
  sedentaryMinutes: number;
  lightlyActiveMinutes: number;
  fairlyActiveMinutes: number;
  veryActiveMinutes: number;
  distance: number;
}

export interface FitbitHeartRateZones {
  date: string;
  restingHeartRate: number;
  zones: {
    name: 'Out of Range' | 'Fat Burn' | 'Cardio' | 'Peak';
    min: number;
    max: number;
    minutes: number;
    caloriesOut: number;
  }[];
}

export interface FitbitSleepLog {
  dateOfSleep: string;
  duration: number; // milliseconds
  efficiency: number;
  minutesAsleep: number;
  minutesAwake: number;
  minutesToFallAsleep: number;
  timeInBed: number;
  levels: {
    deep: number;
    light: number;
    rem: number;
    wake: number;
  };
}

// Fitbit API scopes needed
export const FITBIT_SCOPES = [
  'activity',
  'heartrate',
  'sleep',
  'weight',
  'nutrition',
  'oxygen_saturation',
  'respiratory_rate',
  'temperature',
];

// ==================== GARMIN ====================

export interface GarminDailySummary {
  calendarDate: string;
  steps: number;
  distanceInMeters: number;
  activeTimeInSeconds: number;
  floorsClimbed: number;
  minHeartRateInBeatsPerMinute: number;
  maxHeartRateInBeatsPerMinute: number;
  restingHeartRateInBeatsPerMinute: number;
  totalKilocalories: number;
  activeKilocalories: number;
  moderateIntensityDurationInSeconds: number;
  vigorousIntensityDurationInSeconds: number;
}

export interface GarminSleepData {
  calendarDate: string;
  sleepTimeSeconds: number;
  deepSleepSeconds: number;
  lightSleepSeconds: number;
  remSleepSeconds: number;
  awakeSleepSeconds: number;
  sleepScoreValue?: number;
  qualityValue?: number;
}

// ==================== OURA RING ====================

export interface OuraSleepData {
  date: string;
  score: number; // 0-100
  totalSleepDuration: number; // seconds
  rem: number;
  deep: number;
  light: number;
  latency: number; // time to fall asleep
  efficiency: number; // percentage
  restless: number;
  hrAverage: number;
  hrLowest: number;
  temperature_delta: number; // deviation from baseline
}

export interface OuraActivityData {
  date: string;
  score: number; // 0-100
  steps: number;
  caloriesTotal: number;
  caloriesActive: number;
  metMinActive: number;
  metMinInactive: number;
  metMinMedium: number;
  metMinHigh: number;
  inactivityAlerts: number;
}

export interface OuraReadinessData {
  date: string;
  score: number; // 0-100
  hrAverage: number;
  hrvAverage: number;
  bodyTemperature: number;
  recoveryIndex: number;
}

// ==================== WHOOP ====================

export interface WhoopRecovery {
  date: string;
  recoveryScore: number; // 0-100
  restingHeartRate: number;
  hrv: number; // milliseconds
  spo2?: number;
  skinTemp?: number;
}

export interface WhoopStrain {
  date: string;
  strain: number; // 0-21
  averageHeartRate: number;
  maxHeartRate: number;
  caloriesBurned: number;
  kilojoules: number;
}

export interface WhoopSleep {
  date: string;
  sleepPerformance: number; // percentage
  totalSleepTime: number; // minutes
  remSleepTime: number;
  slowWaveSleepTime: number;
  lightSleepTime: number;
  wakeSleepTime: number;
  sleepEfficiency: number;
  respiratoryRate: number;
  sleepScore: number; // 0-100
}

// ==================== DATA SYNCHRONIZATION ====================

export interface SyncConfig {
  provider: WearableProvider;
  autoSync: boolean;
  syncInterval: 'realtime' | 'hourly' | 'daily' | 'manual';
  dataTypes: string[];
  startDate?: string; // Only sync data from this date forward
}

export interface SyncResult {
  success: boolean;
  provider: WearableProvider;
  recordsImported: number;
  recordsSkipped: number;
  errors: string[];
  timestamp: string;
}

// Sync wearable data
export async function syncWearableData(
  connection: WearableConnection,
  config: SyncConfig,
  lastSyncDate?: string
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    provider: connection.provider,
    recordsImported: 0,
    recordsSkipped: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    // In production, this would make actual API calls
    switch (connection.provider) {
      case 'apple_health':
        // result = await syncAppleHealth(connection, config, lastSyncDate);
        result.success = true;
        break;
      case 'google_fit':
      case 'health_connect':
        // result = await syncGoogleFit(connection, config, lastSyncDate);
        result.success = true;
        break;
      case 'fitbit':
        // result = await syncFitbit(connection, config, lastSyncDate);
        result.success = true;
        break;
      case 'garmin':
        // result = await syncGarmin(connection, config, lastSyncDate);
        result.success = true;
        break;
      case 'oura':
        // result = await syncOura(connection, config, lastSyncDate);
        result.success = true;
        break;
      case 'whoop':
        // result = await syncWhoop(connection, config, lastSyncDate);
        result.success = true;
        break;
      default:
        result.errors.push(`Unsupported provider: ${connection.provider}`);
    }
  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error during sync');
  }

  return result;
}

// ==================== HELPER FUNCTIONS ====================

function getUnitForMetric(metricType: string): string {
  const unitMap: Record<string, string> = {
    heart_rate: 'bpm',
    blood_pressure_systolic: 'mmHg',
    blood_pressure_diastolic: 'mmHg',
    respiratory_rate: 'breaths/min',
    body_temperature: '°F',
    oxygen_saturation: '%',
    weight: 'kg',
    height: 'cm',
    bmi: 'kg/m²',
    body_fat: '%',
    steps: 'steps',
    distance: 'km',
    calories_burned: 'kcal',
    exercise_minutes: 'minutes',
    glucose: 'mg/dL',
    water: 'ml',
  };
  return unitMap[metricType] || '';
}

// Detect duplicate data from different sources
export function deduplicateMetrics(metrics: HealthMetric[]): HealthMetric[] {
  const seen = new Map<string, HealthMetric>();

  metrics.forEach((metric) => {
    // Create key based on type, date, and value (rounded)
    const dateKey = metric.date.substring(0, 10); // Date only, ignore time
    const valueKey = Math.round(metric.value * 10) / 10; // Round to 1 decimal
    const key = `${metric.type}_${dateKey}_${valueKey}`;

    if (!seen.has(key)) {
      seen.set(key, metric);
    } else {
      // Keep the one from preferred source
      const existing = seen.get(key)!;
      const sourcePreference = ['Apple Health', 'Whoop', 'Oura', 'Garmin', 'Fitbit', 'Google Fit'];
      const existingPriority = existing.source ? sourcePreference.indexOf(existing.source) : 999;
      const newPriority = metric.source ? sourcePreference.indexOf(metric.source) : 999;

      if (newPriority < existingPriority) {
        seen.set(key, metric);
      }
    }
  });

  return Array.from(seen.values());
}

// Calculate data completeness score
export function calculateDataCompleteness(
  metrics: HealthMetric[],
  startDate: string,
  endDate: string,
  requiredTypes: MetricType[]
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const expectedDataPoints = days * requiredTypes.length;
  const actualDataPoints = metrics.filter((m) => {
    const metricDate = new Date(m.date);
    return metricDate >= start && metricDate <= end && requiredTypes.includes(m.type);
  }).length;

  return Math.min(100, Math.round((actualDataPoints / expectedDataPoints) * 100));
}

// OAuth helpers for wearable connections (placeholder - would implement actual OAuth flows)
export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export function getAuthorizationUrl(provider: WearableProvider, config: OAuthConfig): string {
  const authUrls: Record<WearableProvider, string> = {
    apple_health: 'https://developer.apple.com/health/', // HealthKit uses native iOS APIs
    google_fit: 'https://accounts.google.com/o/oauth2/v2/auth',
    health_connect: 'healthconnect://', // Android Health Connect uses native APIs
    fitbit: 'https://www.fitbit.com/oauth2/authorize',
    garmin: 'https://connect.garmin.com/oauthConfirm',
    whoop: 'https://api.prod.whoop.com/oauth/authorize',
    oura: 'https://cloud.ouraring.com/oauth/authorize',
    polar: 'https://flow.polar.com/oauth2/authorization',
    samsung_health: 'https://developer.samsung.com/health', // Uses Samsung Health SDK
  };

  const baseUrl = authUrls[provider];
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
  });

  return `${baseUrl}?${params.toString()}`;
}

// Export all wearable data for backup
export function exportWearableData(
  activities: WearableActivityData[],
  sleep: WearableSleepData[],
  heartRate: WearableHeartRateData[]
): string {
  const exportData = {
    exportDate: new Date().toISOString(),
    activities,
    sleep,
    heartRate,
  };

  return JSON.stringify(exportData, null, 2);
}

// Import wearable data from backup
export function importWearableData(jsonData: string): {
  activities: WearableActivityData[];
  sleep: WearableSleepData[];
  heartRate: WearableHeartRateData[];
} | null {
  try {
    const data = JSON.parse(jsonData);
    return {
      activities: data.activities || [],
      sleep: data.sleep || [],
      heartRate: data.heartRate || [],
    };
  } catch (error) {
    console.error('Failed to import wearable data:', error);
    return null;
  }
}
