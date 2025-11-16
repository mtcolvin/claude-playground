# HealthTrack AI - Developer Guide

Complete guide for developers working on HealthTrack AI.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Testing Guidelines](#testing-guidelines)
6. [Security Best Practices](#security-best-practices)
7. [Performance Optimization](#performance-optimization)
8. [Accessibility Standards](#accessibility-standards)
9. [Internationalization](#internationalization)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **PostgreSQL**: 15.x or higher
- **npm** or **yarn**: Latest version
- **Git**: For version control

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/healthtrack.git
   cd healthtrack
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/healthtrack"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"

   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID=""
   GOOGLE_CLIENT_SECRET=""
   GITHUB_CLIENT_ID=""
   GITHUB_CLIENT_SECRET=""

   # Encryption
   ENCRYPTION_KEY="your-32-character-encryption-key"

   # Email (optional)
   SMTP_HOST=""
   SMTP_PORT=""
   SMTP_USER=""
   SMTP_PASSWORD=""
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Seed initial data (optional)
   npx prisma db seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

   Application will be available at `http://localhost:3000`

---

## Architecture Overview

### Technology Stack

**Frontend:**
- **Next.js 14**: React framework with App Router
- **React 19**: UI library
- **TypeScript 5**: Type safety
- **Tailwind CSS 4**: Styling
- **Recharts 2**: Data visualization

**Backend:**
- **Next.js API Routes**: RESTful API
- **Prisma ORM 6**: Database ORM
- **PostgreSQL 15+**: Primary database
- **NextAuth v5**: Authentication

**Security:**
- **bcrypt**: Password hashing
- **Web Crypto API**: AES-256-GCM encryption
- **CSRF protection**: Built-in Next.js protection

**Performance:**
- **IndexedDB**: Offline storage
- **Service Workers**: PWA capabilities
- **Server-Sent Events**: Real-time updates

### Application Architecture

```
┌─────────────────────────────────────────────┐
│           Client (React/Next.js)            │
│  ┌─────────────┐  ┌────────────────────┐   │
│  │ Components  │  │  State Management  │   │
│  │   (UI)      │  │   (React Query)    │   │
│  └─────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────┘
                    ↕ HTTP/SSE
┌─────────────────────────────────────────────┐
│          API Layer (Next.js API)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │  RBAC    │  │  Crypto  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
                    ↕ Prisma
┌─────────────────────────────────────────────┐
│         Database (PostgreSQL)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Users   │  │ Metrics  │  │  Files   │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication**: NextAuth v5 handles OAuth and credentials
2. **Authorization**: RBAC middleware checks permissions
3. **Request Processing**: API routes validate and process requests
4. **Data Encryption**: Sensitive data encrypted before storage
5. **Database Operations**: Prisma ORM manages database interactions
6. **Response**: Data returned (decrypted if necessary)
7. **Real-time Updates**: SSE pushes updates to connected clients

---

## Project Structure

```
healthtrack/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Main app pages
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   ├── charts/              # Chart components
│   └── *.tsx                # Feature components
├── lib/                     # Utility libraries
│   ├── auth.ts              # Authentication utilities
│   ├── encryption.ts        # Encryption utilities
│   ├── accessibility.ts     # Accessibility helpers
│   ├── i18n.ts              # Internationalization
│   ├── performance.ts       # Performance optimization
│   └── testing.ts           # Testing utilities
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Database migrations
│   └── seed.ts              # Seed data script
├── public/                  # Static assets
├── types/                   # TypeScript type definitions
├── .env                     # Environment variables (not committed)
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

---

## Development Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Production hotfixes

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(metrics): add blood glucose tracking
fix(auth): resolve session timeout issue
docs(api): update authentication documentation
```

### Code Review Process

1. Create feature branch
2. Make changes and commit
3. Push to remote repository
4. Create pull request
5. Address review comments
6. Merge after approval

### Development Commands

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Format code
npm run format

# Database commands
npx prisma studio          # Open Prisma Studio
npx prisma migrate dev     # Create and apply migration
npx prisma migrate reset   # Reset database
npx prisma db push         # Push schema without migration
```

---

## Testing Guidelines

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { MockDataGenerator, TestValidator } from '@/lib/testing'

describe('HealthMetric', () => {
  let metric: any

  beforeEach(() => {
    metric = MockDataGenerator.generateHealthMetric()
  })

  it('should create valid health metric', () => {
    expect(TestValidator.isValidHealthMetric(metric)).toBe(true)
  })

  it('should validate blood pressure range', () => {
    expect(TestValidator.isValidBloodPressure(120, 80)).toBe(true)
    expect(TestValidator.isValidBloodPressure(80, 120)).toBe(false)
  })
})
```

### Testing Best Practices

1. **Write tests first** (TDD when possible)
2. **Test one thing per test**
3. **Use descriptive test names**
4. **Mock external dependencies**
5. **Test edge cases and error conditions**
6. **Maintain test coverage above 80%**

### Test Categories

- **Unit Tests**: Individual functions/components
- **Integration Tests**: Component interactions
- **E2E Tests**: Full user workflows
- **Performance Tests**: Speed and memory
- **Accessibility Tests**: WCAG compliance
- **Security Tests**: Vulnerability scanning

---

## Security Best Practices

### Authentication & Authorization

```typescript
// Always check authentication
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Check permissions
  if (!hasPermission(session.user, 'read:metrics')) {
    return new Response('Forbidden', { status: 403 })
  }

  // Process request...
}
```

### Data Encryption

```typescript
import { encryptData, decryptData } from '@/lib/encryption'

// Encrypt before storing
const encrypted = await encryptData(sensitiveData)
await prisma.record.create({ data: { encrypted } })

// Decrypt after retrieving
const record = await prisma.record.findUnique({ where: { id } })
const decrypted = await decryptData(record.encrypted)
```

### Input Validation

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100)
})

// Validate request body
const result = schema.safeParse(requestBody)
if (!result.success) {
  return new Response(
    JSON.stringify({ error: result.error }),
    { status: 400 }
  )
}
```

### XSS Prevention

```typescript
// Always sanitize user input
import DOMPurify from 'isomorphic-dompurify'

const sanitized = DOMPurify.sanitize(userInput)
```

### CSRF Protection

Next.js provides built-in CSRF protection for API routes. Always use:

- CSRF tokens for state-changing operations
- SameSite cookie attribute
- Verify origin headers

---

## Performance Optimization

### Caching Strategy

```typescript
import { apiCache } from '@/lib/performance'

// Cache API responses
export async function GET(request: Request) {
  const url = request.url

  // Check cache first
  const cached = apiCache.getCachedResponse(url)
  if (cached) return Response.json(cached)

  // Fetch data
  const data = await fetchData()

  // Cache for 1 hour
  apiCache.cacheResponse(url, data, 3600000)

  return Response.json(data)
}
```

### Database Optimization

```typescript
// Use indexes for frequently queried fields
// prisma/schema.prisma
model HealthMetric {
  id          String   @id @default(cuid())
  userId      String
  type        String
  recordedAt  DateTime

  @@index([userId, type])           // Composite index
  @@index([recordedAt])              // Date index
}

// Use select to limit fields
const metrics = await prisma.healthMetric.findMany({
  select: {
    id: true,
    type: true,
    value: true,
    recordedAt: true
  },
  where: { userId },
  take: 20
})

// Use pagination
const metrics = await prisma.healthMetric.findMany({
  skip: (page - 1) * limit,
  take: limit
})
```

### Component Optimization

```typescript
import { memo } from 'react'

// Memoize expensive components
export const ExpensiveComponent = memo(({ data }) => {
  // Component logic
})

// Use lazy loading
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />
})
```

---

## Accessibility Standards

### WCAG 2.1 AAA Compliance

**Required practices:**

1. **Semantic HTML**
   ```tsx
   <main>
     <h1>Dashboard</h1>
     <nav aria-label="Main navigation">...</nav>
     <section aria-labelledby="metrics-heading">
       <h2 id="metrics-heading">Health Metrics</h2>
       ...
     </section>
   </main>
   ```

2. **Keyboard Navigation**
   ```tsx
   <button
     onClick={handleClick}
     onKeyDown={(e) => {
       if (e.key === 'Enter' || e.key === ' ') {
         handleClick()
       }
     }}
   >
     Submit
   </button>
   ```

3. **ARIA Labels**
   ```tsx
   <div
     role="region"
     aria-label="Blood pressure readings"
     aria-describedby="bp-description"
   >
     <p id="bp-description">Recent measurements</p>
     ...
   </div>
   ```

4. **Color Contrast** (7:1 minimum for AAA)
   ```typescript
   import { colorContrastChecker } from '@/lib/accessibility'

   const contrast = colorContrastChecker.getContrastRatio('#000000', '#FFFFFF')
   const meetsAAA = colorContrastChecker.meetsWCAG_AAA('#000000', '#FFFFFF')
   ```

5. **Focus Management**
   ```typescript
   import { focusManager } from '@/lib/accessibility'

   // Trap focus in modal
   useEffect(() => {
     const cleanup = focusManager.trapFocus(modalRef.current)
     return cleanup
   }, [])
   ```

---

## Internationalization

### Adding Translations

```typescript
// lib/i18n.ts
export const translations = {
  'en-US': {
    dashboard: 'Dashboard',
    appointments: 'Appointments',
    // ...
  },
  'es-ES': {
    dashboard: 'Panel de Control',
    appointments: 'Citas',
    // ...
  }
}
```

### Using Translations

```tsx
import { i18nManager } from '@/lib/i18n'

export function Component() {
  return (
    <div>
      <h1>{i18nManager.t('dashboard')}</h1>
      <p>{i18nManager.formatDate(new Date())}</p>
      <p>{i18nManager.formatCurrency(99.99)}</p>
    </div>
  )
}
```

### Unit Conversion

```typescript
import { i18nManager } from '@/lib/i18n'

// Convert based on user's locale
const weightInUserUnit = i18nManager.convertWeight(
  70,
  'kg',
  userLocale === 'en-US' ? 'lbs' : 'kg'
)
```

---

## Troubleshooting

### Common Issues

**Issue: Database connection fails**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify DATABASE_URL in .env
# Regenerate Prisma client
npx prisma generate
```

**Issue: Build errors**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
npm install

# Check TypeScript errors
npm run type-check
```

**Issue: Authentication not working**
```bash
# Verify NEXTAUTH_SECRET is set
# Check NEXTAUTH_URL matches your domain
# Clear browser cookies and try again
```

**Issue: Tests failing**
```bash
# Update snapshots
npm run test -- -u

# Run tests in verbose mode
npm run test -- --verbose

# Check for outdated mocks
```

### Debug Mode

Enable debug logging:

```env
# .env.local
DEBUG=*
LOG_LEVEL=debug
```

### Performance Profiling

```typescript
import { performanceMonitor } from '@/lib/performance'

performanceMonitor.start('expensive-operation')
// ... expensive operation
const duration = performanceMonitor.end('expensive-operation')
console.log(`Operation took ${duration}ms`)

// Get all metrics
const metrics = performanceMonitor.getMetrics()
```

---

## Contributing

### Code Style

- Use TypeScript for all files
- Follow ESLint and Prettier configurations
- Write descriptive variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Pull Request Checklist

- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No TypeScript errors
- [ ] Accessibility tested
- [ ] Performance impact considered

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa/index.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

## Support

For development questions:
- **Email**: dev-support@healthtrack.com
- **Slack**: #healthtrack-dev
- **Issues**: GitHub Issues

---

**Last Updated**: January 2025
**Maintainers**: HealthTrack Development Team
