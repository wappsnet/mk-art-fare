import { query } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { parseFieldDefinition } from './fieldParsingService.js';

/**
 * Field Definition Service
 * Manages field definitions within field groups
 */

class FieldDefinitionService {
  /**
   * Add a field definition to a field group
   */
  async createFieldDefinition(fieldGroupId, data) {
    const {
      name,
      label,
      field_type,
      placeholder,
      help_text,
      default_value,
      options,
      validation_rules,
      conditional_logic,
      is_searchable,
      is_filterable,
      sort_order,
    } = data;

    // Verify field group exists
    await query('SELECT id FROM field_groups WHERE id = ?', [fieldGroupId]);

    const result = await query(
      `INSERT INTO field_definitions (
        field_group_id, name, label, field_type, placeholder, help_text,
        default_value, options, validation_rules, conditional_logic,
        is_searchable, is_filterable, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fieldGroupId,
        name,
        label,
        field_type,
        placeholder || null,
        help_text || null,
        default_value || null,
        options ? JSON.stringify(options) : null,
        validation_rules ? JSON.stringify(validation_rules) : null,
        conditional_logic ? JSON.stringify(conditional_logic) : null,
        is_searchable || false,
        is_filterable || false,
        sort_order || 0,
      ]
    );

    return this.getFieldDefinitionById(result.insertId);
  }

  /**
   * Get all field definitions for a field group
   */
  async getFieldDefinitionsByGroup(fieldGroupId) {
    const fields = await query(
      `SELECT * FROM field_definitions
       WHERE field_group_id = ? AND is_active = TRUE`,
      [fieldGroupId]
    );

    // Parse JSON fields
    return fields.map((field) => parseFieldDefinition(field));
  }

  /**
   * Get a single field definition by ID
   */
  async getFieldDefinitionById(fieldId) {
    const fields = await query('SELECT * FROM field_definitions WHERE id = ?', [fieldId]);

    if (fields.length === 0) {
      throw new AppError('Field definition not found', 404);
    }

    return parseFieldDefinition(fields[0]);
  }

  /**
   * Update a field definition
   */
  async updateFieldDefinition(fieldId, data) {
    const updates = [];
    const values = [];

    const allowedFields = [
      'name',
      'label',
      'field_type',
      'placeholder',
      'help_text',
      'default_value',
      'is_searchable',
      'is_filterable',
      'sort_order',
      'is_active',
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    });

    // Handle JSON fields separately
    if (data.options !== undefined) {
      updates.push('options = ?');
      values.push(JSON.stringify(data.options));
    }

    if (data.validation_rules !== undefined) {
      updates.push('validation_rules = ?');
      values.push(JSON.stringify(data.validation_rules));
    }

    if (data.conditional_logic !== undefined) {
      updates.push('conditional_logic = ?');
      values.push(JSON.stringify(data.conditional_logic));
    }

    if (updates.length > 0) {
      values.push(fieldId);
      await query(`UPDATE field_definitions SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    return this.getFieldDefinitionById(fieldId);
  }

  /**
   * Delete a field definition
   */
  async deleteFieldDefinition(fieldId) {
    await query('DELETE FROM field_definitions WHERE id = ?', [fieldId]);
  }

  /**
   * Reorder field definitions within a group
   */
  async reorderFields(fieldGroupId, fieldIds) {
    // fieldIds is an array of field IDs in the desired order
    for (let i = 0; i < fieldIds.length; i++) {
      await query(
        'UPDATE field_definitions SET sort_order = ? WHERE id = ? AND field_group_id = ?',
        [i, fieldIds[i], fieldGroupId]
      );
    }

    return this.getFieldDefinitionsByGroup(fieldGroupId);
  }
}

export default new FieldDefinitionService();

// Export function for use by other services
export const getFieldDefinitionsByGroup = (fieldGroupId) => {
  return new FieldDefinitionService().getFieldDefinitionsByGroup(fieldGroupId);
};
