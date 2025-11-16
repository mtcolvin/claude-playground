# HealthTrack AI - REST API Documentation

## Base URL
```
/api/v1
```

## Authentication
All endpoints require authentication via NextAuth session unless otherwise noted. Include session cookie in requests.

## API Endpoints

### Authentication & User Management

#### Profile
- `GET /api/v1/profile` - Get user profile
- `PUT /api/v1/profile` - Update user profile

### Health Metrics

#### Health Metrics
- `GET /api/v1/metrics` - List health metrics
  - Query params: `type`, `startDate`, `endDate`, `minValue`, `maxValue`, `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/v1/metrics` - Create health metric
- `GET /api/v1/metrics/:id` - Get specific metric
- `PUT /api/v1/metrics/:id` - Update metric
- `DELETE /api/v1/metrics/:id` - Delete metric

#### Medications
- `GET /api/v1/medications` - List medications
  - Query params: `isActive`, `search`, `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/v1/medications` - Create medication
- `GET /api/v1/medications/:id` - Get specific medication
- `PUT /api/v1/medications/:id` - Update medication
- `DELETE /api/v1/medications/:id` - Delete medication

#### Lab Results
- `GET /api/v1/lab-results` - List lab results
  - Query params: `category`, `startDate`, `endDate`, `search`, `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/v1/lab-results` - Create lab result
- `GET /api/v1/lab-results/:id` - Get specific lab result
- `PUT /api/v1/lab-results/:id` - Update lab result
- `DELETE /api/v1/lab-results/:id` - Delete lab result

#### Appointments
- `GET /api/v1/appointments` - List appointments
  - Query params: `status`, `type`, `startDate`, `endDate`, `search`, `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments/:id` - Get specific appointment
- `PUT /api/v1/appointments/:id` - Update appointment
- `DELETE /api/v1/appointments/:id` - Delete appointment

#### Medical Files
- `GET /api/v1/medical-files` - List medical files
  - Query params: `type`, `category`, `search`, `tags`, `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/v1/medical-files` - Create medical file record
- `GET /api/v1/medical-files/:id` - Get specific medical file
- `PUT /api/v1/medical-files/:id` - Update medical file
- `DELETE /api/v1/medical-files/:id` - Delete medical file

### Clinical Records

#### Immunizations
- `GET /api/v1/immunizations` - List immunizations
- `POST /api/v1/immunizations` - Create immunization

#### Allergies
- `GET /api/v1/allergies` - List allergies
  - Query params: `isActive`, `type`, `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/v1/allergies` - Create allergy

#### Conditions
- `GET /api/v1/conditions` - List conditions
  - Query params: `status`, `search`, `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/v1/conditions` - Create condition

### Lifestyle & Wellness

#### Health Goals
- `GET /api/v1/health-goals` - List health goals
  - Query params: `status`, `category`, `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/v1/health-goals` - Create health goal

#### Mood Tracking
- `GET /api/v1/mood-entries` - List mood entries
  - Query params: `startDate`, `endDate`, `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/v1/mood-entries` - Create mood entry

#### Nutrition
- `GET /api/v1/nutrition` - List nutrition entries
  - Query params: `mealType`, `startDate`, `endDate`, `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/v1/nutrition` - Create nutrition entry

#### Exercise
- `GET /api/v1/exercise` - List exercise sessions
  - Query params: `type`, `intensity`, `startDate`, `endDate`, `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/v1/exercise` - Create exercise session

#### Sleep
- `GET /api/v1/sleep` - List sleep sessions
  - Query params: `startDate`, `endDate`, `minQuality`, `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/v1/sleep` - Create sleep session

#### Water Intake
- `GET /api/v1/water-intake` - List water intake entries
  - Query params: `startDate`, `endDate`, `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/v1/water-intake` - Create water intake entry

#### Menstrual Cycles
- `GET /api/v1/menstrual-cycles` - List menstrual cycles
  - Query params: `startDate`, `endDate`, `page`, `limit`, `sortBy`, `sortOrder`
- `POST /api/v1/menstrual-cycles` - Create menstrual cycle

### Care Management

#### Emergency Contacts
- `GET /api/v1/emergency-contacts` - List emergency contacts
- `POST /api/v1/emergency-contacts` - Create emergency contact

#### Care Team
- `GET /api/v1/care-team` - List care team members
- `POST /api/v1/care-team` - Create care team member

### Insights & Analytics

#### Dashboard Stats
- `GET /api/v1/dashboard/stats` - Get dashboard statistics
  - Returns: overview stats, upcoming appointments, weekly activity summary

#### AI Insights
- `GET /api/v1/insights` - Get AI-powered health insights
  - Query params: `category` (optional: sleep, exercise, mood, nutrition)
  - Returns: personalized insights, recommendations, and correlations

### Notifications

#### Notifications
- `GET /api/v1/notifications` - List notifications
  - Query params: `isRead`, `type`, `page`, `limit`, `sortBy`, `sortOrder`
- `PUT /api/v1/notifications/mark-read` - Mark notifications as read

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Pagination

All list endpoints support pagination via query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

## Sorting

All list endpoints support sorting via query parameters:
- `sortBy` - Field to sort by (default varies by endpoint)
- `sortOrder` - Sort direction: `asc` or `desc` (default: `desc`)

## Filtering

Endpoints support various filters specific to the resource type. Common filters:
- `startDate` / `endDate` - Date range filtering (ISO 8601 format)
- `search` - Text search
- `type` / `category` / `status` - Enum filtering
- `isActive` - Boolean filtering

## Rate Limiting

Rate limits can be configured per endpoint. Default: 100 requests per minute per IP.

## Audit Logging

All create, update, and delete operations are automatically logged in the audit trail with:
- User ID
- Action type
- Resource type and ID
- IP address
- User agent
- Timestamp
- Additional details

## Permissions

Endpoints enforce role-based permissions:
- `READ_OWN_DATA` - View own health data
- `WRITE_OWN_DATA` - Create/update own health data
- `DELETE_OWN_DATA` - Delete own health data
- `READ_PATIENT_DATA` - View patient data (caregivers, providers)
- `WRITE_PATIENT_DATA` - Modify patient data (providers)
- `ADMIN_*` - Administrative permissions

See `/lib/rbac.ts` for complete permission list.
