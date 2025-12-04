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
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  organization_name?: string;
  organization_slug?: string;
  category_name?: string;
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
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total: number;
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

export interface Event {
  id: number;
  organization_id?: number;
  title: string;
  slug: string;
  description?: string;
  event_type?: string;
  venue_name?: string;
  city?: string;
  state?: string;
  country?: string;
  start_date: string;
  end_date: string;
  featured_image_url?: string;
  is_active: boolean;
  tickets?: EventTicket[];
  organization_name?: string;
}

export interface EventTicket {
  id: number;
  event_id: number;
  ticket_type: string;
  price: number;
  quantity_available: number;
  quantity_sold: number;
  description?: string;
}

export interface EventBooking {
  id: number;
  booking_number: string;
  event_id: number;
  ticket_id: number;
  user_id: number;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
  event_title?: string;
  ticket_type?: string;
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
}

export interface ApiResponse<T = any> {
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
