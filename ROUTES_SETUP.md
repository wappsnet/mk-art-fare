# Event System Routes Setup

## Routes to Add

Add these routes to your React Router configuration (usually in `App.tsx` or `routes.tsx`):

```tsx
import { MyEventsPage } from './pages/MyEventsPage';
import { AdminEventModerationPage } from './pages/AdminEventModerationPage';
import { MyTicketsPage } from './pages/MyTicketsPage';

// Public routes (no auth required)
<Route path="/events" element={<EventsPage />} />  // Already exists
<Route path="/events/:slug" element={<EventDetailPage />} />  // Already exists

// Protected routes (authentication required)
<Route path="/my-tickets" element={<MyTicketsPage />} />

// Organization owner routes (artist role)
<Route path="/my-events" element={<MyEventsPage />} />

// Admin only routes
<Route path="/admin/event-moderation" element={<AdminEventModerationPage />} />
```

## Navigation Links to Add

### In Main Navigation (Header/Navbar)

```tsx
// For all authenticated users
<Link to="/my-tickets">My Tickets</Link>

// For organization owners (artist role)
{user?.role === 'artist' && (
  <Link to="/my-events">My Events</Link>
)}

// For admins
{user?.role === 'admin' && (
  <Link to="/admin/event-moderation">Event Moderation</Link>
)}
```

### Example Navigation Component

```tsx
import { useAppSelector } from '@/hooks/useRedux';
import { UserRole } from '@/types';

export const Navigation = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Menu mode="horizontal">
      {/* Public links */}
      <Menu.Item key="home">
        <Link to="/">Home</Link>
      </Menu.Item>
      <Menu.Item key="products">
        <Link to="/products">Products</Link>
      </Menu.Item>
      <Menu.Item key="events">
        <Link to="/events">Events</Link>
      </Menu.Item>

      {/* Authenticated user links */}
      {isAuthenticated && (
        <>
          <Menu.Item key="my-tickets">
            <Link to="/my-tickets">My Tickets</Link>
          </Menu.Item>

          {/* Organization owner links */}
          {user?.role === UserRole.ARTIST && (
            <>
              <Menu.Item key="dashboard">
                <Link to="/dashboard">Dashboard</Link>
              </Menu.Item>
              <Menu.Item key="my-events">
                <Link to="/my-events">My Events</Link>
              </Menu.Item>
            </>
          )}

          {/* Admin links */}
          {user?.role === UserRole.ADMIN && (
            <>
              <Menu.Item key="admin">
                <Link to="/admin">Admin Panel</Link>
              </Menu.Item>
              <Menu.Item key="event-moderation">
                <Link to="/admin/event-moderation">Event Moderation</Link>
              </Menu.Item>
            </>
          )}
        </>
      )}
    </Menu>
  );
};
```

## Route Protection Example

```tsx
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import { UserRole } from '@/types';

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }: {
  children: React.ReactNode;
  allowedRoles?: UserRole[]
}) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Usage in routes
<Route
  path="/my-events"
  element={
    <ProtectedRoute allowedRoles={[UserRole.ARTIST, UserRole.ADMIN]}>
      <MyEventsPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/event-moderation"
  element={
    <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
      <AdminEventModerationPage />
    </ProtectedRoute>
  }
/>
```

## Dashboard Links

### Organization Dashboard (`ShopManagementPage.tsx`)

✅ Already added! The "Events" tab is now available in the organization dashboard with a "Manage Events" button.

### Admin Dashboard

Add event moderation link to admin dashboard:

```tsx
<Card title="Event Management">
  <Button
    type="primary"
    icon={<CheckOutlined />}
    onClick={() => navigate('/admin/event-moderation')}
  >
    Moderate Events
  </Button>
  <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
    Review and approve events submitted by organization owners
  </Text>
</Card>
```

## User Dashboard

Add a "My Tickets" section for regular users:

```tsx
<Card title="My Event Tickets">
  <Button
    type="primary"
    icon={<TicketOutlined />}
    onClick={() => navigate('/my-tickets')}
  >
    View My Tickets
  </Button>
  <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
    Access your purchased event tickets and booking details
  </Text>
</Card>
```

## Quick Setup Checklist

- [ ] Import new page components in your router file
- [ ] Add routes with proper path and element mappings
- [ ] Add route protection for authenticated routes
- [ ] Add role-based route guards for admin/artist routes
- [ ] Add navigation links based on user role
- [ ] Update organization dashboard (already done ✅)
- [ ] Add admin dashboard event moderation link
- [ ] Add user dashboard "My Tickets" link
- [ ] Test all routes work correctly
- [ ] Test route protection works

## Complete Example Routes File

```tsx
// routes.tsx or App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useRedux';
import { UserRole } from '@/types';

// Import pages
import { HomePage } from './pages/HomePage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { AdminEventModerationPage } from './pages/AdminEventModerationPage';
// ... other imports

const ProtectedRoute = ({ children, allowedRoles }: any) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/events" element={<EventsPage />} />
      <Route path="/events/:slug" element={<EventDetailPage />} />

      {/* Authenticated routes */}
      <Route
        path="/my-tickets"
        element={
          <ProtectedRoute>
            <MyTicketsPage />
          </ProtectedRoute>
        }
      />

      {/* Organization owner routes */}
      <Route
        path="/my-events"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ARTIST, UserRole.ADMIN]}>
            <MyEventsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/event-moderation"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminEventModerationPage />
          </ProtectedRoute>
        }
      />

      {/* ... other routes */}
    </Routes>
  );
};
```

## Testing the Routes

1. **As a Guest User:**
   - Can view `/events`
   - Can view `/events/:slug`
   - Cannot access `/my-events`, `/my-tickets`, `/admin/event-moderation`

2. **As a Customer (logged in):**
   - Can view all public routes
   - Can view `/my-tickets`
   - Cannot access `/my-events`, `/admin/event-moderation`

3. **As an Artist/Organization Owner:**
   - Can view all customer routes
   - Can view `/my-events`
   - Cannot access `/admin/event-moderation`

4. **As an Admin:**
   - Can access all routes
   - Can view `/admin/event-moderation`
   - Can view all organization owner features

That's it! Your event system is now fully integrated into the navigation structure.
