# Art Fare Backend API

Backend REST API for the Art Fare e-commerce platform.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MySQL with mysql2
- **Authentication**: JWT (access/refresh tokens) + Google OAuth
- **Validation**: express-validator
- **Security**: helmet, cors, rate-limiting
- **Email**: nodemailer

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── database/        # Database utilities and migrations
├── middleware/      # Express middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── app.ts           # Express app setup
└── server.ts        # Server entry point
```

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Database Setup

```bash
# Run migrations
npm run migrate

# Seed database (optional)
npm run seed
```

### Development

```bash
# Start development server with hot reload
npm run dev
```

### Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Main Endpoints

- `/api/auth` - Authentication (login, register, refresh, OAuth)
- `/api/users` - User management
- `/api/organizations` - Shop/organization management
- `/api/products` - Product management
- `/api/cart` - Shopping cart
- `/api/orders` - Order management
- `/api/blog` - Blog posts and comments
- `/api/events` - Events and bookings
- `/api/admin` - Admin operations

## Environment Variables

See `.env.example` for required configuration.

## Security Features

- JWT access and refresh tokens
- Password hashing with bcrypt
- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation and sanitization

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build TypeScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database
- `npm run lint` - Run ESLint
- `npm test` - Run tests
