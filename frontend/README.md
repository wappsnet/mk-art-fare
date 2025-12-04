# Art Fare Frontend

React-based frontend application for the Art Fare e-commerce platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Redux Toolkit** - State management
- **Ant Design** - UI component library
- **Emotion** - CSS-in-JS styling
- **SCSS** - Global styles and variables
- **Axios** - HTTP client

## Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/           # Page components
├── store/           # Redux store and slices
├── services/        # API service layer
├── types/           # TypeScript type definitions
├── styles/          # Global SCSS styles
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── App.tsx          # Root component
└── main.tsx         # Application entry point
```

## Features

### Implemented

- Project structure and configuration
- TypeScript setup with strict mode
- Vite configuration with path aliases
- Redux Toolkit store with auth and cart slices
- API service layer with auto token refresh
- Global SCSS styles and variables
- Ant Design theme configuration
- Emotion CSS-in-JS setup
- React Router setup

### To Be Implemented

- Authentication pages (Login, Register, Forgot Password)
- Product browsing and filtering
- Product detail pages
- Shopping cart interface
- Checkout flow
- Artist dashboard
- Shop management interface
- Blog pages and editor
- Events browsing and booking
- Admin dashboard
- User profile management

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Development

```bash
# Start development server
yarn dev

# Server will run on http://localhost:3000
```

### Build

```bash
# Build for production
yarn build

# Preview production build
yarn preview
```

## Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_URL=http://localhost:5000/api
VITE_API_HOST=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Available Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint

## State Management

The application uses Redux Toolkit for state management:

- **authSlice** - User authentication and profile
- **cartSlice** - Shopping cart management

## API Integration

API calls are handled through a centralized service layer (`src/services/api.ts`) that includes:

- Automatic JWT token management
- Token refresh on expiry
- Error handling
- Request/response interceptors

## Styling

The application uses a hybrid approach:

- **SCSS** for global styles and CSS variables
- **Emotion** for component-level CSS-in-JS
- **Ant Design** for pre-built UI components

## Contributing

1. Create feature branches from main
2. Follow the existing code structure
3. Use TypeScript types for all components
4. Follow the established styling patterns
5. Test your changes before committing
