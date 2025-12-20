import { query } from '../config/database.js';
import { generateSlug } from './helpers.js';

/**
 * Build category filter conditions
 * @param {string} category - Comma-separated category slugs
 * @param {Array} params - Array to push parameters into
 * @returns {Promise<string>} SQL condition string
 */
export async function buildCategoryFilter(category, params) {
  if (!category) {
    return '';
  }

  const categories = category
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);

  if (categories.length === 0) {
    return '';
  }

  const categoryPlaceholders = categories.map(() => '?').join(',');
  const categoryResults = await query(
    `SELECT id FROM categories WHERE slug IN (${categoryPlaceholders})`,
    categories
  );
  const categoryIds = categoryResults.map((c) => c.id);

  if (categoryIds.length === 0) {
    return '';
  }

  const placeholders = categoryIds.map(() => '?').join(',');
  params.push(...categoryIds);
  return ` AND p.category_id IN (${placeholders})`;
}

/**
 * Build search filter conditions
 * @param {string} search - Search term
 * @param {Array} params - Array to push parameters into
 * @returns {string} SQL condition string
 */
export function buildSearchFilter(search, params) {
  if (!search) {
    return '';
  }

  params.push(`%${search}%`, `%${search}%`);
  return ' AND (p.name LIKE ? OR p.description LIKE ?)';
}

/**
 * Build price range filter conditions
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @param {Array} params - Array to push parameters into
 * @returns {string} SQL condition string
 */
export function buildPriceFilter(minPrice, maxPrice, params) {
  let condition = '';

  if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
    condition += ' AND p.price >= ?';
    params.push(Number.parseFloat(minPrice));
  }

  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
    condition += ' AND p.price <= ?';
    params.push(Number.parseFloat(maxPrice));
  }

  return condition;
}

/**
 * Build custom fields filter conditions
 * @param {string} customFields - Custom fields filter string
 * @param {Array} params - Array to push parameters into
 * @returns {string} SQL condition string
 */
export function buildCustomFieldsFilter(customFields, params) {
  if (!customFields) {
    return '';
  }

  const fieldFilters = customFields
    .split(',')
    .map((f) => {
      const [fieldId, value] = f.split(':');
      return { fieldId: Number.parseInt(fieldId), value: value?.trim() };
    })
    .filter((f) => f.fieldId && f.value);

  if (fieldFilters.length === 0) {
    return '';
  }

  const fieldConditions = [];

  for (const filter of fieldFilters) {
    fieldConditions.push(
      '(pfv.field_definition_id = ? AND (pfv.value_text LIKE ? OR pfv.value_longtext LIKE ?))'
    );
    params.push(filter.fieldId, `%${filter.value}%`, `%${filter.value}%`);
  }

  return (
    ' AND p.id IN (SELECT DISTINCT pfv.product_id FROM product_field_values pfv WHERE ' +
    fieldConditions.join(' OR ') +
    ')'
  );
}

/**
 * Build complete product query with all filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Query string and parameters
 */
export async function buildProductQuery(filters) {
  const { organizationId, category, search, minPrice, maxPrice, customFields } = filters;

  let queryStr =
    'SELECT p.*, o.name as organization_name, o.slug as organization_slug FROM products p LEFT JOIN organizations o ON p.organization_id = o.id WHERE p.is_active = TRUE';
  const params = [];

  if (organizationId) {
    queryStr += ' AND p.organization_id = ?';
    params.push(organizationId);
  }

  queryStr += await buildCategoryFilter(category, params);
  queryStr += buildSearchFilter(search, params);
  queryStr += buildPriceFilter(minPrice, maxPrice, params);
  queryStr += buildCustomFieldsFilter(customFields, params);

  return { queryStr, params };
}

/**
 * Build count query with same filters as main query
 * @param {Object} filters - Filter parameters
 * @returns {Promise<Object>} Query string and parameters
 */
export async function buildProductCountQuery(filters) {
  const { organizationId, category, search, minPrice, maxPrice, customFields } = filters;

  let queryStr = 'SELECT COUNT(*) as total FROM products p WHERE p.is_active = TRUE';
  const params = [];

  if (organizationId) {
    queryStr += ' AND p.organization_id = ?';
    params.push(organizationId);
  }

  queryStr += await buildCategoryFilter(category, params);
  queryStr += buildSearchFilter(search, params);
  queryStr += buildPriceFilter(minPrice, maxPrice, params);
  queryStr += buildCustomFieldsFilter(customFields, params);

  return { queryStr, params };
}

/**
 * Build product update query from request body
 * @param {Object} body - Request body with fields to update
 * @returns {Object} Updates array and values array for SQL query
 */
export function buildProductUpdateQuery(body) {
  const updates = [];
  const values = [];
  const { name, description, price, compareAtPrice, stockQuantity, sku, isActive } = body;

  const fieldMapping = {
    name: (val) => {
      updates.push('name = ?, slug = ?');
      values.push(val, generateSlug(val));
    },
    description: (val) => {
      updates.push('description = ?');
      values.push(val);
    },
    price: (val) => {
      updates.push('price = ?');
      values.push(val);
    },
    compareAtPrice: (val) => {
      updates.push('compare_at_price = ?');
      values.push(val);
    },
    stockQuantity: (val) => {
      updates.push('stock_quantity = ?');
      values.push(val);
    },
    sku: (val) => {
      updates.push('sku = ?');
      values.push(val);
    },
    isActive: (val) => {
      updates.push('is_active = ?');
      values.push(val);
    },
  };

  const fields = { name, description, price, compareAtPrice, stockQuantity, sku, isActive };

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && fieldMapping[key]) {
      fieldMapping[key](value);
    }
  }

  return { updates, values };
}
