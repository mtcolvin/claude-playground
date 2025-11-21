/**
 * Health Data Parser Utility
 * Parses uploaded files to extract health metrics
 */

import { MetricType } from "./types"

export interface ParsedHealthMetric {
  type: MetricType
  value: number
  unit: string
  date?: Date
  notes?: string
}

export interface ParseResult {
  metrics: ParsedHealthMetric[]
  errors: string[]
}

// Mapping of common test names to metric types
const METRIC_MAPPINGS: Record<string, { type: MetricType; unit: string }> = {
  // Blood Pressure
  'systolic': { type: 'blood_pressure_systolic', unit: 'mmHg' },
  'blood pressure systolic': { type: 'blood_pressure_systolic', unit: 'mmHg' },
  'bp systolic': { type: 'blood_pressure_systolic', unit: 'mmHg' },
  'diastolic': { type: 'blood_pressure_diastolic', unit: 'mmHg' },
  'blood pressure diastolic': { type: 'blood_pressure_diastolic', unit: 'mmHg' },
  'bp diastolic': { type: 'blood_pressure_diastolic', unit: 'mmHg' },

  // Heart
  'heart rate': { type: 'heart_rate', unit: 'bpm' },
  'pulse': { type: 'heart_rate', unit: 'bpm' },
  'hr': { type: 'heart_rate', unit: 'bpm' },

  // Glucose
  'glucose': { type: 'glucose', unit: 'mg/dL' },
  'blood glucose': { type: 'glucose', unit: 'mg/dL' },
  'blood sugar': { type: 'glucose', unit: 'mg/dL' },
  'fasting glucose': { type: 'glucose', unit: 'mg/dL' },
  'hba1c': { type: 'hba1c', unit: '%' },
  'a1c': { type: 'hba1c', unit: '%' },
  'hemoglobin a1c': { type: 'hba1c', unit: '%' },

  // Cholesterol
  'total cholesterol': { type: 'cholesterol_total', unit: 'mg/dL' },
  'cholesterol': { type: 'cholesterol_total', unit: 'mg/dL' },
  'ldl': { type: 'cholesterol_ldl', unit: 'mg/dL' },
  'ldl cholesterol': { type: 'cholesterol_ldl', unit: 'mg/dL' },
  'hdl': { type: 'cholesterol_hdl', unit: 'mg/dL' },
  'hdl cholesterol': { type: 'cholesterol_hdl', unit: 'mg/dL' },
  'triglycerides': { type: 'triglycerides', unit: 'mg/dL' },

  // Body Composition
  'weight': { type: 'weight', unit: 'kg' },
  'body weight': { type: 'weight', unit: 'kg' },
  'bmi': { type: 'bmi', unit: 'kg/m²' },
  'body mass index': { type: 'bmi', unit: 'kg/m²' },

  // Vitals
  'temperature': { type: 'temperature', unit: '°C' },
  'body temperature': { type: 'temperature', unit: '°C' },
  'temp': { type: 'temperature', unit: '°C' },
  'oxygen saturation': { type: 'oxygen_saturation', unit: '%' },
  'o2 saturation': { type: 'oxygen_saturation', unit: '%' },
  'spo2': { type: 'oxygen_saturation', unit: '%' },

  // Thyroid
  'tsh': { type: 'tsh', unit: 'mIU/L' },
  'thyroid stimulating hormone': { type: 'tsh', unit: 'mIU/L' },
  'free t3': { type: 'free_t3', unit: 'pg/mL' },
  't3': { type: 'free_t3', unit: 'pg/mL' },
  'free t4': { type: 'free_t4', unit: 'ng/dL' },
  't4': { type: 'free_t4', unit: 'ng/dL' },

  // Vitamins
  'vitamin d': { type: 'vitamin_d', unit: 'ng/mL' },
  'vit d': { type: 'vitamin_d', unit: 'ng/mL' },
  'vitamin b12': { type: 'vitamin_b12', unit: 'pg/mL' },
  'b12': { type: 'vitamin_b12', unit: 'pg/mL' },

  // Iron
  'iron': { type: 'iron', unit: 'μg/dL' },
  'serum iron': { type: 'iron', unit: 'μg/dL' },
  'ferritin': { type: 'ferritin', unit: 'ng/mL' },

  // Kidney Function
  'creatinine': { type: 'creatinine', unit: 'mg/dL' },
  'serum creatinine': { type: 'creatinine', unit: 'mg/dL' },
  'gfr': { type: 'gfr', unit: 'mL/min/1.73m²' },
  'egfr': { type: 'gfr', unit: 'mL/min/1.73m²' },

  // Liver Function
  'alt': { type: 'alt', unit: 'U/L' },
  'alanine aminotransferase': { type: 'alt', unit: 'U/L' },
  'sgpt': { type: 'alt', unit: 'U/L' },
  'ast': { type: 'ast', unit: 'U/L' },
  'aspartate aminotransferase': { type: 'ast', unit: 'U/L' },
  'sgot': { type: 'ast', unit: 'U/L' },
  'albumin': { type: 'albumin', unit: 'g/dL' },
  'serum albumin': { type: 'albumin', unit: 'g/dL' },

  // Other Blood Tests
  'calcium': { type: 'calcium', unit: 'mg/dL' },
  'serum calcium': { type: 'calcium', unit: 'mg/dL' },
  'hemoglobin': { type: 'hemoglobin', unit: 'g/dL' },
  'hgb': { type: 'hemoglobin', unit: 'g/dL' },
  'hb': { type: 'hemoglobin', unit: 'g/dL' },
  'white blood cells': { type: 'white_blood_cells', unit: '10³/μL' },
  'wbc': { type: 'white_blood_cells', unit: '10³/μL' },
  'platelets': { type: 'platelets', unit: '10³/μL' },
  'plt': { type: 'platelets', unit: '10³/μL' },
}

