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
- Redux Toolkit for state management

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

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Development

```bash
# Run backend
cd backend
npm run dev

# Run frontend (in another terminal)
cd frontend
npm run dev
```

## Environment Variables

See `.env.example` files in backend and frontend directories.

## License

MIT
