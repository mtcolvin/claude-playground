// Advanced Analytics & Insights Engine
// Based on research showing users want data-driven insights

import type { HealthMetric, MetricType } from './types';
import { METRIC_CONFIGS } from './types';

export interface CorrelationResult {
  metric1: MetricType;
  metric2: MetricType;
  correlation: number; // -1 to 1
  pValue: number;
  significance: 'strong' | 'moderate' | 'weak' | 'none';
  interpretation: string;
}

export interface TrendAnalysis {
  metricType: MetricType;
  trend: 'improving' | 'declining' | 'stable';
  changePercent: number;
  confidence: number;
  forecast30Day: number;
  forecast60Day: number;
  forecast90Day: number;
}

export interface TimeInRangeAnalysis {
  metricType: MetricType;
  totalReadings: number;
  inRange: number;
  belowRange: number;
  aboveRange: number;
  percentInRange: number;
  avgValue: number;
  stdDev: number;
  coefficient OfVariation: number;
}

export interface HealthScore {
  overall: number; // 0-100
  cardiovascular: number;
  metabolic: number;
  bodyComposition: number;
  trend: 'improving' | 'stable' | 'declining';
  improvements: string[];
  concerns: string[];
}

// Calculate Pearson correlation coefficient
export function calculateCorrelation(
  data1: number[],
  data2: number[]
): { correlation: number; pValue: number } {
  if (data1.length !== data2.length || data1.length < 3) {
    return { correlation: 0, pValue: 1 };
  }

  const n = data1.length;
  const mean1 = data1.reduce((a, b) => a + b, 0) / n;
  const mean2 = data2.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denom1 = 0;
  let denom2 = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = data1[i] - mean1;
    const diff2 = data2[i] - mean2;
    numerator += diff1 * diff2;
    denom1 += diff1 * diff1;
    denom2 += diff2 * diff2;
  }

  const correlation = numerator / Math.sqrt(denom1 * denom2);

  // Simplified p-value calculation (t-test approximation)
  const tStat = Math.abs(correlation) * Math.sqrt((n - 2) / (1 - correlation * correlation));
  const pValue = tStat > 2.0 ? 0.05 : tStat > 3.0 ? 0.01 : 0.1;

  return { correlation, pValue };
}

