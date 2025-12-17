import crypto from 'node:crypto';
import { config } from '../config/index.js';

/**
 * Converts a filename or relative path to a full URL with the API base URL
 * @param {string} pathOrFilename - Filename like 'image.jpg' or path like '/uploads/products/image.jpg'
 * @param {string} uploadType - Type of upload ('products', 'organizations', etc.) - used if pathOrFilename is just a filename
 * @returns {string} Full URL like 'http://localhost:5000/uploads/products/image.jpg'
 */
export const toFullImageUrl = (pathOrFilename, uploadType = 'products') => {
  if (!pathOrFilename) return null;

  // If it's already a full URL (starts with http:// or https://), return as is
  if (pathOrFilename.startsWith('http://') || pathOrFilename.startsWith('https://')) {
    return pathOrFilename;
  }

  const baseUrl = config.apiUrl || `http://localhost:${config.port}`;

  // If it's already a path (starts with /), use it as is
  if (pathOrFilename.startsWith('/')) {
    return `${baseUrl}${pathOrFilename}`;
  }

  // Otherwise, treat it as a filename and build the path
  return `${baseUrl}/uploads/${uploadType}/${pathOrFilename}`;
};

/**
 * Transforms image fields in an object or array from relative to full URLs
 * @param {object|array} data - Object or array containing image URLs
 * @param {string|array|object} imageFields - Field name(s) to transform. Can be:
 *   - string: 'url'
 *   - array: ['logo_url', 'banner_url']
 *   - object with upload types: { url: 'products', logo_url: 'organizations' }
 * @param {string} defaultUploadType - Default upload type if not specified per field
 * @returns {object|array} Data with transformed URLs
 */
export const transformImageUrls = (data, imageFields, defaultUploadType = 'products') => {
  if (!data) return data;

  let fieldMap = {};

  if (typeof imageFields === 'string') {
    fieldMap[imageFields] = defaultUploadType;
  } else if (Array.isArray(imageFields)) {
    imageFields.forEach((field) => {
      fieldMap[field] = defaultUploadType;
    });
  } else {
    fieldMap = imageFields;
  }

  const transform = (item) => {
    if (!item || typeof item !== 'object') return item;

    const transformed = { ...item };

    Object.entries(fieldMap).forEach(([field, uploadType]) => {
      if (field in transformed) {
        transformed[field] = toFullImageUrl(transformed[field], uploadType);
      }
    });

    return transformed;
  };

  return Array.isArray(data) ? data.map(transform) : transform(data);
};

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
  const pageNum = typeof page === 'string' ? Number.parseInt(page, 10) : page;
  const limitNum = typeof limit === 'string' ? Number.parseInt(limit, 10) : limit;

  const validPage = Math.max(1, Number.isNaN(pageNum) ? 1 : pageNum || 1);
  const validLimit = Math.min(Math.max(1, Number.isNaN(limitNum) ? 10 : limitNum || 10), 100);

  return {
    page: Math.floor(validPage),
    limit: Math.floor(validLimit),
    offset: Math.floor((validPage - 1) * validLimit),
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
  const additionalPerItem = 2;
  return baseShipping + (itemCount - 1) * additionalPerItem;
};
