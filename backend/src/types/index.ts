import { Request } from 'express';

export enum UserRole {
  CUSTOMER = 'customer',
  ARTIST = 'artist',
  ADMIN = 'admin'
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum EventBookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}

export enum AddressType {
  SHIPPING = 'shipping',
  BILLING = 'billing',
  BOTH = 'both'
}

export interface User {
  id: number;
  email: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  is_verified: boolean;
  google_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Organization {
  id: number;
  owner_id: number;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  organization_id: number;
  category_id?: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  stock_quantity: number;
  sku?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  shipping_address_line1?: string;
  shipping_address_line2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_postal_code?: string;
  billing_address_line1?: string;
  billing_address_line2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_country?: string;
  billing_postal_code?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BlogPost {
  id: number;
  author_id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  status: BlogPostStatus;
  published_at?: Date;
  view_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface Event {
  id: number;
  organization_id?: number;
  title: string;
  slug: string;
  description?: string;
  event_type?: string;
  venue_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  start_date: Date;
  end_date: Date;
  featured_image_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
