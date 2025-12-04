# Art Fare - E-Commerce Platform for Artists

A comprehensive e-commerce platform connecting artists with art lovers, featuring custom shop pages, event management, and community blog.

## Project Structure

```
mk-art-fare/
├── backend/          # Node.js/Express backend API
├── frontend/         # React + Vite frontend application
└── database/         # Database migrations and seeds
```

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- MySQL database
- JWT authentication (access/refresh tokens)
- Google OAuth SSO

### Frontend
- React 18 with Vite
- TypeScript
- Ant Design component library
- Emotion (styled components & CSS-in-JS)
- SCSS for global styles
- Redux Toolkit with RTK Query for state management
- Automatic caching and data synchronization

## Features

### For Artists
- Custom shop pages with branding and colors
- Product management
- Order and sales tracking
- Profile and account settings
- Organization management

### For Customers
- Browse artist shops
- Multi-shop cart and checkout
- Order tracking
- Event browsing and ticket booking
- Community blog participation

### For Admins
- User management
- Shop management
- Order management
- Event management
- Platform analytics

### Community Features
- Blog posts about art
- Topic discussions and conversations
- Event calendar with filtering (location, type, date)
- Online ticket booking

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MySQL** 8+ ([Download](https://dev.mysql.com/downloads/mysql/))
- **npm** (comes with Node.js) or **yarn** ([Install yarn](https://yarnpkg.com/getting-started/install))

> **📦 Package Manager Choice:** This guide shows both npm and yarn commands. Choose one and use it consistently throughout the project.

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd mk-art-fare
```

### Step 2: Database Setup

1. **Create the database:**

```bash
mysql -u root -p
```

```sql
CREATE DATABASE art_fare CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

2. **Import the database schema:**

```bash
mysql -u root -p art_fare < database/schema.sql
```

3. **(Optional) Import seed data:**

```bash
mysql -u root -p art_fare < database/seed.sql
```

### Step 3: Backend Setup

1. **Navigate to backend directory:**

```bash
cd backend
```

2. **Install dependencies:**

```bash
# Using npm
npm install

# OR using yarn
yarn
```

3. **Create environment file:**

```bash
cp .env.example .env
```

4. **Configure your `.env` file:**

Open `backend/.env` and update the following (minimum required):

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=art_fare

# JWT Secrets (generate random strings for production)
JWT_ACCESS_SECRET=your-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-change-this

# Server Config
PORT=5000
FRONTEND_URL=http://localhost:5173
```

5. **Start the backend server:**

```bash
# Using npm
npm run dev

# OR using yarn
yarn dev
```

The backend will start at `http://localhost:5000`

### Step 4: Frontend Setup

1. **Open a new terminal and navigate to frontend directory:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
# Using npm
npm install

# OR using yarn
yarn
```

3. **Create environment file:**

```bash
cp .env.example .env
```

4. **Configure your `.env` file:**

Open `frontend/.env` and update:

```env
VITE_API_URL=http://localhost:5000/api
```

5. **Start the frontend development server:**

```bash
# Using npm
npm run dev

# OR using yarn
yarn dev
```

The frontend will start at `http://localhost:5173`

### Step 5: Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

## 👤 Default Test Accounts

If you imported the seed data, you can use these accounts:

**Admin Account:**
- Email: `admin@artfare.com`
- Password: `Admin@123`

**Artist Account:**
- Email: `artist@artfare.com`
- Password: `Artist@123`

**Customer Account:**
- Email: `customer@artfare.com`
- Password: `Customer@123`

## 📝 Available Scripts

### Backend

```bash
# Using npm
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm start            # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Using yarn
yarn dev            # Start development server with hot reload
yarn build          # Build TypeScript to JavaScript
yarn start          # Start production server
yarn lint           # Run ESLint
yarn format         # Format code with Prettier
```

### Frontend

```bash
# Using npm
npm run dev          # Start Vite development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier

# Using yarn
yarn dev            # Start Vite development server
yarn build          # Build for production
yarn preview        # Preview production build
yarn lint           # Run ESLint
yarn format         # Format code with Prettier
```

## 🔧 Configuration

### Backend Environment Variables

See `backend/.env.example` for all available options:

- **Database**: MySQL connection settings
- **JWT**: Token secrets and expiry times
- **Google OAuth**: Client ID and secret for SSO
- **Email**: SMTP settings for password reset
- **File Upload**: Upload directory and size limits

### Frontend Environment Variables

See `frontend/.env.example`:

- **VITE_API_URL**: Backend API endpoint
- **VITE_GOOGLE_CLIENT_ID**: Google OAuth client ID (optional)

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;
```

### Port Already in Use

If port 5000 or 5173 is already in use:

**Backend:** Change `PORT` in `backend/.env`

**Frontend:** Vite will automatically try the next available port

### Module Not Found

```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues

Ensure `FRONTEND_URL` in `backend/.env` matches your frontend URL:

```env
FRONTEND_URL=http://localhost:5173
```

## 📚 API Documentation

Once the backend is running, API endpoints are available at:

```
http://localhost:5000/api
```

### Main Endpoints

- **Auth**: `/api/auth` - Login, register, logout, profile
- **Products**: `/api/products` - Product CRUD operations
- **Cart**: `/api/cart` - Shopping cart management
- **Orders**: `/api/orders` - Order placement and tracking
- **Blog**: `/api/blog` - Blog posts and comments
- **Events**: `/api/events` - Events and ticket booking
- **Organizations**: `/api/organizations` - Shop management
- **Users**: `/api/users` - User profile and addresses

## 🏗️ Project Structure

```
mk-art-fare/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, passport configs
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── types/           # TypeScript types
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components (14 pages)
│   │   ├── services/        # RTK Query API
│   │   ├── store/           # Redux store
│   │   ├── styles/          # Global SCSS styles
│   │   └── types/           # TypeScript types
│   ├── .env.example
│   └── package.json
└── database/
    ├── schema.sql           # Database schema
    └── seed.sql             # Sample data
```

## License

MIT
