# AI Instructions for mk-art-fare Frontend

## Component Structure Pattern

### Addons Folder Structure

When creating complex components with subcomponents, follow the **Addons pattern**:

```
ComponentName/
├── Addons/
│   ├── components/
│   │   ├── SubComponent1/
│   │   │   ├── index.tsx (default export)
│   │   │   └── styles.ts (if needed)
│   │   └── SubComponent2/
│   │       ├── Addons/              # Nested Addons for sub-subcomponents
│   │       │   └── components/
│   │       │       └── NestedComponent/
│   │       │           ├── index.tsx (default export)
│   │       │           └── styles.ts (if needed)
│   │       ├── index.tsx (default export)
│   │       └── styles.ts (if needed)
│   └── types/
│       └── index.ts (shared types/interfaces)
├── index.tsx (main component, default export)
└── styles.ts (main component styles)
```

### Key Principles

1. **Addons at Every Level**: Use the `Addons/` pattern consistently at every component level
2. **Default Exports**: All components must use default exports, not named exports
3. **Component-Specific Styles**: Each component should have its own `styles.ts` file if it needs custom styling
4. **Shared Types**: Place shared types/interfaces in `Addons/types/index.ts`
5. **Nested Components**: If a subcomponent is only used by its parent, nest it using the same Addons pattern

### Examples

#### Example 1: ShopCustomFieldsPage

```
ShopCustomFieldsPage/
├── Addons/
│   ├── components/
│   │   ├── FieldGroupCard/
│   │   │   ├── Addons/
│   │   │   │   └── components/
│   │   │   │       └── FieldDefinitionList/
│   │   │   │           ├── index.tsx
│   │   │   │           └── styles.ts
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── FieldGroupForm/
│   │   │   └── index.tsx
│   │   └── FieldDefinitionForm/
│   │       └── index.tsx
│   └── types/
│       └── index.ts
├── index.tsx
└── styles.ts
```

#### Example 2: DynamicFieldRenderer

```
DynamicFieldRenderer/
├── Addons/
│   ├── components/
│   │   ├── TextField/
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   ├── NumberField/
│   │   │   ├── index.tsx
│   │   │   └── styles.ts
│   │   └── ...other field types
│   └── types/
│       └── index.ts
├── index.tsx
└── styles.ts
```

### Import Examples

```typescript
// Main component imports subcomponent
import FieldGroupCard from './Addons/components/FieldGroupCard';
import { FieldFormValues } from './Addons/types';

// Nested component imports its child
import FieldDefinitionList from './Addons/components/FieldDefinitionList';

// Component exports
export default ComponentName; // Always use default export
```

## Styling Guidelines

- **Avoid over-customizing Ant Design components** - Use Ant Design's built-in props and design system when possible
- Keep styled components minimal and only for essential customization
- Prefer className-based styling over emotion/styled-components when appropriate

## Code Quality

- **No type casting or `any` types** - Use proper TypeScript discriminated unions
- **Use `useMemo`** instead of self-calling functions for conditional rendering
- **Proper JSON handling** - Database JSON columns eliminate need for manual stringify/parse
- **Clean code** - No defensive type checking when proper types are defined
