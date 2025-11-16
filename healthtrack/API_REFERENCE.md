# HealthTrack AI - API Reference

Complete API documentation for all endpoints, authentication, and data models.

## Table of Contents

1. [Authentication](#authentication)
2. [Health Metrics API](#health-metrics-api)
3. [Medications API](#medications-api)
4. [Appointments API](#appointments-api)
5. [Lab Results API](#lab-results-api)
6. [Medical Files API](#medical-files-api)
7. [User Profile API](#user-profile-api)
8. [Care Team API](#care-team-api)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

---

## Authentication

All API endpoints require authentication using JWT tokens via NextAuth.

### Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd",
  "name": "John Doe",
  "dateOfBirth": "1990-01-15",
  "gender": "male"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PATIENT"
  },
  "message": "Registration successful"
}
```

#### POST `/api/auth/login`
Authenticate and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PATIENT"
  }
}
```

#### POST `/api/auth/logout`
Invalidate current session.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## Health Metrics API

### GET `/api/metrics`
Retrieve all health metrics for the authenticated user.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `type` (optional): Filter by metric type (blood_pressure, heart_rate, weight, etc.)
- `startDate` (optional): ISO 8601 date string
- `endDate` (optional): ISO 8601 date string
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `sort` (optional): Sort field (default: recordedAt)
- `order` (optional): Sort order (asc or desc, default: desc)

**Example Request:**
```
GET /api/metrics?type=blood_pressure&startDate=2024-01-01&limit=50
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "metric_123",
      "userId": "user_abc123",
      "type": "blood_pressure",
      "value": 120,
      "secondaryValue": 80,
      "unit": "mmHg",
      "recordedAt": "2024-01-15T10:30:00Z",
      "notes": "Morning reading",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

### POST `/api/metrics`
Create a new health metric.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "blood_pressure",
  "value": 120,
  "secondaryValue": 80,
  "unit": "mmHg",
  "recordedAt": "2024-01-15T10:30:00Z",
  "notes": "Morning reading"
}
```

**Response (201):**
```json
{
  "id": "metric_123",
  "userId": "user_abc123",
  "type": "blood_pressure",
  "value": 120,
  "secondaryValue": 80,
  "unit": "mmHg",
  "recordedAt": "2024-01-15T10:30:00Z",
  "notes": "Morning reading",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### GET `/api/metrics/:id`
Get a specific health metric by ID.

**Response (200):**
```json
{
  "id": "metric_123",
  "userId": "user_abc123",
  "type": "blood_pressure",
  "value": 120,
  "secondaryValue": 80,
  "unit": "mmHg",
  "recordedAt": "2024-01-15T10:30:00Z",
  "notes": "Morning reading"
}
```

### PUT `/api/metrics/:id`
Update a health metric.

**Request Body:**
```json
{
  "value": 118,
  "secondaryValue": 78,
  "notes": "Updated reading"
}
```

**Response (200):**
```json
{
  "id": "metric_123",
  "value": 118,
  "secondaryValue": 78,
  "notes": "Updated reading",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

### DELETE `/api/metrics/:id`
Delete a health metric.

**Response (200):**
```json
{
  "message": "Health metric deleted successfully"
}
```

---

## Medications API

### GET `/api/medications`
Retrieve all medications for the authenticated user.

**Query Parameters:**
- `isActive` (optional): Filter by active status (true/false)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200):**
```json
{
  "data": [
    {
      "id": "med_456",
      "userId": "user_abc123",
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "once_daily",
      "timeOfDay": ["morning"],
      "startDate": "2024-01-01",
      "endDate": null,
      "prescribingDoctor": "Dr. Smith",
      "purpose": "Blood pressure management",
      "isActive": true,
      "createdAt": "2024-01-01T09:00:00Z",
      "updatedAt": "2024-01-01T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### POST `/api/medications`
Add a new medication.

**Request Body:**
```json
{
  "name": "Lisinopril",
  "dosage": "10mg",
  "frequency": "once_daily",
  "timeOfDay": ["morning"],
  "startDate": "2024-01-01",
  "prescribingDoctor": "Dr. Smith",
  "purpose": "Blood pressure management"
}
```

**Response (201):**
```json
{
  "id": "med_456",
  "userId": "user_abc123",
  "name": "Lisinopril",
  "dosage": "10mg",
  "frequency": "once_daily",
  "isActive": true
}
```

### PUT `/api/medications/:id`
Update a medication.

**Request Body:**
```json
{
  "dosage": "20mg",
  "notes": "Dosage increased per doctor's recommendation"
}
```

### DELETE `/api/medications/:id`
Delete (or mark inactive) a medication.

---

## Appointments API

### GET `/api/appointments`
Retrieve all appointments.

**Query Parameters:**
- `status` (optional): scheduled, confirmed, completed, cancelled
- `startDate` (optional): Filter appointments after this date
- `endDate` (optional): Filter appointments before this date

**Response (200):**
```json
{
  "data": [
    {
      "id": "appt_789",
      "userId": "user_abc123",
      "providerId": "provider_001",
      "title": "Annual Physical",
      "type": "checkup",
      "dateTime": "2024-02-15T14:00:00Z",
      "duration": 30,
      "location": "Main Clinic, Room 201",
      "locationType": "in_person",
      "status": "scheduled",
      "notes": "Bring insurance card",
      "provider": {
        "id": "provider_001",
        "name": "Dr. Sarah Johnson",
        "specialty": "Family Medicine"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

### POST `/api/appointments`
Schedule a new appointment.

**Request Body:**
```json
{
  "providerId": "provider_001",
  "title": "Annual Physical",
  "type": "checkup",
  "dateTime": "2024-02-15T14:00:00Z",
  "duration": 30,
  "location": "Main Clinic, Room 201",
  "locationType": "in_person",
  "notes": "Bring insurance card"
}
```

### PUT `/api/appointments/:id`
Update an appointment.

**Request Body:**
```json
{
  "dateTime": "2024-02-15T15:00:00Z",
  "status": "confirmed"
}
```

### DELETE `/api/appointments/:id`
Cancel an appointment.

---

## Lab Results API

### GET `/api/lab-results`
Retrieve all lab results.

**Query Parameters:**
- `category` (optional): hematology, chemistry, immunology, etc.
- `status` (optional): normal, abnormal, critical
- `startDate` (optional)
- `endDate` (optional)

**Response (200):**
```json
{
  "data": [
    {
      "id": "lab_321",
      "userId": "user_abc123",
      "testName": "Complete Blood Count (CBC)",
      "category": "hematology",
      "orderDate": "2024-01-10",
      "resultDate": "2024-01-12",
      "status": "normal",
      "orderingProvider": "Dr. Johnson",
      "results": [
        {
          "name": "White Blood Cells",
          "value": 7.2,
          "unit": "K/μL",
          "referenceRange": "4.0-11.0",
          "status": "normal"
        },
        {
          "name": "Red Blood Cells",
          "value": 4.8,
          "unit": "M/μL",
          "referenceRange": "4.2-5.8",
          "status": "normal"
        }
      ]
    }
  ]
}
```

### POST `/api/lab-results`
Add new lab results.

**Request Body:**
```json
{
  "testName": "Complete Blood Count (CBC)",
  "category": "hematology",
  "orderDate": "2024-01-10",
  "resultDate": "2024-01-12",
  "orderingProvider": "Dr. Johnson",
  "results": [
    {
      "name": "White Blood Cells",
      "value": 7.2,
      "unit": "K/μL",
      "referenceRange": "4.0-11.0"
    }
  ]
}
```

---

## Medical Files API

### GET `/api/files`
Retrieve all medical files.

**Query Parameters:**
- `category` (optional): medical_records, lab_results, imaging, insurance, etc.
- `fileType` (optional): pdf, dicom, image, document

**Response (200):**
```json
{
  "data": [
    {
      "id": "file_654",
      "userId": "user_abc123",
      "fileName": "chest_xray_2024.dcm",
      "fileType": "dicom",
      "category": "imaging",
      "fileSize": 2048000,
      "uploadDate": "2024-01-15",
      "encryptedUrl": "https://storage.example.com/encrypted/...",
      "description": "Chest X-ray for annual checkup"
    }
  ]
}
```

### POST `/api/files`
Upload a new medical file.

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: Binary file data
- `category`: File category
- `description`: Optional description

**Response (201):**
```json
{
  "id": "file_654",
  "fileName": "chest_xray_2024.dcm",
  "fileSize": 2048000,
  "encryptedUrl": "https://storage.example.com/encrypted/..."
}
```

### DELETE `/api/files/:id`
Delete a medical file.

---

## User Profile API

### GET `/api/user/profile`
Get authenticated user's profile.

**Response (200):**
```json
{
  "id": "user_abc123",
  "email": "user@example.com",
  "name": "John Doe",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "phone": "+1-555-0123",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "spouse",
    "phone": "+1-555-0124"
  },
  "preferences": {
    "theme": "light",
    "language": "en-US",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    }
  }
}
```

### PUT `/api/user/profile`
Update user profile.

**Request Body:**
```json
{
  "name": "John A. Doe",
  "phone": "+1-555-9999",
  "preferences": {
    "theme": "dark"
  }
}
```

---

## Care Team API

### GET `/api/care-team`
Get all care team members.

**Response (200):**
```json
{
  "data": [
    {
      "id": "provider_001",
      "type": "provider",
      "name": "Dr. Sarah Johnson",
      "specialty": "Family Medicine",
      "phone": "+1-555-1234",
      "email": "sjohnson@clinic.com",
      "address": "123 Medical Plaza",
      "isPrimary": true
    },
    {
      "id": "caregiver_001",
      "type": "caregiver",
      "name": "Mary Smith",
      "relationship": "daughter",
      "phone": "+1-555-5678",
      "isEmergencyContact": true
    }
  ]
}
```

### POST `/api/care-team`
Add a care team member.

**Request Body:**
```json
{
  "type": "provider",
  "name": "Dr. Sarah Johnson",
  "specialty": "Family Medicine",
  "phone": "+1-555-1234",
  "email": "sjohnson@clinic.com",
  "isPrimary": true
}
```

---

## Error Handling

All errors follow a consistent format:

**Error Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Error Codes

- `AUTHENTICATION_REQUIRED` (401): User not authenticated
- `FORBIDDEN` (403): User lacks permission
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid request data
- `CONFLICT` (409): Resource conflict (e.g., duplicate email)
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## Rate Limiting

API requests are rate-limited per user:

- **Standard endpoints**: 100 requests per minute
- **File upload**: 20 requests per minute
- **Authentication**: 10 requests per minute

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

**Rate Limit Exceeded Response (429):**
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Pagination Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

## Filtering and Sorting

### Filtering
Use query parameters to filter results:
```
GET /api/metrics?type=blood_pressure&startDate=2024-01-01
```

### Sorting
Use `sort` and `order` parameters:
```
GET /api/metrics?sort=recordedAt&order=desc
```

Supported sort fields vary by endpoint but typically include:
- `createdAt`, `updatedAt`, `recordedAt`, `name`, `date`

---

## Data Models

### Health Metric Types

- `blood_pressure`: Systolic/diastolic (mmHg)
- `heart_rate`: Beats per minute (bpm)
- `weight`: Kilograms or pounds
- `height`: Centimeters or inches
- `blood_glucose`: mg/dL or mmol/L
- `temperature`: Celsius or Fahrenheit
- `oxygen_saturation`: Percentage (%)
- `bmi`: Body Mass Index

### Medication Frequencies

- `once_daily`: Once per day
- `twice_daily`: Twice per day
- `three_times_daily`: Three times per day
- `four_times_daily`: Four times per day
- `every_other_day`: Every other day
- `weekly`: Once per week
- `as_needed`: As needed (PRN)

### Appointment Types

- `checkup`: Routine checkup
- `follow_up`: Follow-up visit
- `consultation`: Specialist consultation
- `procedure`: Medical procedure
- `lab_work`: Laboratory testing
- `imaging`: Imaging studies
- `therapy`: Therapy session
- `vaccination`: Vaccination appointment

### Location Types

- `in_person`: In-person visit
- `telemedicine`: Video call
- `phone`: Phone call

---

## Authentication Flow

1. **Register** or **Login** to receive JWT token
2. Include token in `Authorization` header for all requests
3. Token expires after 30 days (configurable)
4. Refresh token before expiration or login again

**Example Authorization Header:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Security

- All endpoints use HTTPS
- Passwords are hashed with bcrypt
- Sensitive data is encrypted with AES-256-GCM
- CSRF protection enabled
- XSS prevention measures
- SQL injection protection via Prisma ORM
- Rate limiting to prevent abuse
- HIPAA-compliant data handling

---

## Support

For API support and questions:
- Email: api-support@healthtrack.com
- Documentation: https://docs.healthtrack.com
- Status: https://status.healthtrack.com

---

**API Version**: 1.0.0
**Last Updated**: January 2025
**Base URL**: `https://api.healthtrack.com/v1`
