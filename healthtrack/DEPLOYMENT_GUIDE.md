# HealthTrack AI - Full Deployment Guide

This guide will help you deploy the full version of HealthTrack AI with all 40+ features enabled using a PostgreSQL database.

## 📋 Prerequisites

Before starting, ensure you have:
- **Node.js** 18+ installed
- **PostgreSQL** 14+ installed (or access to a PostgreSQL instance)
- **Git** installed
- Terminal/Command line access

---

## 🚀 Deployment Steps

### Step 1: Database Setup

#### Option A: Local PostgreSQL (Recommended for Testing)

1. **Install PostgreSQL** (if not already installed):
   - **macOS**: `brew install postgresql@14 && brew services start postgresql@14`
   - **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`
   - **Windows**: Download from https://www.postgresql.org/download/windows/

2. **Create Database & User**:
   ```bash
   # Access PostgreSQL
   psql -U postgres

   # In PostgreSQL shell:
   CREATE DATABASE healthtrack;
   CREATE USER healthtrack_user WITH PASSWORD 'your_secure_password_here';
   GRANT ALL PRIVILEGES ON DATABASE healthtrack TO healthtrack_user;
   \q
   ```

#### Option B: Cloud PostgreSQL (Production)

Choose one of these providers:
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **Supabase**: https://supabase.com (Free tier available)
- **Railway**: https://railway.app
- **Neon**: https://neon.tech (Serverless Postgres)

Get your connection string from the provider dashboard.

---

### Step 2: Environment Configuration

1. **Create Environment File**:
   ```bash
   cd /home/user/claude-playground/healthtrack
   cp .env.example .env
   ```

2. **Edit `.env` file** with your database credentials:
   ```env
   # Database
   DATABASE_URL="postgresql://healthtrack_user:your_secure_password_here@localhost:5432/healthtrack?schema=public"

   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-a-random-secret-here-use-openssl-rand-base64-32"

   # Optional: OAuth Providers (for social login)
   # GOOGLE_CLIENT_ID=""
   # GOOGLE_CLIENT_SECRET=""
   # GITHUB_CLIENT_ID=""
   # GITHUB_CLIENT_SECRET=""

   # Optional: AI Features (Anthropic Claude)
   # ANTHROPIC_API_KEY=""
   ```

3. **Generate NEXTAUTH_SECRET**:
   ```bash
   # Run this command to generate a secure secret:
   openssl rand -base64 32
   # Copy the output and paste it as NEXTAUTH_SECRET in .env
   ```

---

### Step 3: Install Dependencies

```bash
cd /home/user/claude-playground/healthtrack
npm install
```

---

### Step 4: Database Migration

1. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

2. **Push Database Schema**:
   ```bash
   # For development (creates tables without migrations)
   npm run db:push

   # OR for production (creates migration files)
   npm run db:migrate
   ```

3. **Verify Database Setup**:
   ```bash
   # Open Prisma Studio to view database
   npm run db:studio
   # Visit http://localhost:5555 to see your database
   ```

---

### Step 5: Seed Demo Data (Optional)

Run the seed script to populate with demo data:
```bash
npm run db:seed
```

This will create:
- Demo user accounts
- Sample health metrics
- Lab results
- Medical records
- AI insights

---

### Step 6: Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** to see your fully deployed application!

---

## 🔧 Feature Configuration

### Enable OAuth Login (Optional)

1. **Google OAuth**:
   - Go to https://console.cloud.google.com/
   - Create a new project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Secret to `.env`

2. **GitHub OAuth**:
   - Go to https://github.com/settings/developers
   - Create new OAuth App
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - Copy Client ID and Secret to `.env`

### Enable AI Features (Optional)

1. Get Anthropic API key from https://console.anthropic.com/
2. Add to `.env`: `ANTHROPIC_API_KEY="your-api-key"`
3. AI-powered features will automatically activate:
   - Symptom checker
   - Health insights generation
   - Medical report analysis
   - Predictive analytics

---

## 📊 Available Features After Deployment

Once deployed, you'll have access to ALL features:

### ✅ Core Features (Already Working)
- User authentication with secure passwords
- Health metrics tracking (26+ types)
- Medical file upload & management
- Lab results viewing
- AI insights generation
- Patient profile management

### 🆕 Newly Enabled Features
- **Nutrition Tracking** - Log meals, calories, macros
- **Sleep Tracking** - Monitor sleep quality & patterns
- **Exercise Tracking** - Log workouts & activities
- **Mental Health** - Mood tracking, PHQ-9/GAD-7 assessments
- **Women's Health** - Menstrual cycle tracking
- **Symptom Checker** - AI-powered symptom analysis
- **Medication Management** - Reminders & adherence tracking
- **Appointment Scheduler** - Calendar with reminders
- **Care Team** - Manage healthcare providers
- **Health Goals** - Set & track health goals
- **Advanced Analytics** - Predictive insights, correlations
- **Health Reports** - PDF report generation
- **Data Export** - Export to various formats
- **Search** - Global search across all health data
- **Notifications** - Custom alert system
- **Audit Logs** - HIPAA compliance tracking

---

## 🔐 Security Notes

### Important for Production:

1. **Change Default Passwords**: Never use default database passwords in production
2. **Use HTTPS**: Always use HTTPS in production (set `NEXTAUTH_URL` to https://)
3. **Secure Secrets**: Use strong random strings for `NEXTAUTH_SECRET`
4. **Environment Variables**: Never commit `.env` file to git
5. **Database Backups**: Set up regular PostgreSQL backups
6. **Rate Limiting**: Consider adding rate limiting for API endpoints
7. **CORS Configuration**: Configure proper CORS settings

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql "postgresql://healthtrack_user:password@localhost:5432/healthtrack"

# Check if PostgreSQL is running
pg_isready

# View Prisma logs
DEBUG=* npm run db:push
```

