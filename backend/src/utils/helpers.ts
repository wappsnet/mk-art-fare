import crypto from 'crypto';

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

export const generateBookingNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `BKG-${timestamp}-${random}`;
};

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const getPaginationParams = (
  page?: string | number,
  limit?: string | number
): { page: number; limit: number; offset: number } => {
  const pageNum = typeof page === 'string' ? parseInt(page) : page || 1;
  const limitNum = typeof limit === 'string' ? parseInt(limit) : limit || 10;

  const validPage = Math.max(1, pageNum);
  const validLimit = Math.min(Math.max(1, limitNum), 100);

  return {
    page: validPage,
    limit: validLimit,
    offset: (validPage - 1) * validLimit
  };
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const calculateTax = (subtotal: number, taxRate: number = 0.1): number => {
  return Math.round(subtotal * taxRate * 100) / 100;
};

export const calculateShipping = (itemCount: number): number => {
  if (itemCount === 0) return 0;
  const baseShipping = 5.99;
  const additionalPerItem = 2.00;
  return baseShipping + (itemCount - 1) * additionalPerItem;
};
