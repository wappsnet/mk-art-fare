import type { AppRouteObject } from '@/types/routes';
import { RequireGuest } from '@/guards';
import HomePage from '@/pages/public/HomePage';
import LoginPage from '@/pages/public/LoginPage';
import RegisterPage from '@/pages/public/RegisterPage';
import ForgotPasswordPage from '@/pages/public/ForgotPasswordPage';
import ProductsPage from '@/pages/public/ProductsPage';
import ProductDetailPage from '@/pages/public/ProductDetailPage';
import ShopPage from '@/pages/public/ShopPage';
import CartPage from '@/pages/public/CartPage';
import CheckoutPage from '@/pages/public/CheckoutPage';
import BlogPage from '@/pages/public/BlogPage';
import BlogPostPage from '@/pages/public/BlogPostPage';
import PricingPage from '@/pages/public/PricingPage';
import HelpCenterPage from '@/pages/public/HelpCenterPage';

export const publicRoutes: AppRouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
    meta: { title: 'Home - Art Fare' },
  },
  {
    path: '/login',
    element: (
      <RequireGuest>
        <LoginPage />
      </RequireGuest>
    ),
    meta: { requiresGuest: true, title: 'Login - Art Fare' },
  },
  {
    path: '/register',
    element: (
      <RequireGuest>
        <RegisterPage />
      </RequireGuest>
    ),
    meta: { requiresGuest: true, title: 'Register - Art Fare' },
  },
  {
    path: '/forgot-password',
    element: (
      <RequireGuest>
        <ForgotPasswordPage />
      </RequireGuest>
    ),
    meta: { requiresGuest: true, title: 'Forgot Password - Art Fare' },
  },
  {
    path: '/products',
    element: <ProductsPage />,
    meta: { title: 'Products - Art Fare' },
  },
  {
    path: '/products/:slug',
    element: <ProductDetailPage />,
    meta: { title: 'Product Details - Art Fare' },
  },
  {
    path: '/shop/:slug',
    element: <ShopPage />,
    meta: { title: 'Shop - Art Fare' },
  },
  {
    path: '/cart',
    element: <CartPage />,
    meta: { title: 'Shopping Cart - Art Fare' },
  },
  {
    path: '/checkout',
    element: <CheckoutPage />,
    meta: { title: 'Checkout - Art Fare' },
  },
  {
    path: '/blog',
    element: <BlogPage />,
    meta: { title: 'Blog - Art Fare' },
  },
  {
    path: '/blog/:slug',
    element: <BlogPostPage />,
    meta: { title: 'Blog Post - Art Fare' },
  },
  {
    path: '/pricing',
    element: <PricingPage />,
    meta: { title: 'Pricing - Art Fare' },
  },
  {
    path: '/help',
    element: <HelpCenterPage />,
    meta: { title: 'Help Center - Art Fare' },
  },
];