### Migration Errors

```bash
# Reset database (WARNING: deletes all data)
npm run db:reset

# Re-run migrations
npm run db:migrate
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Prisma Client Out of Sync

```bash
# Regenerate Prisma client
npm run db:generate

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📦 Production Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to https://vercel.com
   - Import your GitHub repository
   - Add environment variables from `.env`
   - Deploy!

3. **Set up Vercel Postgres** (optional):
   - In Vercel dashboard, go to Storage
   - Create Postgres database
   - Copy connection string to environment variables

### Docker Deployment

```bash
# Build Docker image
docker build -t healthtrack .

# Run with docker-compose
docker-compose up -d
```

---

## 🧪 Testing

After deployment, test these critical flows:

1. **Authentication**:
   - Sign up new user
   - Sign in
   - Password reset (if configured)

2. **Health Metrics**:
   - Add blood pressure reading
   - View metrics dashboard
   - Check trends

3. **File Upload**:
   - Upload medical file
   - View uploaded file
   - Delete file

4. **Database Persistence**:
   - Add data
   - Refresh browser
   - Verify data persists

5. **All New Features**:
   - Log a meal (Nutrition)
   - Track sleep
   - Add medication
   - Schedule appointment

---

## 📈 Next Steps

Once deployed:

1. **Customize**: Modify branding, colors, features
2. **Integrate Wearables**: Connect Fitbit, Apple Health, etc.
3. **Add Providers**: Integrate with EHR systems
4. **Scale**: Optimize for production traffic
5. **Compliance**: Ensure HIPAA compliance for production

---

## 📞 Support

- **Database Issues**: Check PostgreSQL logs
- **Migration Issues**: See Prisma documentation
- **Auth Issues**: Check NextAuth.js docs
- **General Issues**: Review error logs in terminal

---

## 🎉 Success!

Once you see the dashboard with all features enabled, you're ready to go!

All 40+ components will be functional, and you can test the complete health tracking system.
