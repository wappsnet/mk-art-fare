/**
 * Field Search Service
 * Builds dynamic SQL queries for filtering and searching products by custom fields
 */

class FieldSearchService {
  /**
   * Build custom field query components
   * @param {Array} filters - Array of filter objects: [{field_id, operator, value, field_type}, ...]
   * @returns {Object} {joins, whereClauses, params}
   */
  buildCustomFieldQuery(filters) {
    const joins = [];
    const whereClauses = [];
    const params = [];

    if (!filters || filters.length === 0) {
      return { joins: '', whereClauses: [], params: [] };
    }

    filters.forEach((filter, index) => {
      const { field_id, operator, value, field_type } = filter;
      const alias = `cfv_${index}`;

      // Add join for this field
      joins.push(`
        LEFT JOIN product_field_values ${alias}
        ON p.id = ${alias}.product_id
        AND ${alias}.field_definition_id = ?
      `);
      params.push(field_id);

      // Build WHERE condition based on field type and operator
      const condition = this.buildCondition(alias, field_type, operator, value);
      if (condition.clause) {
        whereClauses.push(condition.clause);
        params.push(...condition.params);
      }
    });

    return {
      joins: joins.join(' '),
      whereClauses,
      params,
    };
  }

  /**
   * Build a WHERE condition for a specific field
   * @param {string} alias - Table alias for product_field_values
   * @param {string} fieldType - Type of field
   * @param {string} operator - Comparison operator
   * @param {any} value - Value to compare against
   * @returns {Object} {clause, params}
   */
  buildCondition(alias, fieldType, operator, value) {
    const column = this.getValueColumn(fieldType);

    switch (operator) {
      case 'equals':
        return {
          clause: `${alias}.${column} = ?`,
          params: [value],
        };

      case 'not_equals':
        return {
          clause: `(${alias}.${column} != ? OR ${alias}.${column} IS NULL)`,
          params: [value],
        };

      case 'contains':
        return {
          clause: `${alias}.${column} LIKE ?`,
          params: [`%${value}%`],
        };

      case 'not_contains':
        return {
          clause: `(${alias}.${column} NOT LIKE ? OR ${alias}.${column} IS NULL)`,
          params: [`%${value}%`],
        };

      case 'starts_with':
        return {
          clause: `${alias}.${column} LIKE ?`,
          params: [`${value}%`],
        };

      case 'ends_with':
        return {
          clause: `${alias}.${column} LIKE ?`,
          params: [`%${value}`],
        };

      case 'greater_than':
        return {
          clause: `${alias}.${column} > ?`,
          params: [value],
        };

      case 'less_than':
        return {
          clause: `${alias}.${column} < ?`,
          params: [value],
        };

      case 'greater_than_or_equal':
        return {
          clause: `${alias}.${column} >= ?`,
          params: [value],
        };

      case 'less_than_or_equal':
        return {
          clause: `${alias}.${column} <= ?`,
          params: [value],
        };

      case 'between':
        if (value && value.min !== undefined && value.max !== undefined) {
          return {
            clause: `${alias}.${column} BETWEEN ? AND ?`,
            params: [value.min, value.max],
          };
        }
        return { clause: '', params: [] };

      case 'in':
        if (Array.isArray(value) && value.length > 0) {
          const placeholders = value.map(() => '?').join(', ');
          return {
            clause: `${alias}.${column} IN (${placeholders})`,
            params: value,
          };
        }
        return { clause: '', params: [] };

      case 'not_in':
        if (Array.isArray(value) && value.length > 0) {
          const placeholders = value.map(() => '?').join(', ');
          return {
            clause: `(${alias}.${column} NOT IN (${placeholders}) OR ${alias}.${column} IS NULL)`,
            params: value,
          };
        }
        return { clause: '', params: [] };

      case 'is_empty':
        return {
          clause: `(${alias}.${column} IS NULL OR ${alias}.${column} = '')`,
          params: [],
        };

      case 'is_not_empty':
        return {
          clause: `${alias}.${column} IS NOT NULL AND ${alias}.${column} != ''`,
          params: [],
        };

      case 'json_contains':
        // For checkbox fields (value_json)
        return {
          clause: `JSON_CONTAINS(${alias}.${column}, ?)`,
          params: [JSON.stringify(value)],
        };

      default:
        console.warn(`Unknown operator: ${operator}`);
        return { clause: '', params: [] };
    }
  }

  /**
   * Get the appropriate column name for a field type
   * @param {string} fieldType - The field type
   * @returns {string} Column name
   */
  getValueColumn(fieldType) {
    const mapping = {
      text: 'value_text',
      select: 'value_text',
      radio: 'value_text',
      color: 'value_text',
      number: 'value_number',
      toggle: 'value_boolean',
      date: 'value_date',
      time: 'value_time',
      checkbox: 'value_json',
      image: 'value_json',
      file: 'value_json',
      richtext: 'value_longtext',
    };

    return mapping[fieldType] || 'value_text';
  }

