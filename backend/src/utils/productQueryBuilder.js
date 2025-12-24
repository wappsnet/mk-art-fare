import { buildDynamicUpdateQuery } from './queryBuilders.js';

/**
 * Build product query with filters
 *
 * @param {Object} filters - Filter options
 * @param {number} filters.organizationId - Filter by organization
 * @param {string} filters.category - Filter by category slug
 * @param {string} filters.search - Search in name/description
 * @param {number} filters.minPrice - Minimum price filter
 * @param {number} filters.maxPrice - Maximum price filter
 * @param {string|Object} filters.customFields - Custom field filters (JSON or object)
 * @returns {Promise<Object>} { queryStr, params }
 */
export async function buildProductQuery(filters = {}) {
  const conditions = [];
  const params = [];

  let baseQuery = `
    SELECT DISTINCT p.*
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `;

  // Add custom fields join if needed
  if (filters.customFields) {
    baseQuery += `
      LEFT JOIN product_field_values pfv ON p.id = pfv.product_id
      LEFT JOIN field_definitions fd ON pfv.field_definition_id = fd.id
    `;
  }

  baseQuery += ' WHERE 1=1';

  // Organization filter
  if (filters.organizationId) {
    conditions.push('p.organization_id = ?');
    params.push(Number.parseInt(filters.organizationId));
  }

  // Category filter
  if (filters.category) {
    conditions.push('c.slug = ?');
    params.push(filters.category);
  }

  // Search filter
  if (filters.search) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }

  // Price filters
  if (filters.minPrice !== undefined && filters.minPrice !== null) {
    conditions.push('p.price >= ?');
    params.push(Number.parseFloat(filters.minPrice));
  }

  if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
    conditions.push('p.price <= ?');
    params.push(Number.parseFloat(filters.maxPrice));
  }

  // Custom fields filter
  if (filters.customFields) {
    const customFieldsObj =
      typeof filters.customFields === 'string'
        ? JSON.parse(filters.customFields)
        : filters.customFields;

    const fieldConditions = [];
    for (const [fieldId, fieldValue] of Object.entries(customFieldsObj)) {
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
        fieldConditions.push(`(fd.id = ? AND pfv.value = ?)`);
        params.push(Number.parseInt(fieldId), JSON.stringify(fieldValue));
      }
    }

    if (fieldConditions.length > 0) {
      conditions.push(`(${fieldConditions.join(' OR ')})`);
    }
  }

  // Always show active products only for public queries
  conditions.push('p.is_active = TRUE');

  // Combine all conditions
  const queryStr = baseQuery + (conditions.length > 0 ? ' AND ' + conditions.join(' AND ') : '');

  return { queryStr, params };
}

/**
 * Build product count query with the same filters
 *
 * @param {Object} filters - Same filter options as buildProductQuery
 * @returns {Promise<Object>} { queryStr, params }
 */
export async function buildProductCountQuery(filters = {}) {
  const conditions = [];
  const params = [];

  let countQuery = `
    SELECT COUNT(DISTINCT p.id) as total
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `;

  // Add custom fields join if needed
  if (filters.customFields) {
    countQuery += `
      LEFT JOIN product_field_values pfv ON p.id = pfv.product_id
      LEFT JOIN field_definitions fd ON pfv.field_definition_id = fd.id
    `;
  }

  countQuery += ' WHERE 1=1';

  // Organization filter
  if (filters.organizationId) {
    conditions.push('p.organization_id = ?');
    params.push(Number.parseInt(filters.organizationId));
  }

  // Category filter
  if (filters.category) {
    conditions.push('c.slug = ?');
    params.push(filters.category);
  }

  // Search filter
  if (filters.search) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }

  // Price filters
  if (filters.minPrice !== undefined && filters.minPrice !== null) {
    conditions.push('p.price >= ?');
    params.push(Number.parseFloat(filters.minPrice));
  }

  if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
    conditions.push('p.price <= ?');
    params.push(Number.parseFloat(filters.maxPrice));
  }

  // Custom fields filter
  if (filters.customFields) {
    const customFieldsObj =
      typeof filters.customFields === 'string'
        ? JSON.parse(filters.customFields)
        : filters.customFields;

    const fieldConditions = [];
    for (const [fieldId, fieldValue] of Object.entries(customFieldsObj)) {
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
        fieldConditions.push(`(fd.id = ? AND pfv.value = ?)`);
        params.push(Number.parseInt(fieldId), JSON.stringify(fieldValue));
      }
    }

    if (fieldConditions.length > 0) {
      conditions.push(`(${fieldConditions.join(' OR ')})`);
    }
  }

  // Always show active products only for public queries
  conditions.push('p.is_active = TRUE');

  // Combine all conditions
  const queryStr = countQuery + (conditions.length > 0 ? ' AND ' + conditions.join(' AND ') : '');

  return { queryStr, params };
}

/**
 * Build product update query
 *
 * @param {Object} data - Product data to update
 * @returns {Object} { updates, values }
 */
export function buildProductUpdateQuery(data) {
  const allowedFields = [
    'name',
    'description',
    'price',
    'compareAtPrice',
    'stockQuantity',
    'sku',
    'categoryId',
    'featuredImageUrl',
    'isActive',
  ];

  return buildDynamicUpdateQuery('products', allowedFields, data, { slugifyName: true });
}
