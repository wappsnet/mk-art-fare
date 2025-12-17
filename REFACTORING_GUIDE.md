# AntD Components Refactoring Guide

## Overview
This guide explains how to properly use AntD components and theme configuration instead of custom implementations.

## What Was Changed

### 1. Theme Configuration
Created a centralized theme config at `frontend/src/config/theme.ts`:
- Defines global design tokens (colors, typography, spacing)
- Configures component-specific overrides
- Ensures consistent styling across the application

### 2. CartPage Refactoring
**Before:**
```tsx
// Custom HTML button with AntD classes ❌
<button type="button" className="ant-btn ant-btn-primary">
  <ShoppingOutlined /> Start Shopping
</button>

// Custom styled component ❌
export const Price = styled(Text)`
  &.ant-typography {
    font-size: 16px;
    color: #1890ff;
  }
`;
```

**After:**
```tsx
// Proper AntD Button component ✅
<Button type="primary" icon={<ShoppingOutlined />}>
  Start Shopping
</Button>

// Direct AntD component with inline styles ✅
export const Price = Text;

// Usage with inline styles
<Price strong style={{ fontSize: 16, color: '#1890ff' }}>
  ${price}
</Price>
```

## Best Practices

### 1. Always Use AntD Components
✅ **DO:**
```tsx
import { Button } from 'antd';

<Button type="primary" icon={<Icon />} onClick={handler}>
  Click Me
</Button>
```

❌ **DON'T:**
```tsx
<button className="ant-btn ant-btn-primary" onClick={handler}>
  <Icon /> Click Me
</button>
```

### 2. Use Theme Configuration for Global Styles
✅ **DO:** Add to `frontend/src/config/theme.ts`
```tsx
export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    fontSize: 14,
    borderRadius: 4,
  },
  components: {
    Button: {
      controlHeight: 32,
    },
  },
};
```

❌ **DON'T:** Create custom styled components for every style override
```tsx
export const CustomButton = styled(Button)`
  height: 32px;
`;
```

### 3. Use Inline Styles for Component-Specific Customizations
✅ **DO:**
```tsx
<Text strong style={{ fontSize: 16, color: '#1890ff' }}>
  Price
</Text>
```

❌ **DON'T:**
```tsx
export const PriceText = styled(Text)`
  &.ant-typography {
    font-size: 16px;
    color: #1890ff;
  }
`;
```

### 4. Keep Styled Components for Layout/Structure Only
✅ **DO:** Use styled-components for layout, positioning, and structure
```tsx
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const RightAlignCol = styled.div`
  text-align: right;
`;
```

❌ **DON'T:** Use styled-components to override AntD component styles
```tsx
export const CustomTitle = styled(Title)`
  &.ant-typography {
    color: #1890ff;
    font-size: 20px;
  }
`;
```

## Files That Still Need Refactoring

The following files contain custom styled components that should be refactored:
- `frontend/src/pages/public/EventDetailPage/styles.ts`
- `frontend/src/pages/public/ProductsPage/styles.ts`
- `frontend/src/pages/public/HomePage/styles.ts`
- `frontend/src/pages/public/EventsPage/styles.ts`
- And 13 other style files (see grep results)

## How to Refactor Other Pages

### Step 1: Identify Custom Implementations
Search for:
- `<button className="ant-btn"` - Replace with `<Button>`
- `styled(AntComponent)` - Evaluate if it should use theme config or inline styles

### Step 2: Replace Custom Buttons
```tsx
// Before
<button className="ant-btn ant-btn-primary">Click</button>

// After
<Button type="primary">Click</Button>
```

### Step 3: Simplify Styled Components
```tsx
// Before
export const CustomText = styled(Text)`
  &.ant-typography {
    font-size: 14px;
    color: #333;
  }
`;

// After
export const CustomText = Text; // Just re-export
// Use: <CustomText style={{ fontSize: 14, color: '#333' }}>text</CustomText>
```

### Step 4: Add to Theme Config if Needed Globally
If a style is used across multiple pages, add it to the theme configuration instead.

## Benefits of This Approach

1. **Consistency:** All components use the same design system
2. **Maintainability:** Centralized theme makes updates easier
3. **Performance:** Fewer custom styled-components means less CSS overhead
4. **Type Safety:** AntD components have proper TypeScript types
5. **Best Practices:** Following AntD's recommended patterns

## Migration Checklist

- [x] Create centralized theme configuration
- [x] Replace custom buttons in CartPage
- [x] Simplify CartPage styled components
- [ ] Apply same refactoring to remaining 17 pages
- [ ] Document component usage patterns
- [ ] Add ESLint rules to prevent custom implementations