  /**
   * Build full-text search query for custom fields
   * @param {string} searchTerm - Search term
   * @param {Array} searchableFieldIds - Array of field definition IDs that are searchable
   * @returns {Object} {joins, whereClauses, params}
   */
  buildFullTextSearch(searchTerm, searchableFieldIds) {
    if (!searchTerm || !searchableFieldIds || searchableFieldIds.length === 0) {
      return { joins: '', whereClauses: [], params: [] };
    }

    const joins = [];
    const whereClauses = [];
    const params = [];

    searchableFieldIds.forEach((fieldId, index) => {
      const alias = `cfsearch_${index}`;

      joins.push(`
        LEFT JOIN product_field_values ${alias}
        ON p.id = ${alias}.product_id
        AND ${alias}.field_definition_id = ?
      `);
      params.push(fieldId);

      // Use MATCH AGAINST for full-text search on text fields
      whereClauses.push(`
        (MATCH(${alias}.value_text) AGAINST(? IN NATURAL LANGUAGE MODE)
         OR MATCH(${alias}.value_longtext) AGAINST(? IN NATURAL LANGUAGE MODE))
      `);
      params.push(searchTerm, searchTerm);
    });

    return {
      joins: joins.join(' '),
      whereClauses,
      params,
    };
  }

  /**
   * Get filter options for a specific field (for filter UI)
   * @param {number} fieldDefinitionId - Field definition ID
   * @param {number} organizationId - Organization ID (for scoping)
   * @returns {Promise<Array>} Array of unique values with counts
   */
  async getFilterOptions(fieldDefinitionId, organizationId, query) {
    // Get field type to know which column to query
    const fieldDef = await query('SELECT field_type FROM field_definitions WHERE id = ?', [
      fieldDefinitionId,
    ]);

    if (fieldDef.length === 0) {
      return [];
    }

    const fieldType = fieldDef[0].field_type;
    const column = this.getValueColumn(fieldType);

    // For simple value types (text, number, boolean, date), get distinct values with counts
    if (['text', 'select', 'radio', 'number', 'toggle', 'date', 'color'].includes(fieldType)) {
      const results = await query(
        `SELECT pfv.${column} as value, COUNT(DISTINCT p.id) as count
         FROM product_field_values pfv
         INNER JOIN products p ON pfv.product_id = p.id
         WHERE pfv.field_definition_id = ?
           AND p.organization_id = ?
           AND p.is_active = TRUE
           AND pfv.${column} IS NOT NULL
         GROUP BY pfv.${column}
         ORDER BY count DESC, value ASC
         LIMIT 50`,
        [fieldDefinitionId, organizationId]
      );

      return results;
    }

    // For checkbox fields (JSON), need special handling
    if (fieldType === 'checkbox') {
      // This is more complex - would need to parse JSON and aggregate
      // For now, return empty array (can be implemented later)
      return [];
    }

    return [];
  }

  /**
   * Build query for products with ALL specified field groups
   * @param {Array} fieldGroupIds - Array of field group IDs
   * @returns {Object} {joins, whereClauses, params}
   */
  buildFieldGroupFilter(fieldGroupIds) {
    if (!fieldGroupIds || fieldGroupIds.length === 0) {
      return { joins: '', whereClauses: [], params: [] };
    }

    const joins = [];
    const whereClauses = [];
    const params = [];

    fieldGroupIds.forEach((groupId, index) => {
      const alias = `pfga_${index}`;

      joins.push(`
        INNER JOIN product_field_group_assignments ${alias}
        ON p.id = ${alias}.product_id
        AND ${alias}.field_group_id = ?
      `);
      params.push(groupId);
    });

    return {
      joins: joins.join(' '),
      whereClauses,
      params,
    };
  }

  /**
   * Build sorting by custom field
   * @param {number} fieldId - Field definition ID
   * @param {string} fieldType - Field type
   * @param {string} direction - 'ASC' or 'DESC'
   * @returns {Object} {join, orderBy, params}
   */
  buildCustomFieldSort(fieldId, fieldType, direction = 'ASC') {
    const column = this.getValueColumn(fieldType);
    const alias = 'cf_sort';

    const join = `
      LEFT JOIN product_field_values ${alias}
      ON p.id = ${alias}.product_id
      AND ${alias}.field_definition_id = ?
    `;

    const orderBy = `${alias}.${column} ${direction}`;

    return {
      join,
      orderBy,
      params: [fieldId],
    };
  }

  /**
   * Validate filter configuration
   * @param {Array} filters - Array of filter objects
   * @returns {Array<string>} Array of error messages (empty if valid)
   */
  validateFilters(filters) {
    const errors = [];

    if (!Array.isArray(filters)) {
      errors.push('Filters must be an array');
      return errors;
    }

    const validOperators = new Set([
      'equals',
      'not_equals',
      'contains',
      'not_contains',
      'starts_with',
      'ends_with',
      'greater_than',
      'less_than',
      'greater_than_or_equal',
      'less_than_or_equal',
      'between',
      'in',
      'not_in',
      'is_empty',
      'is_not_empty',
      'json_contains',
    ]);

    filters.forEach((filter, index) => {
      if (!filter.field_id) {
        errors.push(`Filter ${index}: field_id is required`);
      }

      if (!filter.operator) {
        errors.push(`Filter ${index}: operator is required`);
      } else if (!validOperators.has(filter.operator)) {
        errors.push(`Filter ${index}: Invalid operator ${filter.operator}`);
      }

      if (!filter.field_type) {
        errors.push(`Filter ${index}: field_type is required`);
      }

      // Validate value based on operator
      if (!['is_empty', 'is_not_empty'].includes(filter.operator) && filter.value === undefined) {
        errors.push(`Filter ${index}: value is required for operator ${filter.operator}`);
      }
    });

    return errors;
  }
}

export default new FieldSearchService();
