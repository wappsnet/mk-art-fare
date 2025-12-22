import { query } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import {
  parseFieldValue,
  getColumnForFieldType,
  processValueForStorage,
} from './fieldParsingService.js';
import fieldDefinitionService from './fieldDefinitionService.js';

/**
 * Field Value Service
 * Manages product field values
 */

class FieldValueService {
  /**
   * Get all custom field values for a product
   */
  async getProductFieldValues(productId) {
    const values = await query(
      `SELECT pfv.*, fd.name, fd.label, fd.field_type, fd.options
       FROM product_field_values pfv
       INNER JOIN field_definitions fd ON pfv.field_definition_id = fd.id
       WHERE pfv.product_id = ?`,
      [productId]
    );

    return values.map((value) => parseFieldValue(value));
  }

  /**
   * Get a specific field value for a product
   */
  async getProductFieldValue(productId, fieldDefinitionId) {
    const values = await query(
      `SELECT pfv.*, fd.field_type
       FROM product_field_values pfv
       INNER JOIN field_definitions fd ON pfv.field_definition_id = fd.id
       WHERE pfv.product_id = ? AND pfv.field_definition_id = ?`,
      [productId, fieldDefinitionId]
    );

    if (values.length === 0) {
      return null;
    }

    return parseFieldValue(values[0]);
  }

  /**
   * Set or update a product field value
   */
  async setProductFieldValue(productId, fieldDefinitionId, value, fieldType) {
    // Determine which column to use based on field type
    const column = getColumnForFieldType(fieldType);
    if (!column) {
      throw new AppError(`Invalid field type: ${fieldType}`, 400);
    }

    // Prepare value based on type
    const processedValue = processValueForStorage(value, fieldType);

    // Check if value already exists
    const existing = await query(
      'SELECT id FROM product_field_values WHERE product_id = ? AND field_definition_id = ?',
      [productId, fieldDefinitionId]
    );

    if (existing.length > 0) {
      // Update existing value
      await query(
        `UPDATE product_field_values SET ${column} = ?, updated_at = CURRENT_TIMESTAMP
         WHERE product_id = ? AND field_definition_id = ?`,
        [processedValue, productId, fieldDefinitionId]
      );
    } else {
      // Insert new value
      await query(
        `INSERT INTO product_field_values (product_id, field_definition_id, ${column})
         VALUES (?, ?, ?)`,
        [productId, fieldDefinitionId, processedValue]
      );
    }

    return this.getProductFieldValue(productId, fieldDefinitionId);
  }

  /**
   * Batch update product field values
   */
  async batchUpdateProductFieldValues(productId, fields) {
    // fields is an object: { fieldDefinitionId: value, ... }
    const results = [];

    for (const [fieldDefinitionId, value] of Object.entries(fields)) {
      // Get field type
      const fieldDef = await fieldDefinitionService.getFieldDefinitionById(
        Number(fieldDefinitionId)
      );
      const result = await this.setProductFieldValue(
        productId,
        Number(fieldDefinitionId),
        value,
        fieldDef.field_type
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Delete a product field value
   */
  async deleteProductFieldValue(productId, fieldDefinitionId) {
    await query(
      'DELETE FROM product_field_values WHERE product_id = ? AND field_definition_id = ?',
      [productId, fieldDefinitionId]
    );
  }
}

export default new FieldValueService();

// Export function for use by other services
export const setProductFieldValue = (productId, fieldDefinitionId, value, fieldType) => {
  return new FieldValueService().setProductFieldValue(
    productId,
    fieldDefinitionId,
    value,
    fieldType
  );
};