// Analyze correlations between all metric pairs
export function analyzeCorrelations(metrics: HealthMetric[]): CorrelationResult[] {
  const metricsByType: Record<string, number[]> = {};

  // Group metrics by type
  metrics.forEach((metric) => {
    if (!metricsByType[metric.type]) {
      metricsByType[metric.type] = [];
    }
    metricsByType[metric.type].push(metric.value);
  });

  const results: CorrelationResult[] = [];
  const types = Object.keys(metricsByType) as MetricType[];

  // Calculate correlations for all pairs
  for (let i = 0; i < types.length; i++) {
    for (let j = i + 1; j < types.length; j++) {
      const type1 = types[i];
      const type2 = types[j];

      // Only compare if we have matching data points
      const minLength = Math.min(
        metricsByType[type1].length,
        metricsByType[type2].length
      );

      if (minLength >= 5) {
        const { correlation, pValue } = calculateCorrelation(
          metricsByType[type1].slice(0, minLength),
          metricsByType[type2].slice(0, minLength)
        );

        const absCorr = Math.abs(correlation);
        let significance: 'strong' | 'moderate' | 'weak' | 'none';
        let interpretation: string;

        if (absCorr > 0.7 && pValue < 0.05) {
          significance = 'strong';
          interpretation = `Strong ${correlation > 0 ? 'positive' : 'negative'} correlation detected`;
        } else if (absCorr > 0.5 && pValue < 0.1) {
          significance = 'moderate';
          interpretation = `Moderate ${correlation > 0 ? 'positive' : 'negative'} correlation`;
        } else if (absCorr > 0.3) {
          significance = 'weak';
          interpretation = `Weak ${correlation > 0 ? 'positive' : 'negative'} correlation`;
        } else {
          significance = 'none';
          interpretation = 'No significant correlation';
        }

        results.push({
          metric1: type1,
          metric2: type2,
          correlation,
          pValue,
          significance,
          interpretation,
        });
      }
    }
  }

  // Return only significant correlations, sorted by strength
  return results
    .filter((r) => r.significance !== 'none')
    .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

// Analyze trend for a specific metric
export function analyzeTrend(
  metrics: HealthMetric[],
  metricType: MetricType
): TrendAnalysis | null {
  const typeMetrics = metrics
    .filter((m) => m.type === metricType)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (typeMetrics.length < 5) return null;

  const values = typeMetrics.map((m) => m.value);
  const n = values.length;

  // Calculate simple linear regression
  const xValues = Array.from({ length: n }, (_, i) => i);
  const meanX = xValues.reduce((a, b) => a + b, 0) / n;
  const meanY = values.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - meanX) * (values[i] - meanY);
    denominator += (xValues[i] - meanX) ** 2;
  }

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  // Determine trend direction
  const percentChange = ((slope * n) / meanY) * 100;
  const config = METRIC_CONFIGS[metricType];
  const isLowerBetter = config?.normalRange.min < config?.normalRange.max;

  let trend: 'improving' | 'declining' | 'stable';
  if (Math.abs(percentChange) < 2) {
    trend = 'stable';
  } else if (isLowerBetter) {
    trend = percentChange < 0 ? 'improving' : 'declining';
  } else {
    trend = percentChange > 0 ? 'improving' : 'declining';
  }

  // Simple forecasting (linear extrapolation)
  const forecast30Day = intercept + slope * (n + 30);
  const forecast60Day = intercept + slope * (n + 60);
  const forecast90Day = intercept + slope * (n + 90);

  // Calculate R-squared for confidence
  const predictions = xValues.map((x) => intercept + slope * x);
  const ssRes = values.reduce((sum, val, i) => sum + (val - predictions[i]) ** 2, 0);
  const ssTot = values.reduce((sum, val) => sum + (val - meanY) ** 2, 0);
  const rSquared = 1 - ssRes / ssTot;
  const confidence = Math.max(0, Math.min(100, rSquared * 100));

  return {
    metricType,
    trend,
    changePercent: percentChange,
    confidence,
    forecast30Day: Math.max(0, forecast30Day),
    forecast60Day: Math.max(0, forecast60Day),
    forecast90Day: Math.max(0, forecast90Day),
  };
}

// Calculate time-in-range statistics
export function calculateTimeInRange(
  metrics: HealthMetric[],
  metricType: MetricType
): TimeInRangeAnalysis | null {
  const typeMetrics = metrics.filter((m) => m.type === metricType);
  if (typeMetrics.length === 0) return null;

  const config = METRIC_CONFIGS[metricType];
  if (!config) return null;

  const { min, max } = config.normalRange;
  let inRange = 0;
  let belowRange = 0;
  let aboveRange = 0;

  const values = typeMetrics.map((m) => m.value);
  const sum = values.reduce((a, b) => a + b, 0);
  const avgValue = sum / values.length;

  typeMetrics.forEach((m) => {
    if (m.value >= min && m.value <= max) {
      inRange++;
    } else if (m.value < min) {
      belowRange++;
    } else {
      aboveRange++;
    }
  });

  // Calculate standard deviation
  const squaredDiffs = values.map((v) => (v - avgValue) ** 2);
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = (stdDev / avgValue) * 100;

  return {
    metricType,
    totalReadings: typeMetrics.length,
    inRange,
    belowRange,
    aboveRange,
    percentInRange: (inRange / typeMetrics.length) * 100,
    avgValue,
    stdDev,
    coefficientOfVariation,
  };
}

