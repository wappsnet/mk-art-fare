# Docker Setup Guide

This guide will help you set up the Art Fare application using Docker for the MySQL database.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed

## Quick Start

### 1. Start MySQL with Docker

```bash
# Start MySQL container
docker-compose up -d

# Check if MySQL is running
docker-compose ps

# View logs
docker-compose logs -f mysql
```

The MySQL container will automatically:
- Create the `art_fare` database
- Import the schema from `database/schema.sql`
- Import seed data from `database/seed.sql`

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
yarn dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn dev
```

### 4. Access the Application

Open your browser to: http://localhost:5173

## Database Credentials

The Docker setup uses these credentials (configured in `docker-compose.yml`):

- **Host:** localhost
- **Port:** 3306
- **Root Password:** root
- **Database:** art_fare
- **User:** artfare_user
- **Password:** artfare_password

These are already configured in `backend/.env`.

## Useful Docker Commands

```bash
# Stop MySQL
docker-compose stop

# Start MySQL
docker-compose start

# Restart MySQL
docker-compose restart

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (deletes all data)
docker-compose down -v

# Access MySQL CLI
docker exec -it art-fare-mysql mysql -u root -proot art_fare

# View MySQL logs
docker-compose logs -f mysql

# Check container status
docker-compose ps
```

## Test Accounts

If you imported the seed data, you can use these test accounts:

- **Admin:** admin@artfare.com / Admin@123
- **Artist:** artist@artfare.com / Artist@123
- **Customer:** customer@artfare.com / Customer@123

## Troubleshooting

### Port 3306 already in use

If you have MySQL already running locally, either:
1. Stop the local MySQL service
2. Change the port in `docker-compose.yml` (e.g., `"3307:3306"`) and update `backend/.env` accordingly

### Database not initialized

If the database isn't initialized properly:

```bash
# Stop and remove everything
docker-compose down -v

# Start fresh
docker-compose up -d

# Wait for initialization (check logs)
docker-compose logs -f mysql
```

### Connect to MySQL manually

```bash
# Using Docker exec
docker exec -it art-fare-mysql mysql -u root -proot art_fare

# Or from your host (if mysql client is installed)
mysql -h 127.0.0.1 -P 3306 -u root -proot art_fare
```

## Production Notes

For production deployment:
1. Change the MySQL root password in `docker-compose.yml`
2. Use environment variables instead of hardcoded credentials
3. Update JWT secrets in `backend/.env`
4. Consider using Docker secrets or a secrets manager
