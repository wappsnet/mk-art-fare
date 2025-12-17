# AI Development Instructions

## Critical Rules

### ⛔ NEVER DO (Without Explicit Permission)

1. **Documentation & Comments**
   - DO NOT generate README files, documentation, or markdown files
   - DO NOT add code comments or JSDoc unless explicitly requested
   - DO NOT create TODO comments or implementation notes
   - DO NOT add "helpful" explanatory comments to code

2. **Over-Engineering**
   - DO NOT add features beyond what was requested
   - DO NOT create abstractions for single-use code
   - DO NOT add error handling for impossible scenarios
   - DO NOT add future-proofing or "what if" code
   - DO NOT refactor surrounding code when fixing bugs

3. **Unnecessary Changes**
   - DO NOT add type annotations to code you didn't modify
   - DO NOT clean up existing code unless asked
   - DO NOT add docstrings to existing functions
   - DO NOT reorganize imports unless necessary

### ✅ ALWAYS DO

1. **Code Quality**
   - Write clean, readable, self-documenting code
   - Use meaningful variable and function names
   - Follow existing code patterns in the project
   - Maintain TypeScript strict type safety

2. **File Organization**
   - Follow the project structure patterns
   - Place files in appropriate directories
   - Use index.tsx pattern for components and pages

3. **Confirmation**
   - Ask before creating new files or major refactoring
   - Clarify ambiguous requirements
   - Present options when multiple approaches exist

---

## Project Architecture

### Frontend Stack

**Core Technologies:**
- React 18.2 + TypeScript 5.3
- Vite 5.0 (build tool)
- Ant Design 5.12 (UI library)
- Redux Toolkit 2.0 + RTK Query (state management)
- React Router 7.10 (routing)
- Emotion (CSS-in-JS)

**Key Libraries:**
- `dayjs` - Date manipulation
- `axios` - HTTP client
- `@ant-design/icons` - Icons
- `react-redux` - Redux bindings

### Directory Structure

```
src/
├── components/       # Reusable UI components
├── pages/           # Page components
│   ├── public/      # Public-facing pages
│   ├── admin/       # Admin pages
│   ├── dashboard/   # Shop owner dashboard
│   └── account/     # User account pages
├── routes/          # Route configuration
├── services/        # API services (RTK Query)
├── store/           # Redux store
├── hooks/           # Custom React hooks
├── guards/          # Route guards
├── types/           # TypeScript types
├── config/          # Configuration files
├── utils/           # Utility functions
└── styles/          # Global styles
```

### Code Patterns

#### Component Structure

Every component/page follows this pattern:

```typescript
// ComponentName/index.tsx
import { useState } from 'react';
import { Button, Typography } from 'antd';
import { Container, Wrapper } from './styles';

const { Title, Text } = Typography;

export const ComponentName = () => {
  const [state, setState] = useState();

  return (
    <Container>
      <Title level={2}>Title</Title>
      <Text>Content</Text>
    </Container>
  );
};
```

```typescript
// ComponentName/styles.ts (only if needed)
import styled from '@emotion/styled';

export const Container = styled.div`
  /* Structural/layout styles only */
  max-width: 1200px;
  margin: 0 auto;
`;
```

#### Styling Guidelines

**Priority Order:**
1. Use AntD components with built-in props
2. Use inline styles for specific customizations
3. Use theme configuration for global changes
4. Use styled-components ONLY for layout/structure

**Examples:**

✅ **CORRECT:**
```typescript
// Use AntD component
<Button type="primary" size="large" icon={<Icon />}>
  Click Me
</Button>

// Inline styles for specific needs
<Text strong style={{ fontSize: 16, color: '#1890ff' }}>
  $99.99
</Text>

// Styled components for layout only
const Container = styled.div`
  display: flex;
  gap: 16px;
  padding: 20px;
`;
```

❌ **INCORRECT:**
```typescript
// Don't use custom HTML with AntD classes
<button className="ant-btn ant-btn-primary">Click</button>

// Don't override AntD component styles
const CustomButton = styled(Button)`
  background: red;
  &:hover { background: blue; }
`;

// Don't style AntD typography
const CustomText = styled(Text)`
  &.ant-typography {
    font-size: 16px;
    color: #1890ff;
  }
`;
```

#### State Management

**Local State (useState):**
```typescript
// For component-specific state
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: '' });
```

**RTK Query (API calls):**
```typescript
// For server data
const { data, isLoading, error } = useGetProductsQuery({ page: 1 });
const [createProduct] = useCreateProductMutation();
```

**Redux Store (Global state):**
```typescript
// Only for truly global state (auth, theme, etc.)
const { isAuthenticated, user } = useAppSelector((state) => state.auth);
```

#### API Services

All API calls use RTK Query in `services/apiSlice.ts`:

```typescript
// Query (GET)
getProducts: builder.query<ApiResponse<Product[]>, void>({
  query: () => '/products',
  providesTags: ['Product'],
}),

// Mutation (POST/PUT/DELETE)
createProduct: builder.mutation<ApiResponse<Product>, Partial<Product>>({
  query: (data) => ({
    url: '/products',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['Product'],
}),
```

#### Type Safety

Always define proper types:

```typescript
// Define interfaces
interface Product {
  id: number;
  name: string;
  price: number;
}

// Use in components
const ProductCard = ({ product }: { product: Product }) => {
  // ...
};

// Use with hooks
const [products, setProducts] = useState<Product[]>([]);
```

