import { query } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import fieldDefinitionService from './fieldDefinitionService.js';

/**
 * Field Assignment Service
 * Manages product-field group assignments
 */

class FieldAssignmentService {
  /**
   * Assign a field group to a product
   */
  async assignFieldGroupToProduct(productId, fieldGroupId) {
    // Check if already assigned
    const existing = await query(
      'SELECT id FROM product_field_group_assignments WHERE product_id = ? AND field_group_id = ?',
      [productId, fieldGroupId]
    );

    if (existing.length > 0) {
      throw new AppError('Field group already assigned to this product', 400);
    }

    await query(
      'INSERT INTO product_field_group_assignments (product_id, field_group_id) VALUES (?, ?)',
      [productId, fieldGroupId]
    );

    // Initialize default values for all fields in the group
    const fields = await fieldDefinitionService.getFieldDefinitionsByGroup(fieldGroupId);

    // Lazy load to avoid circular dependency
    const { setProductFieldValue } = await import('./fieldValueService.js');

    for (const field of fields) {
      if (field.default_value) {
        await setProductFieldValue(productId, field.id, field.default_value, field.field_type);
      }
    }
  }

  /**
   * Unassign a field group from a product
   */
  async unassignFieldGroupFromProduct(productId, fieldGroupId) {
    await query(
      'DELETE FROM product_field_group_assignments WHERE product_id = ? AND field_group_id = ?',
      [productId, fieldGroupId]
    );

    // Delete all field values for fields in this group
    await query(
      `DELETE pfv FROM product_field_values pfv
       INNER JOIN field_definitions fd ON pfv.field_definition_id = fd.id
       WHERE pfv.product_id = ? AND fd.field_group_id = ?`,
      [productId, fieldGroupId]
    );
  }

  /**
   * Get all field groups assigned to a product
   */
  async getProductFieldGroups(productId) {
    const groups = await query(
      `SELECT fg.* FROM field_groups fg
       INNER JOIN product_field_group_assignments pfga ON fg.id = pfga.field_group_id
       WHERE pfga.product_id = ? AND fg.is_active = TRUE`,
      [productId]
    );

    // Load fields for each group
    for (const group of groups) {
      group.fields = await fieldDefinitionService.getFieldDefinitionsByGroup(group.id);
    }

    return groups;
  }
}

export default new FieldAssignmentService();
