import { generateSlug } from './helpers.js';

/**
 * Build a dynamic UPDATE query from allowed fields
 * Eliminates code duplication across services
 *
 * @param {string} tableName - The table name for the UPDATE query
 * @param {Array<string>} allowedFields - List of fields that can be updated
 * @param {Object} data - Data object containing field values
 * @param {Object} options - Additional options
 * @param {boolean} options.slugifyName - If true, auto-generate slug when name is updated
 * @returns {Object} { updates: string[], values: any[], hasUpdates: boolean }
 *
 * @example
 * const { updates, values, hasUpdates } = buildDynamicUpdateQuery(
 *   'products',
 *   ['name', 'description', 'price'],
 *   { name: 'New Name', price: 29.99 },
 *   { slugifyName: true }
 * );
 * if (hasUpdates) {
 *   await query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, [...values, productId]);
 * }
 */
export function buildDynamicUpdateQuery(tableName, allowedFields, data, options = {}) {
  const updates = [];
  const values = [];
  const { slugifyName = false } = options;

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      // Handle special case: auto-generate slug when name is updated
      if (field === 'name' && slugifyName) {
        updates.push('name = ?', 'slug = ?');
        values.push(data.name, generateSlug(data.name));
      } else {
        // Convert camelCase to snake_case for database columns
        const dbColumn = camelToSnake(field);
        updates.push(`${dbColumn} = ?`);
        values.push(data[field]);
      }
    }
  }

  return {
    updates,
    values,
    hasUpdates: updates.length > 0,
  };
}

/**
 * Build pagination clause for SQL queries
 *
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} { clause: string, offset: number, limit: number }
 *
 * @example
 * const { clause, offset, limit } = buildPaginationClause(2, 10);
 * const query = `SELECT * FROM products WHERE is_active = TRUE ${clause}`;
 * // Returns: "LIMIT 10 OFFSET 10"
 */
export function buildPaginationClause(page, limit) {
  const validPage = Math.max(1, Math.floor(Number(page)) || 1);
  const validLimit = Math.min(Math.max(1, Math.floor(Number(limit)) || 10), 100);
  const offset = (validPage - 1) * validLimit;

  return {
    clause: `LIMIT ${validLimit} OFFSET ${offset}`,
    offset,
    limit: validLimit,
    page: validPage,
  };
}

/**
 * Build WHERE conditions dynamically
 *
 * @param {Object} conditions - Key-value pairs of conditions
 * @param {string} operator - SQL operator to join conditions ('AND' or 'OR')
 * @returns {Object} { clause: string, values: any[] }
 *
 * @example
 * const { clause, values } = buildWhereClause({
 *   organization_id: 123,
 *   is_active: true,
 *   category_id: 5
 * });
 * // Returns: { clause: "organization_id = ? AND is_active = ? AND category_id = ?", values: [123, true, 5] }
 */
export function buildWhereClause(conditions, operator = 'AND') {
  const clauses = [];
  const values = [];

  for (const [key, value] of Object.entries(conditions)) {
    if (value !== undefined && value !== null) {
      clauses.push(`${key} = ?`);
      values.push(value);
    }
  }

  return {
    clause: clauses.length > 0 ? clauses.join(` ${operator} `) : '',
    values,
  };
}

/**
 * Build INSERT query with multiple rows (bulk insert)
 *
 * @param {string} tableName - Table name
 * @param {Array<string>} columns - Column names
 * @param {Array<Array>} rows - Array of value arrays
 * @returns {Object} { query: string, values: any[] }
 *
 * @example
 * const { query, values } = buildBulkInsertQuery(
 *   'product_images',
 *   ['product_id', 'url', 'sort_order'],
 *   [[1, 'img1.jpg', 0], [1, 'img2.jpg', 1]]
 * );
 * // Returns: "INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?), (?, ?, ?)"
 */
export function buildBulkInsertQuery(tableName, columns, rows) {
  const placeholders = rows.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
  const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${placeholders}`;
  const values = rows.flat();

  return { query, values };
}

/**
 * Convert camelCase to snake_case for database columns
 *
 * @param {string} str - camelCase string
 * @returns {string} snake_case string
 *
 * @example
 * camelToSnake('userId') // 'user_id'
 * camelToSnake('compareAtPrice') // 'compare_at_price'
 */
export function camelToSnake(str) {
  return str.replaceAll(/[A-Z]/, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert snake_case to camelCase
 *
 * @param {string} str - snake_case string
 * @returns {string} camelCase string
 *
 * @example
 * snakeToCamel('user_id') // 'userId'
 * snakeToCamel('compare_at_price') // 'compareAtPrice'
 */
export function snakeToCamel(str) {
  return str.replaceAll(/_([a-z])/, (_, letter) => letter.toUpperCase());
}
