# Art Fare - Frontend

Modern React + TypeScript frontend for the Art Fare marketplace platform.

## Tech Stack

- **Framework**: React 18.2 with TypeScript 5.3
- **Build Tool**: Vite 5.0
- **UI Library**: Ant Design 5.12
- **Styling**: Emotion (CSS-in-JS) + SASS
- **State Management**: Redux Toolkit 2.0 + RTK Query
- **Routing**: React Router 7.10
- **HTTP Client**: Axios 1.6
- **Date Handling**: Day.js 1.11

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Header/
│   │   ├── Footer/
│   │   └── Layout/
│   ├── pages/            # Page components
│   │   ├── public/       # Public pages (home, products, blog, etc.)
│   │   ├── admin/        # Admin pages
│   │   ├── dashboard/    # Shop owner dashboard
│   │   └── account/      # User account pages
│   ├── routes/           # Route configuration
│   ├── services/         # API services (RTK Query)
│   ├── store/            # Redux store configuration
│   ├── hooks/            # Custom React hooks
│   ├── guards/           # Route guards (auth, roles)
│   ├── types/            # TypeScript type definitions
│   ├── config/           # App configuration (theme, etc.)
│   ├── utils/            # Utility functions
│   └── styles/           # Global styles
├── public/               # Static assets
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Commands

```bash
# Run ESLint
npm run lint

# Fix ESLint errors
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting
npm run format:check
```

## Code Organization

### Pages Pattern

Each page follows a consistent structure:

```
PageName/
├── index.tsx       # Component logic
└── styles.ts       # Styled components (if needed)
```

Example:
```typescript
// pages/public/HomePage/index.tsx
export const HomePage = () => {
  // Component logic
};

// pages/public/HomePage/styles.ts
export const Container = styled.div`
  /* Structural styles only */
`;
```

### Components Pattern

Components follow the same structure as pages:

```
ComponentName/
├── index.tsx       # Component logic
└── styles.ts       # Styled components (if needed)
```

### Styling Guidelines

1. **Use AntD Components**: Always prefer AntD components over custom HTML
2. **Theme Configuration**: Global styles in `src/config/theme.ts`
3. **Inline Styles**: For component-specific customizations
4. **Styled Components**: Only for layout/structure, not style overrides

**DO:**
```typescript
<Button type="primary" icon={<Icon />}>Click</Button>
<Text strong style={{ fontSize: 16, color: '#1890ff' }}>Price</Text>
```

**DON'T:**
```typescript
<button className="ant-btn ant-btn-primary">Click</button>
export const CustomText = styled(Text)`
  &.ant-typography { color: red; }
`;
```

## State Management

### Redux Store Structure

```typescript
store/
├── index.ts           # Store configuration
└── slices/
    └── authSlice.ts   # Authentication state
```

### API Services (RTK Query)

```typescript
services/
├── apiSlice.ts        # Main API configuration with RTK Query
└── api.ts            # Axios instance
```

## Routing

### Route Structure

```typescript
routes/
├── index.tsx          # Main router
├── publicRoutes.tsx   # Public pages
├── adminRoutes.tsx    # Admin pages
├── dashboardRoutes.tsx # Shop dashboard
└── accountRoutes.tsx  # User account
```

### Guards

```typescript
guards/
├── RequireAuth.tsx    # Requires authentication
├── RequireGuest.tsx   # Guests only
└── RequireRole.tsx    # Role-based access
```

## Type Safety

All types are defined in `src/types/`:

- `common.ts` - Shared types (User, Product, Order, etc.)
- `routes.ts` - Route metadata types
- `errors.ts` - Error handling types

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:5001/api
```

## Best Practices

1. **Component Organization**: One component per folder with index.tsx
2. **Type Safety**: Always use TypeScript types, avoid `any`
3. **Imports**: Use path aliases (`@/` for src)
4. **Naming**: PascalCase for components, camelCase for utilities
5. **State**: Prefer local state, use Redux only for global state
6. **Styling**: Follow AntD design system, avoid custom overrides
7. **Code Splitting**: Use lazy loading for routes
8. **Error Handling**: Use try/catch with proper error messages

## Performance

- Route-based code splitting with React.lazy()
- Memoization with useMemo/useCallback where needed
- Image optimization (lazy loading, responsive images)
- Bundle size monitoring with Vite build analyzer

## Testing

```bash
# Run tests (to be configured)
npm test
```

## Deployment

```bash
# Build for production
npm run build

# Output in dist/ directory
```

## Contributing

See `AI_INSTRUCTIONS.md` for development guidelines and AI assistance rules.

## License

Private - Art Fare Platform