/**
 * Parse health data from CSV content
 */
function parseCSV(content: string): ParseResult {
  const metrics: ParsedHealthMetric[] = []
  const errors: string[] = []

  try {
    const lines = content.split('\n').filter(line => line.trim())
    if (lines.length === 0) {
      return { metrics, errors: ['Empty CSV file'] }
    }

    // Try to detect CSV format
    const firstLine = lines[0].toLowerCase()
    const hasHeader = firstLine.includes('test') || firstLine.includes('metric') ||
                      firstLine.includes('name') || firstLine.includes('type')

    const dataLines = hasHeader ? lines.slice(1) : lines

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim()
      if (!line) continue

      const parts = line.split(/[,;\t]/).map(p => p.trim())

      // Support various CSV formats:
      // Format 1: test_name, value, unit, date
      // Format 2: test_name, value, unit
      // Format 3: test_name, value

      if (parts.length >= 2) {
        const testName = parts[0].toLowerCase()
        const valueStr = parts[1]
        const unit = parts.length >= 3 ? parts[2] : undefined
        const dateStr = parts.length >= 4 ? parts[3] : undefined

        // Try to parse value
        const value = parseFloat(valueStr.replace(/[^\d.-]/g, ''))
        if (isNaN(value)) {
          errors.push(`Line ${i + (hasHeader ? 2 : 1)}: Could not parse value "${valueStr}"`)
          continue
        }

        // Find matching metric type
        const mapping = METRIC_MAPPINGS[testName]
        if (mapping) {
          const metric: ParsedHealthMetric = {
            type: mapping.type,
            value,
            unit: unit || mapping.unit,
          }

          // Parse date if provided
          if (dateStr) {
            const date = new Date(dateStr)
            if (!isNaN(date.getTime())) {
              metric.date = date
            }
          }

          metrics.push(metric)
        } else {
          errors.push(`Line ${i + (hasHeader ? 2 : 1)}: Unknown test "${parts[0]}"`)
        }
      }
    }
  } catch (error) {
    errors.push(`CSV parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return { metrics, errors }
}

/**
 * Parse health data from plain text content
 */
function parseText(content: string): ParseResult {
  const metrics: ParsedHealthMetric[] = []
  const errors: string[] = []

  try {
    const lines = content.split('\n')

    for (const line of lines) {
      const trimmed = line.trim().toLowerCase()
      if (!trimmed) continue

      // Try to find patterns like:
      // "glucose: 95 mg/dL"
      // "blood pressure: 120/80"
      // "weight = 75 kg"
      // "cholesterol 180"

      // Pattern 1: name: value unit
      let match = trimmed.match(/^([a-z\s]+)[:=]\s*(\d+\.?\d*)\s*([a-z/°²³μ%]+)?/i)
      if (match) {
        const testName = match[1].trim()
        const value = parseFloat(match[2])
        const unit = match[3]

        const mapping = METRIC_MAPPINGS[testName]
        if (mapping && !isNaN(value)) {
          metrics.push({
            type: mapping.type,
            value,
            unit: unit || mapping.unit,
          })
          continue
        }
      }

      // Pattern 2: blood pressure special case (120/80)
      match = trimmed.match(/(?:blood pressure|bp)[:=]?\s*(\d+)\s*\/\s*(\d+)/i)
      if (match) {
        const systolic = parseFloat(match[1])
        const diastolic = parseFloat(match[2])

        if (!isNaN(systolic)) {
          metrics.push({
            type: 'blood_pressure_systolic',
            value: systolic,
            unit: 'mmHg',
          })
        }

        if (!isNaN(diastolic)) {
          metrics.push({
            type: 'blood_pressure_diastolic',
            value: diastolic,
            unit: 'mmHg',
          })
        }
        continue
      }
    }
  } catch (error) {
    errors.push(`Text parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return { metrics, errors }
}

/**
 * Parse health data from JSON content
 */
function parseJSON(content: string): ParseResult {
  const metrics: ParsedHealthMetric[] = []
  const errors: string[] = []

  try {
    const data = JSON.parse(content)

    // Handle array of metrics
    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        const result = parseJSONItem(item, i)
        metrics.push(...result.metrics)
        errors.push(...result.errors)
      }
    }
    // Handle object with metrics array
    else if (data.metrics && Array.isArray(data.metrics)) {
      for (let i = 0; i < data.metrics.length; i++) {
        const item = data.metrics[i]
        const result = parseJSONItem(item, i)
        metrics.push(...result.metrics)
        errors.push(...result.errors)
      }
    }
    // Handle single metric object
    else {
      const result = parseJSONItem(data, 0)
      metrics.push(...result.metrics)
      errors.push(...result.errors)
    }
  } catch (error) {
    errors.push(`JSON parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return { metrics, errors }
}

function parseJSONItem(item: any, index: number): ParseResult {
  const metrics: ParsedHealthMetric[] = []
  const errors: string[] = []

  try {
    // Support direct format with type field
    if (item.type && item.value !== undefined) {
      const typeKey = item.type.toLowerCase()
      const mapping = METRIC_MAPPINGS[typeKey]

      if (mapping) {
        const value = parseFloat(item.value)
        if (!isNaN(value)) {
          const metric: ParsedHealthMetric = {
            type: mapping.type,
            value,
            unit: item.unit || mapping.unit,
          }

          if (item.date) {
            const date = new Date(item.date)
            if (!isNaN(date.getTime())) {
              metric.date = date
            }
          }

          if (item.notes) {
            metric.notes = String(item.notes)
          }

          metrics.push(metric)
        } else {
          errors.push(`Item ${index}: Invalid value "${item.value}"`)
        }
      } else {
        errors.push(`Item ${index}: Unknown metric type "${item.type}"`)
      }
    }
    // Support name/value format
    else if (item.name && item.value !== undefined) {
      const nameKey = item.name.toLowerCase()
      const mapping = METRIC_MAPPINGS[nameKey]

      if (mapping) {
        const value = parseFloat(item.value)
        if (!isNaN(value)) {
          const metric: ParsedHealthMetric = {
            type: mapping.type,
            value,
            unit: item.unit || mapping.unit,
          }

          if (item.date) {
            const date = new Date(item.date)
            if (!isNaN(date.getTime())) {
              metric.date = date
            }
          }

          if (item.notes) {
            metric.notes = String(item.notes)
          }

          metrics.push(metric)
        }
      }
    }
  } catch (error) {
    errors.push(`Item ${index} parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return { metrics, errors }
}

/**
 * Main parser function that detects file type and parses accordingly
 */
export async function parseHealthData(
  fileContent: Buffer | string,
  fileName: string,
  mimeType: string
): Promise<ParseResult> {
  // Convert Buffer to string if needed
  let content: string
  if (Buffer.isBuffer(fileContent)) {
    content = fileContent.toString('utf-8')
  } else {
    content = fileContent
  }

  // Detect format based on file extension and mime type
  const extension = fileName.toLowerCase().split('.').pop()

  // Try JSON first
  if (extension === 'json' || mimeType.includes('json')) {
    return parseJSON(content)
  }

  // Try CSV
  if (extension === 'csv' || mimeType.includes('csv') || content.includes(',')) {
    const result = parseCSV(content)
    if (result.metrics.length > 0) {
      return result
    }
  }

  // Try text parsing as fallback
  const textResult = parseText(content)

  // If we found metrics in text, return them
  if (textResult.metrics.length > 0) {
    return textResult
  }

  // If no metrics found, return empty result with helpful error
  return {
    metrics: [],
    errors: [
      'Could not extract health metrics from file. Supported formats:',
      '- CSV: test_name, value, unit, date',
      '- JSON: {"type": "glucose", "value": 95, "unit": "mg/dL"}',
      '- Text: glucose: 95 mg/dL',
    ],
  }
}

/**
 * Get supported metric types for documentation
 */
export function getSupportedMetrics(): string[] {
  return Array.from(new Set(Object.values(METRIC_MAPPINGS).map(m => m.type)))
}
