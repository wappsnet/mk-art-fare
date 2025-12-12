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
  price: string;
  compare_at_price?: string;
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
  price: string;
  slug: string;
  organization_name: string;
  organization_slug: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  eventTicketItems?: EventTicketCartItem[];
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

export enum EventModerationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
  REMOVED = 'removed',
}

export enum EventMediaType {
  IMAGE = 'image',
  VIDEO = 'video',
}

export enum TicketDeliveryMethod {
  VIRTUAL = 'virtual',
  PHYSICAL_DELIVERY = 'physical_delivery',
  PICKUP = 'pickup',
  ALL = 'all',
}

export enum EventBookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

export interface Event {
  id: number;
  organization_id?: number;
  created_by: number;
  title: string;
  slug: string;
  description?: string;
  event_type: string;
  venue_name?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  start_date: string;
  end_date: string;
  featured_image_url?: string;
  video_url?: string;
  video_file?: string;
  moderation_status: EventModerationStatus;
  moderation_comment?: string;
  moderated_by?: number;
  moderated_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tickets?: EventTicket[];
  media?: EventMedia[];
  organization_name?: string;
  creator_email?: string;
  creator_first_name?: string;
  creator_last_name?: string;
  moderator_first_name?: string;
  moderator_last_name?: string;
}

export interface EventMedia {
  id: number;
  event_id: number;
  media_type: EventMediaType;
  url?: string;
  file_path?: string;
  alt_text?: string;
  sort_order: number;
  created_at: string;
}

export interface EventTicket {
  id: number;
  event_id: number;
  ticket_type: string;
  price: string;
  is_free: boolean;
  quantity_available: number;
  quantity_sold: number;
  description?: string;
  delivery_method: TicketDeliveryMethod;
  pickup_location?: string;
  pickup_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface EventTicketCartItem {
  id: number;
  cart_id: number;
  ticket_id: number;
  quantity: number;
  ticket_type: string;
  price: string;
  is_free: boolean;
  quantity_available: number;
  quantity_sold: number;
  delivery_method: TicketDeliveryMethod;
  event_title: string;
  event_slug: string;
  start_date: string;
  venue_name?: string;
  created_at: string;
  updated_at: string;
}

export interface EventBooking {
  id: number;
  booking_number: string;
  event_id: number;
  ticket_id: number;
  user_id: number;
  quantity: number;
  total_price: number;
  status: EventBookingStatus;
  attendee_name: string;
  attendee_email: string;
  attendee_phone?: string;
  delivery_method: TicketDeliveryMethod;
  delivery_address_line1?: string;
  delivery_address_line2?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_country?: string;
  delivery_postal_code?: string;
  pickup_location?: string;
  virtual_ticket_code?: string;
  qr_code_url?: string;
  email_sent: boolean;
  email_sent_at?: string;
  created_at: string;
  updated_at: string;
  event_title?: string;
  start_date?: string;
  venue_name?: string;
  ticket_type?: string;
}

export interface EventModerationLog {
  id: number;
  event_id: number;
  moderator_id: number;
  action: EventModerationStatus;
  comment?: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  moderator_email?: string;
}

export interface CreateEventData {
  organizationId?: number;
  title: string;
  description?: string;
  eventType?: string;
  venue?: {
    name?: string;
  };
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  };
  startDate: string;
  endDate: string;
  featuredImageUrl?: string;
  videoUrl?: string;
  tickets?: Array<{
    type: string;
    price?: number;
    quantity: number;
    description?: string;
    deliveryMethod?: TicketDeliveryMethod;
    pickupLocation?: string;
    pickupInstructions?: string;
  }>;
  mediaUrls?: Array<{
    url: string;
    type?: EventMediaType;
    altText?: string;
    order?: number;
  }>;
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

export interface BookingAttendeeInfo {
  name: string;
  email: string;
  phone?: string;
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
  first_name: string;
  last_name: string;
}

export interface AnalyticsRevenueData {
  date: string;
  revenue: number;
}

export interface AnalyticsStatusData {
  status: string;
  count: number;
  revenue: string | number;
}

export interface AnalyticsTopProduct {
  id?: number;
  name: string;
  quantity_sold?: number;
  total_sold: number;
  revenue: string | number;
}

export interface AnalyticsTopEvent {
  id?: number;
  name: string;
  title?: string;
  tickets_sold?: number;
  total_sold: number;
  revenue: string | number;
}

export interface AnalyticsData {
  total: {
    total_orders?: number;
    total_revenue?: number;
    total_items_sold?: number;
    total_tickets_sold?: number;
    product_revenue?: number;
    event_revenue?: number;
  };
  byStatus: AnalyticsStatusData[];
  recentRevenue: AnalyticsRevenueData[];
  topProducts: AnalyticsTopProduct[];
  topEvents: AnalyticsTopEvent[];
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  sku: string;
  category_id?: number;
}

export interface OrganizationThemeData {
  id: number;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface OrganizationLogoData {
  id: number;
  file: File;
}

export interface OrganizationBannerData {
  id: number;
  file: File;
}
