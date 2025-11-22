# HealthTrack - Quick Start Guide

## Option 1: Deploy to Vercel (Recommended for Testing)

### Prerequisites
- GitHub account
- Vercel account (free tier works)

### Steps

1. **Push your code to GitHub** (already done ✓)

2. **Set up Database**

   Choose one:

   **Option A: Vercel Postgres**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Create a new Postgres database
   - Copy the DATABASE_URL connection string

   **Option B: Supabase** (Recommended - Free tier generous)
   - Go to [Supabase.com](https://supabase.com)
   - Create new project
   - Go to Settings → Database → Connection string
   - Copy the connection string (use "connection pooling" for production)

3. **Deploy to Vercel**

   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # From the healthtrack/healthtrack directory
   cd healthtrack/healthtrack
   vercel
   ```

   Or use the Vercel dashboard:
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your GitHub repository
   - Select the `healthtrack` directory as the root

4. **Configure Environment Variables in Vercel**

   In Vercel Dashboard → Settings → Environment Variables, add:

   ```
   DATABASE_URL=<your-database-connection-string>
   NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
   NEXTAUTH_URL=<your-vercel-app-url>
   ENCRYPTION_KEY=<32-random-characters>
   ```

5. **Run Database Migrations**

   After deployment, run migrations:
   ```bash
   # Install dependencies locally
   npm install

   # Set your DATABASE_URL in .env.local
   echo "DATABASE_URL=your-connection-string" > .env.local

   # Run migrations
   npx prisma migrate deploy

   # Or if no migrations exist yet, push the schema
   npx prisma db push
   ```

6. **Access Your App**
   - Your app will be live at: `https://your-app.vercel.app`
   - You can test all features reliably

---

## Option 2: Local Development

### Prerequisites
- Node.js 18+ installed
- PostgreSQL installed locally OR use cloud database

### Steps

1. **Clone and Navigate**
   ```bash
   git clone <your-repo>
   cd healthtrack/healthtrack
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set up Database**

   **Local PostgreSQL:**
   ```bash
   # Install PostgreSQL (varies by OS)
   # macOS: brew install postgresql
   # Ubuntu: sudo apt-get install postgresql
   # Windows: Download from postgresql.org

   # Create database
   createdb healthtrack
   ```

   **OR use Cloud Database** (easier):
   - Sign up for Supabase/Neon
   - Get connection string

4. **Configure Environment**
   ```bash
   # Copy example env file
   cp .env.example .env.local

   # Edit .env.local with your values
   nano .env.local
   ```

   Minimum required:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/healthtrack"
   NEXTAUTH_SECRET="run: openssl rand -base64 32"
   NEXTAUTH_URL="http://localhost:3000"
   ENCRYPTION_KEY="any-32-character-string-here!"
   ```

5. **Initialize Database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Push schema to database
   npx prisma db push

   # (Optional) Seed with sample data
   npm run db:seed
   ```

6. **Start Development Server**
   ```bash
   npm run dev
   ```

   Access at: http://localhost:3000

---

## Recommended: Vercel + Supabase

**Why?**
- ✅ No local setup needed
- ✅ Free tiers available
- ✅ Production-ready
- ✅ Easy to share with testers
- ✅ Automatic HTTPS
- ✅ Fast global CDN

**Time to deploy:** ~10 minutes

---

## Testing Checklist

Once deployed, test these features:

- [ ] User registration and login
- [ ] Dashboard loads
- [ ] Add health metrics (blood pressure, weight, glucose, etc.)
- [ ] Create medication entries
- [ ] Schedule appointments
- [ ] Upload medical files
- [ ] View reports and analytics
- [ ] Mobile responsive design
- [ ] Dark mode toggle

---

## Troubleshooting

**"Prisma Client not generated"**
```bash
npx prisma generate
```

**"Can't connect to database"**
- Check DATABASE_URL is correct
- Ensure database is running
- Check firewall/network settings

**"NextAuth error"**
- Ensure NEXTAUTH_SECRET is set
- Verify NEXTAUTH_URL matches your domain

**Build errors on Vercel**
- Check build logs
- Ensure all env variables are set
- Verify Node.js version (18+)

---

## Need Help?

Check the full documentation:
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development guidelines
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
