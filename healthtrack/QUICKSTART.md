# HealthTrack AI - Quick Start Guide

## 🚀 Three Ways to Deploy

### Option 1: Automated Script (Easiest)

```bash
cd /home/user/claude-playground/healthtrack
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This will:
- Check PostgreSQL installation
- Create .env file
- Generate secure secrets
- Set up database
- Install dependencies
- Run migrations
- Seed demo data
- Start the app

### Option 2: Docker (Recommended for Production)

```bash
# Start everything with Docker
docker-compose up -d

# View logs
docker-compose logs -f app

# Access:
# - App: http://localhost:3000
# - Database: localhost:5432

# With Prisma Studio for database GUI:
docker-compose --profile dev up -d
# Studio: http://localhost:5555
```

### Option 3: Manual Setup (Full Control)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Generate secret
openssl rand -base64 32
# Add to .env as NEXTAUTH_SECRET

# 3. Create database (PostgreSQL)
psql -U postgres
CREATE DATABASE healthtrack;
CREATE USER healthtrack_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE healthtrack TO healthtrack_user;
\q

# 4. Install and setup
npm install
npm run db:generate
npm run db:push
npm run db:seed

# 5. Start development server
npm run dev
```

---

## 📧 Demo Login

After seeding:
- **Email**: demo@healthtrack.com
- **Password**: Demo123!@#

---

## 🔧 Useful Commands

```bash
# Database
npm run db:studio      # Open Prisma Studio GUI
npm run db:push        # Sync schema to database
npm run db:migrate     # Create migration
npm run db:seed        # Populate with demo data
npm run db:reset       # Reset database (WARNING: deletes all data)

# Development
npm run dev            # Start dev server (localhost:3000)
npm run build          # Build for production
npm run start          # Start production server

# Type checking
npm run type-check     # Check TypeScript errors
npm run lint           # Run ESLint
```

---

## 🌐 Cloud Deployment

### Vercel (Fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - DATABASE_URL (from Vercel Postgres or external)
# - NEXTAUTH_URL (your-app.vercel.app)
# - NEXTAUTH_SECRET (generate new one)
```

### Railway

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select repository
4. Add PostgreSQL service
5. Set environment variables
6. Deploy!

### AWS/DigitalOcean

```bash
# Build Docker image
docker build -t healthtrack .

# Push to registry
docker tag healthtrack your-registry/healthtrack
docker push your-registry/healthtrack

# Deploy on server
docker pull your-registry/healthtrack
docker run -d -p 3000:3000 --env-file .env healthtrack
```

---

## 🐛 Troubleshooting

**Port 3000 already in use:**
```bash
lsof -ti:3000 | xargs kill -9
# or use different port
PORT=3001 npm run dev
```

**Database connection failed:**
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql "postgresql://healthtrack_user:password@localhost:5432/healthtrack"
```

**Prisma errors:**
```bash
# Regenerate client
npm run db:generate

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Type errors:**
```bash
# Save errors to file
npm run type-check:save

# Watch for errors
npm run type-check:watch
```

---

## 📚 Next Steps

After deployment:

1. **Customize Branding**: Update colors, logo, name
2. **Configure OAuth**: Add Google/GitHub login
3. **Enable AI Features**: Add Anthropic API key
4. **Set up Email**: Configure SMTP for notifications
5. **Add Analytics**: Integrate Google Analytics
6. **SSL Certificate**: Set up HTTPS for production
7. **Backups**: Configure automated database backups
8. **Monitoring**: Add error tracking (Sentry)

See `DEPLOYMENT_GUIDE.md` for detailed instructions!

---

## 🎉 You're Ready!

Visit **http://localhost:3000** and start tracking your health!