#### Error Handling

```typescript
// API error handling
try {
  await createProduct(data).unwrap();
  message.success('Product created');
} catch (error) {
  message.error(getErrorMessage(error) || 'Failed to create product');
}
```

### Routing Patterns

**Route Definition:**
```typescript
// routes/publicRoutes.tsx
export const publicRoutes: AppRouteObject[] = [
  {
    path: '/products',
    element: <ProductsPage />,
    meta: { title: 'Products - Art Fare' },
  },
];
```

**With Guards:**
```typescript
{
  path: '/admin',
  element: (
    <RequireRole allowedRoles={[UserRole.ADMIN]}>
      <AdminPage />
    </RequireRole>
  ),
  meta: {
    requiresAuth: true,
    allowedRoles: [UserRole.ADMIN],
    title: 'Admin - Art Fare',
  },
}
```

### Import Patterns

Use path aliases:

```typescript
// ✅ CORRECT
import { Layout } from '@/components/Layout';
import { useGetProductsQuery } from '@/services/apiSlice';
import { Product } from '@/types/common';

// ❌ INCORRECT
import { Layout } from '../../../components/Layout';
```

### Naming Conventions

```typescript
// Components: PascalCase
export const ProductCard = () => {};

// Functions/variables: camelCase
const calculateTotal = () => {};
const userProfile = {};

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = '';
const MAX_ITEMS = 10;

// Types/Interfaces: PascalCase
interface UserProfile {}
type ProductStatus = 'active' | 'inactive';

// Files:
// - Components: PascalCase (ProductCard/index.tsx)
// - Utilities: camelCase (formatPrice.ts)
// - Types: camelCase (common.ts)
```

---

## Common Tasks

### Adding a New Page

1. Create folder: `src/pages/{category}/{PageName}/`
2. Create `index.tsx` with component
3. Create `styles.ts` if needed (layout only)
4. Add route to appropriate route file
5. Export from page for route usage

```typescript
// 1. Create index.tsx
export const ProductsPage = () => {
  return <div>Products</div>;
};

// 2. Add to routes
import { ProductsPage } from '@/pages/public/ProductsPage';

export const publicRoutes: AppRouteObject[] = [
  {
    path: '/products',
    element: <ProductsPage />,
    meta: { title: 'Products' },
  },
];
```

### Adding a New Component

1. Create folder: `src/components/{ComponentName}/`
2. Create `index.tsx` with component
3. Create `styles.ts` if needed
4. Export from component

```typescript
// components/ProductCard/index.tsx
export const ProductCard = ({ product }: ProductCardProps) => {
  return <Card>{product.name}</Card>;
};
```

### Adding an API Endpoint

Add to `services/apiSlice.ts`:

```typescript
// In endpoints builder
getProducts: builder.query<ApiResponse<Product[]>, QueryParams>({
  query: (params) => ({
    url: '/products',
    params,
  }),
  providesTags: ['Product'],
}),
```

### Adding a Type

Add to `types/common.ts`:

```typescript
export interface Product {
  id: number;
  name: string;
  price: number;
  // ... other fields
}
```

---

## Performance Guidelines

1. **Lazy Loading**: Use for routes
```typescript
const ProductsPage = lazy(() => import('@/pages/public/ProductsPage'));
```

2. **Memoization**: Only when proven necessary
```typescript
const expensiveValue = useMemo(() => calculate(data), [data]);
const handleClick = useCallback(() => action(), [dep]);
```

3. **List Rendering**: Always use keys
```typescript
{products.map(product => (
  <ProductCard key={product.id} product={product} />
))}
```

---

## Security Guidelines

1. **Input Validation**: Always validate user input
2. **XSS Prevention**: Sanitize HTML content
3. **Auth Tokens**: Store in memory or httpOnly cookies
4. **Role Checks**: Use route guards
5. **Sensitive Data**: Never log or expose

---

## Testing Guidelines

1. **Write tests for**:
   - Utility functions
   - Complex business logic
   - Critical user flows

2. **Don't test**:
   - Third-party libraries
   - Simple mappings
   - Styling

---

## Git Workflow

1. **Commit Messages**: Clear and concise
   ```
   feat: Add product search functionality
   fix: Resolve cart total calculation
   refactor: Simplify auth flow
   ```

2. **Branch Naming**:
   ```
   feature/product-search
   fix/cart-calculation
   refactor/auth-flow
   ```

---

## When Working with AI

### Before Starting

1. Understand the full requirement
2. Ask clarifying questions if needed
3. Identify impacted files
4. Check existing patterns

### During Development

1. Follow existing code patterns
2. Make minimal necessary changes
3. Test changes thoroughly
4. Keep changes focused

### After Completion

1. Verify all changes work
2. Check for unintended side effects
3. Ensure type safety
4. Remove debug code

---

## Remember

- **Simplicity over cleverness**
- **Explicit over implicit**
- **Types over any**
- **Ask before assuming**
- **No documentation without permission**
- **Code should explain itself**
- **Follow existing patterns**
- **Make minimal changes**

---

## Questions to Ask

- "Should I create documentation for this?"
- "Do you want comments explaining this logic?"
- "Should I refactor the surrounding code?"
- "Would you like error handling for this edge case?"
- "Should I add type annotations to existing code?"

**Default answer to all: NO, unless explicitly requested.**
