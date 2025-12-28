export enum UserRole {
  CUSTOMER = 'customer',
  ARTIST = 'artist',
  ADMIN = 'admin',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum ModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
}

export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
  moderation_status?: ModerationStatus;
  moderation_note?: string;
  moderated_by?: number;
  moderated_at?: string;
  created_at: string;
  updated_at: string;
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  text_color?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  organization_id?: number;
  is_global: boolean;
  created_at: string;
  updated_at: string;
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
  moderation_status?: ModerationStatus;
  moderation_note?: string;
  moderated_by?: number;
  moderated_at?: string;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  organization_name?: string;
  organization_slug?: string;
  category_name?: string;
  primary_image_url?: string;
  stock?: number;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  alt_text?: string;
  sort_order: number;
  is_thumbnail?: boolean;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  slug: string;
  organization_name: string;
  organization_slug: string;
  image_url?: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  organization_id?: number;
  status: OrderStatus;
  payment_status?: string;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
  total_amount?: number;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  organization_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  product_name: string;
}

export interface BlogPost {
  id: number;
  author_id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  status: string;
  published_at?: string;
  view_count: number;
  created_at: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  comments?: BlogComment[];
}

export interface BlogComment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id?: number;
  content: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export interface Address {
  id: number;
  user_id: number;
  address_type: string;
  is_default: boolean;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  country: string;
  postal_code: string;
  notes?: string;
}

export interface CreateAddressInput {
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  address_type: string;
}

export interface DeliveryAddress {
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  address_type: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RegisterFormData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AnalyticsRevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface AnalyticsStatusData {
  status: string;
  count: number;
  revenue: number;
}

export interface AnalyticsTopProduct {
  name: string;
  total_sold: number;
  revenue: number;
}

export interface AnalyticsData {
  total: {
    total_orders: number;
    total_revenue: number;
    total_items_sold: number;
  };
  byStatus: AnalyticsStatusData[];
  recentRevenue: AnalyticsRevenueData[];
  topProducts: AnalyticsTopProduct[];
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  sku: string;
  category_id?: number;
}

export interface OrganizationTheme {
  primaryColor: string;
  secondaryColor: string;
}

export interface OrganizationThemeData {
  id: number;
  theme: OrganizationTheme;
}

export interface OrganizationLogoData {
  id: number;
  file: File;
}

export interface OrganizationBannerData {
  id: number;
  file: File;
}

export interface Page {
  id: number;
  slug: string;
  title: string;
  content: Record<string, unknown>;
  meta_description?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageFormData {
  title: string;
  content: Record<string, unknown>;
  meta_description?: string;
  is_published?: boolean;
}
