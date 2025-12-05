export const UserRole = {
  CUSTOMER: 'customer',
  ARTIST: 'artist',
  ADMIN: 'admin',
};

export const OrderStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const BlogPostStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const EventBookingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
};

export const EventModerationStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined',
  REMOVED: 'removed',
};

export const EventMediaType = {
  IMAGE: 'image',
  VIDEO: 'video',
};

export const TicketDeliveryMethod = {
  VIRTUAL: 'virtual',
  PHYSICAL_DELIVERY: 'physical_delivery',
  PICKUP: 'pickup',
  ALL: 'all',
};

export const AddressType = {
  SHIPPING: 'shipping',
  BILLING: 'billing',
  BOTH: 'both',
};
