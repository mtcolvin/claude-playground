#!/bin/bash

# HealthTrack AI - Automated Setup Script
# This script helps you set up the full version quickly

set -e  # Exit on error

echo "🏥 HealthTrack AI - Full Deployment Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo -e "${BLUE}📦 Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL not found. Please install PostgreSQL first.${NC}"
    echo "   macOS: brew install postgresql@14"
    echo "   Ubuntu: sudo apt-get install postgresql"
    exit 1
fi

if ! pg_isready &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not running. Starting...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew services start postgresql@14 || true
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo service postgresql start || true
    fi
    sleep 2
fi

echo -e "${GREEN}✅ PostgreSQL is ready${NC}"
echo ""

# Check for .env file
echo -e "${BLUE}🔧 Checking environment configuration...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file from template...${NC}"
    cp .env.example .env

    # Generate NEXTAUTH_SECRET
    if command -v openssl &> /dev/null; then
        SECRET=$(openssl rand -base64 32)
        # Replace the placeholder in .env
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|NEXTAUTH_SECRET=\".*\"|NEXTAUTH_SECRET=\"$SECRET\"|" .env
        else
            sed -i "s|NEXTAUTH_SECRET=\".*\"|NEXTAUTH_SECRET=\"$SECRET\"|" .env
        fi
        echo -e "${GREEN}✅ Generated secure NEXTAUTH_SECRET${NC}"
    fi

    echo -e "${YELLOW}⚠️  Please edit .env file with your database credentials${NC}"
    echo "   Default: postgresql://healthtrack_user:password@localhost:5432/healthtrack"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi
echo ""

# Database setup
echo -e "${BLUE}🗄️  Setting up database...${NC}"
read -p "Do you want to create the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Creating database and user...${NC}"

    # Extract database name from DATABASE_URL in .env
    DB_NAME="healthtrack"
    DB_USER="healthtrack_user"

    read -sp "Enter PostgreSQL admin password (for user 'postgres'): " PG_PASSWORD
    echo ""

    PGPASSWORD=$PG_PASSWORD psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "Database may already exist"
    PGPASSWORD=$PG_PASSWORD psql -U postgres -c "CREATE USER $DB_USER WITH PASSWORD 'your_secure_password';" 2>/dev/null || echo "User may already exist"
    PGPASSWORD=$PG_PASSWORD psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null

    echo -e "${GREEN}✅ Database setup complete${NC}"
fi
echo ""

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Generate Prisma client
echo -e "${BLUE}🔨 Generating Prisma client...${NC}"
npm run db:generate
echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

# Run migrations
echo -e "${BLUE}🚀 Running database migrations...${NC}"
npm run db:push
echo -e "${GREEN}✅ Database schema created${NC}"
echo ""

# Seed database
read -p "Do you want to populate with demo data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🌱 Seeding database with demo data...${NC}"
    npm run db:seed
    echo -e "${GREEN}✅ Demo data created${NC}"
    echo ""
    echo -e "${GREEN}📧 Demo Login Credentials:${NC}"
    echo "   Email: demo@healthtrack.com"
    echo "   Password: Demo123!@#"
fi
echo ""

# Success message
echo -e "${GREEN}=========================================="
echo "✅ Setup Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "   1. Review .env file and update if needed"
echo "   2. Start development server: npm run dev"
echo "   3. Visit: http://localhost:3000"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo "   Full guide: ./DEPLOYMENT_GUIDE.md"
echo "   Prisma Studio: npm run db:studio"
echo ""
echo -e "${GREEN}Happy tracking! 🏥${NC}"
