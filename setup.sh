#!/bin/bash

# Art Fare Quick Setup Script
# This script automates the installation and setup process

set -e

echo "🎨 Art Fare - Quick Setup"
echo "========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check MySQL
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL is not installed. Please install MySQL 8+ first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ MySQL installed${NC}"
echo ""

# Database setup
echo -e "${YELLOW}Setting up database...${NC}"
read -p "Enter MySQL root password: " -s MYSQL_PASSWORD
echo ""

# Create database
mysql -u root -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS art_fare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database 'art_fare' created${NC}"
else
    echo -e "${RED}❌ Failed to create database. Please check your MySQL password.${NC}"
    exit 1
fi

# Import schema
if [ -f "database/schema.sql" ]; then
    mysql -u root -p"$MYSQL_PASSWORD" art_fare < database/schema.sql 2>/dev/null
    echo -e "${GREEN}✓ Database schema imported${NC}"
fi

# Import seed data (optional)
if [ -f "database/seed.sql" ]; then
    read -p "Import sample data? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        mysql -u root -p"$MYSQL_PASSWORD" art_fare < database/seed.sql 2>/dev/null
        echo -e "${GREEN}✓ Sample data imported${NC}"
    fi
fi
echo ""

# Backend setup
echo -e "${YELLOW}Setting up backend...${NC}"
cd backend

# Install dependencies
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Create .env file
if [ ! -f ".env" ]; then
    cp .env.example .env

    # Update database password in .env
    sed -i.bak "s/DB_PASSWORD=.*/DB_PASSWORD=$MYSQL_PASSWORD/" .env
    rm .env.bak 2>/dev/null || true

    echo -e "${GREEN}✓ Backend .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please update JWT secrets in backend/.env for production!${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists, skipping...${NC}"
fi

cd ..
echo ""

# Frontend setup
echo -e "${YELLOW}Setting up frontend...${NC}"
cd frontend

# Install dependencies
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Create .env file
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Frontend .env file created${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env already exists, skipping...${NC}"
fi

cd ..
echo ""

# Success message
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "To start the application:"
echo ""
echo "1. Start the backend (in one terminal):"
echo "   cd backend && yarn dev"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   cd frontend && yarn dev"
echo ""
echo "3. Open your browser to:"
echo "   http://localhost:5173"
echo ""

if [ -f "database/seed.sql" ]; then
    echo "Test accounts (if you imported seed data):"
    echo "  Admin:    admin@artfare.com / Admin@123"
    echo "  Artist:   artist@artfare.com / Artist@123"
    echo "  Customer: customer@artfare.com / Customer@123"
    echo ""
fi

echo "Happy coding! 🚀"
