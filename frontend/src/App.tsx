import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { store } from './store';
import { useGetProfileQuery, useGetCartQuery } from './services/apiSlice';
import './styles/global.scss';

// Implemented pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { EventsPage } from './pages/EventsPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { ShopPage } from './pages/ShopPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminPage } from './pages/AdminPage';
import { ShopManagementPage } from './pages/ShopManagementPage';
import { MyEventsPage } from './pages/MyEventsPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { AdminEventModerationPage } from './pages/AdminEventModerationPage';
import { ShopProductsPage } from './pages/shop/ShopProductsPage';
import { ShopEventsPage } from './pages/shop/ShopEventsPage';
import { ShopOrdersPage } from './pages/shop/ShopOrdersPage';
import { ShopAnalyticsPage } from './pages/shop/ShopAnalyticsPage';
import { ShopCategoriesPage } from './pages/shop/ShopCategoriesPage';
import { ShopSettingsPage } from './pages/shop/ShopSettingsPage';

function AppContent() {
  const token = localStorage.getItem('accessToken');

  // Fetch profile if token exists
  useGetProfileQuery(undefined, { skip: !token });

  // Always fetch cart
  useGetCartQuery();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/shop/:slug" element={<ShopPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/my-events" element={<MyEventsPage />} />
        <Route path="/my-tickets" element={<MyTicketsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/event-moderation" element={<AdminEventModerationPage />} />

        {/* Shop Management with nested routes */}
        <Route path="/admin/shop/:id" element={<ShopManagementPage />}>
          <Route index element={<ShopProductsPage />} />
          <Route path="products" element={<ShopProductsPage />} />
          <Route path="categories" element={<ShopCategoriesPage />} />
          <Route path="events" element={<ShopEventsPage />} />
          <Route path="orders" element={<ShopOrdersPage />} />
          <Route path="analytics" element={<ShopAnalyticsPage />} />
          <Route path="settings" element={<ShopSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 4,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          },
        }}
      >
        <AppContent />
      </ConfigProvider>
    </Provider>
  );
}

export default App;
