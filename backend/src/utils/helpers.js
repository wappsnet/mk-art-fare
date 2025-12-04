import crypto from 'crypto';

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

export const generateBookingNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `BKG-${timestamp}-${random}`;
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const getPaginationParams = (page, limit) => {
  const pageNum = typeof page === 'string' ? parseInt(page) : page || 1;
  const limitNum = typeof limit === 'string' ? parseInt(limit) : limit || 10;

  const validPage = Math.max(1, pageNum);
  const validLimit = Math.min(Math.max(1, limitNum), 100);

  return {
    page: validPage,
    limit: validLimit,
    offset: (validPage - 1) * validLimit,
  };
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const sanitizeHtml = (html) => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const calculateTax = (subtotal, taxRate = 0.1) => {
  return Math.round(subtotal * taxRate * 100) / 100;
};

export const calculateShipping = (itemCount) => {
  if (itemCount === 0) return 0;
  const baseShipping = 5.99;
  const additionalPerItem = 2.0;
  return baseShipping + (itemCount - 1) * additionalPerItem;
};