// Calculate overall health score
export function calculateHealthScore(metrics: HealthMetric[]): HealthScore {
  const scores = {
    cardiovascular: 0,
    metabolic: 0,
    bodyComposition: 0,
  };

  const counts = {
    cardiovascular: 0,
    metabolic: 0,
    bodyComposition: 0,
  };

  // Categorize metrics and calculate scores
  metrics.forEach((metric) => {
    const config = METRIC_CONFIGS[metric.type];
    if (!config) return;

    const { min, max } = config.normalRange;
    let score = 0;

    // Score based on how close to optimal range
    if (metric.value >= min && metric.value <= max) {
      score = 100; // Perfect
    } else if (metric.value < min) {
      const deviation = ((min - metric.value) / min) * 100;
      score = Math.max(0, 100 - deviation);
    } else {
      const deviation = ((metric.value - max) / max) * 100;
      score = Math.max(0, 100 - deviation);
    }

    // Categorize by type
    if (['blood_pressure_systolic', 'blood_pressure_diastolic', 'heart_rate', 'cholesterol_total', 'cholesterol_ldl', 'cholesterol_hdl', 'triglycerides'].includes(metric.type)) {
      scores.cardiovascular += score;
      counts.cardiovascular++;
    } else if (['glucose', 'hba1c', 'tsh', 'free_t3', 'free_t4'].includes(metric.type)) {
      scores.metabolic += score;
      counts.metabolic++;
    } else if (['weight', 'bmi'].includes(metric.type)) {
      scores.bodyComposition += score;
      counts.bodyComposition++;
    }
  });

  // Calculate category averages
  const cardiovascular = counts.cardiovascular > 0 ? scores.cardiovascular / counts.cardiovascular : 0;
  const metabolic = counts.metabolic > 0 ? scores.metabolic / counts.metabolic : 0;
  const bodyComposition = counts.bodyComposition > 0 ? scores.bodyComposition / counts.bodyComposition : 0;

  // Overall score (weighted average)
  const overall = (cardiovascular * 0.4 + metabolic * 0.35 + bodyComposition * 0.25);

  // Determine trend (simplified - compare last 10 to previous 10)
  const recentMetrics = metrics.slice(-10);
  const previousMetrics = metrics.slice(-20, -10);

  const recentScore = recentMetrics.reduce((sum, m) => {
    const config = METRIC_CONFIGS[m.type];
    if (!config) return sum;
    const inRange = m.value >= config.normalRange.min && m.value <= config.normalRange.max;
    return sum + (inRange ? 100 : 50);
  }, 0) / recentMetrics.length;

  const previousScore = previousMetrics.reduce((sum, m) => {
    const config = METRIC_CONFIGS[m.type];
    if (!config) return sum;
    const inRange = m.value >= config.normalRange.min && m.value <= config.normalRange.max;
    return sum + (inRange ? 100 : 50);
  }, 0) / Math.max(previousMetrics.length, 1);

  const trend = recentScore > previousScore + 5 ? 'improving' :
                recentScore < previousScore - 5 ? 'declining' : 'stable';

  // Generate insights
  const improvements: string[] = [];
  const concerns: string[] = [];

  if (cardiovascular > 80) improvements.push('Excellent cardiovascular health');
  else if (cardiovascular < 60) concerns.push('Cardiovascular metrics need attention');

  if (metabolic > 80) improvements.push('Metabolic health is well-controlled');
  else if (metabolic < 60) concerns.push('Metabolic markers could be improved');

  if (bodyComposition > 80) improvements.push('Healthy body composition');
  else if (bodyComposition < 60) concerns.push('Consider focusing on weight management');

  return {
    overall: Math.round(overall),
    cardiovascular: Math.round(cardiovascular),
    metabolic: Math.round(metabolic),
    bodyComposition: Math.round(bodyComposition),
    trend,
    improvements,
    concerns,
  };
}

// Detect anomalies in health metrics
export function detectAnomalies(
  metrics: HealthMetric[],
  metricType: MetricType,
  threshold: number = 2.5 // Standard deviations
): HealthMetric[] {
  const typeMetrics = metrics.filter((m) => m.type === metricType);
  if (typeMetrics.length < 10) return [];

  const values = typeMetrics.map((m) => m.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return typeMetrics.filter((m) => {
    const zScore = Math.abs((m.value - mean) / stdDev);
    return zScore > threshold;
  });
}
