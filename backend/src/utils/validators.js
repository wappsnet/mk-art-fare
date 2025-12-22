import { AppError } from '../middleware/errorHandler.js';

/**
 * Ensure query results are not empty, throw 404 if empty
 * Eliminates repetitive empty array checks
 *
 * @param {Array} results - Query results array
 * @param {string} resourceName - Name of the resource for error message
 * @param {number} statusCode - HTTP status code (default: 404)
 * @throws {AppError} If results array is empty
 * @returns {Array} The results array if not empty
 *
 * @example
 * const product = await query('SELECT * FROM products WHERE id = ?', [id]);
 * ensureFound(product, 'Product'); // Throws if product.length === 0
 */
export function ensureFound(results, resourceName = 'Resource', statusCode = 404) {
  if (!results || results.length === 0) {
    throw new AppError(`${resourceName} not found`, statusCode);
  }
  return results;
}

/**
 * Validate pagination parameters
 *
 * @param {number|string} page - Page number
 * @param {number|string} limit - Items per page
 * @returns {Object} { page: number, limit: number, offset: number }
 *
 * @example
 * const { page, limit, offset } = validatePagination(req.query.page, req.query.limit);
 */
export function validatePagination(page, limit) {
  const pageNum = typeof page === 'string' ? Number.parseInt(page, 10) : page;
  const limitNum = typeof limit === 'string' ? Number.parseInt(limit, 10) : limit;

  const validPage = Math.max(1, Number.isNaN(pageNum) ? 1 : pageNum || 1);
  const validLimit = Math.min(Math.max(1, Number.isNaN(limitNum) ? 10 : limitNum || 10), 100);

  return {
    page: Math.floor(validPage),
    limit: Math.floor(validLimit),
    offset: Math.floor((validPage - 1) * validLimit),
  };
}

/**
 * Validate required fields in data object
 *
 * @param {Object} data - Data object to validate
 * @param {Array<string>} requiredFields - List of required field names
 * @throws {AppError} If any required field is missing or empty
 *
 * @example
 * validateRequiredFields(req.body, ['name', 'email', 'password']);
 */
export function validateRequiredFields(data, requiredFields) {
  const missing = [];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
  }
}

/**
 * Validate integer parameter
 *
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @param {number} defaultValue - Default value if invalid (optional)
 * @returns {number} Valid integer
 * @throws {AppError} If value is invalid and no default provided
 *
 * @example
 * const productId = validateInteger(req.params.id, 'Product ID');
 * const limit = validateInteger(req.query.limit, 'Limit', 10); // with default
 */
export function validateInteger(value, fieldName = 'Value', defaultValue = null) {
  const num = Number(value);

  if (Number.isNaN(num) || !Number.isInteger(num)) {
    if (defaultValue !== null) {
      return defaultValue;
    }
    throw new AppError(`${fieldName} must be a valid integer`, 400);
  }

  return num;
}

/**
 * Validate positive number
 *
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {number} Valid positive number
 * @throws {AppError} If value is not a positive number
 *
 * @example
 * const price = validatePositiveNumber(req.body.price, 'Price');
 */
export function validatePositiveNumber(value, fieldName = 'Value') {
  const num = Number(value);

  if (Number.isNaN(num) || num <= 0) {
    throw new AppError(`${fieldName} must be a positive number`, 400);
  }

  return num;
}

/**
 * Validate email format
 *
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 * @throws {AppError} If email format is invalid
 *
 * @example
 * validateEmail(req.body.email);
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new AppError('Invalid email format', 400);
  }

  return true;
}

/**
 * Validate enum value
 *
 * @param {any} value - Value to validate
 * @param {Array} allowedValues - Array of allowed values
 * @param {string} fieldName - Field name for error message
 * @returns {any} The valid value
 * @throws {AppError} If value is not in allowed values
 *
 * @example
 * const status = validateEnum(req.body.status, ['pending', 'shipped', 'delivered'], 'Order status');
 */
export function validateEnum(value, allowedValues, fieldName = 'Value') {
  if (!allowedValues.includes(value)) {
    throw new AppError(
      `${fieldName} must be one of: ${allowedValues.join(', ')}. Got: ${value}`,
      400
    );
  }

  return value;
}

/**
 * Validate array parameter
 *
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @param {number} minLength - Minimum array length (optional)
 * @param {number} maxLength - Maximum array length (optional)
 * @returns {Array} Valid array
 * @throws {AppError} If value is not a valid array or length is out of bounds
 *
 * @example
 * const items = validateArray(req.body.items, 'Cart items', 1, 100);
 */
export function validateArray(value, fieldName = 'Value', minLength = null, maxLength = null) {
  if (!Array.isArray(value)) {
    throw new AppError(`${fieldName} must be an array`, 400);
  }

  if (minLength !== null && value.length < minLength) {
    throw new AppError(`${fieldName} must have at least ${minLength} items`, 400);
  }

  if (maxLength !== null && value.length > maxLength) {
    throw new AppError(`${fieldName} cannot have more than ${maxLength} items`, 400);
  }

  return value;
}

/**
 * Validate file upload
 *
 * @param {Object} file - Multer file object
 * @param {Object} options - Validation options
 * @param {Array<string>} options.allowedMimeTypes - Allowed MIME types
 * @param {number} options.maxSize - Maximum file size in bytes
 * @throws {AppError} If file is invalid
 *
 * @example
 * validateFileUpload(req.file, {
 *   allowedMimeTypes: ['image/jpeg', 'image/png'],
 *   maxSize: 5 * 1024 * 1024 // 5MB
 * });
 */
export function validateFileUpload(file, options = {}) {
  if (!file) {
    throw new AppError('No file uploaded', 400);
  }

  const { allowedMimeTypes = [], maxSize = null } = options;

  if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype)) {
    throw new AppError(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`, 400);
  }

  if (maxSize && file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    throw new AppError(`File size exceeds maximum of ${maxSizeMB}MB`, 400);
  }

  return true;
}

/**
 * Sanitize string input (basic XSS prevention)
 *
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 *
 * @example
 * const safeName = sanitizeString(req.body.name);
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;

  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;')
    .replaceAll('/', '&#x2F;')
    .trim();
}

/**
 * Validate date string
 *
 * @param {string} dateStr - Date string to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Date} Valid Date object
 * @throws {AppError} If date is invalid
 *
 * @example
 * const startDate = validateDate(req.body.startDate, 'Start date');
 */
export function validateDate(dateStr, fieldName = 'Date') {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${fieldName} is not a valid date`, 400);
  }

  return date;
}

/**
 * Validate JSON string
 *
 * @param {string} jsonStr - JSON string to validate
 * @param {string} fieldName - Field name for error message
 * @returns {any} Parsed JSON object
 * @throws {AppError} If JSON is invalid
 *
 * @example
 * const options = validateJSON(req.body.options, 'Options');
 */
export function validateJSON(jsonStr, fieldName = 'JSON') {
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    throw new AppError(`${fieldName} is not valid JSON: ${error.message}`, 400);
  }
}
