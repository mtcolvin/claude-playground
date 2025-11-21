# Health Data Upload Test Samples

This directory contains sample files for testing the health data upload and parsing functionality.

## Sample Files

### 1. `health-data-sample.csv`
CSV format with health metrics. Supports the following structure:
```csv
test_name,value,unit,date
glucose,95,mg/dL,2025-01-15
cholesterol,180,mg/dL,2025-01-15
```

### 2. `health-data-sample.json`
JSON format with health metrics array:
```json
{
  "metrics": [
    {
      "type": "glucose",
      "value": 95,
      "unit": "mg/dL",
      "date": "2025-01-15T08:30:00Z",
      "notes": "Fasting glucose test"
    }
  ]
}
```

### 3. `health-data-sample.txt`
Plain text format with natural language:
```
Blood Glucose: 95 mg/dL
Blood Pressure: 118/78 mmHg
Heart Rate: 72 bpm
```

## Supported Health Metrics

The parser supports extraction of the following metrics:

### Blood Tests
- Glucose, Blood Sugar, HbA1c
- Cholesterol (Total, LDL, HDL)
- Triglycerides
- Thyroid (TSH, Free T3, Free T4)
- Vitamins (D, B12)
- Iron, Ferritin
- Kidney Function (Creatinine, GFR)
- Liver Function (ALT, AST, Albumin)
- Complete Blood Count (Hemoglobin, WBC, Platelets)
- Calcium

### Vital Signs
- Blood Pressure (Systolic/Diastolic)
- Heart Rate, Pulse
- Temperature
- Oxygen Saturation (SpO2)

### Body Composition
- Weight
- BMI

## How to Use

1. Navigate to the Medical Files page in the application
2. Upload any of these sample files
3. The system will automatically:
   - Parse the file for health metrics
   - Extract values, units, and dates
   - Save metrics to your profile
   - Display the number of extracted metrics

## File Format Guidelines

### CSV Format
- Header row (optional): `test_name, value, unit, date`
- Comma, semicolon, or tab-separated values
- Date format: ISO 8601 or common date formats

### JSON Format
- Array of metric objects
- Each object should have: `type`, `value`, `unit`
- Optional fields: `date`, `notes`

### Text Format
- Natural language format
- Pattern: `Test Name: Value Unit`
- Example: `Glucose: 95 mg/dL`
- Special support for blood pressure: `120/80 mmHg`

## Error Handling

The parser will:
- Continue processing even if some metrics fail
- Return a list of successfully extracted metrics
- Provide error messages for failed extractions
- Save all successfully parsed metrics to the database
