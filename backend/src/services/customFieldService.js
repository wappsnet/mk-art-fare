import { query } from '../config/database.js';
import { generateSlug } from '../utils/helpers.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Custom Field Service
 * Core business logic for field groups, field definitions, and product field values
 */

class CustomFieldService {
  // ==================== FIELD GROUPS ====================

  /**
   * Create a new field group
   */
  async createFieldGroup(organizationId, data) {
    const { name, description } = data;
    const slug = generateSlug(name);

    // Check if slug already exists for this organization
    const existing = await query(
      'SELECT id FROM field_groups WHERE organization_id = ? AND slug = ?',
      [organizationId, slug]
    );

    if (existing.length > 0) {
      throw new AppError('A field group with this name already exists', 400);
    }

    const result = await query(
      `INSERT INTO field_groups (organization_id, name, slug, description)
       VALUES (?, ?, ?, ?)`,
      [organizationId, name, slug, description || null]
    );

    return this.getFieldGroupById(result.insertId);
  }

  /**
   * Get all field groups for an organization
   */
  async getFieldGroupsByOrganization(organizationId, includeFields = false) {
    const groups = await query(
      `SELECT * FROM field_groups
       WHERE organization_id = ? AND is_active = TRUE
       ORDER BY name ASC`,
      [organizationId]
    );

    if (includeFields) {
      // Fetch fields for each group
      for (const group of groups) {
        group.fields = await this.getFieldDefinitionsByGroup(group.id);
      }
    }

    return groups;
  }

  /**
   * Get a single field group by ID with its field definitions
   */
  async getFieldGroupById(groupId) {
    const groups = await query('SELECT * FROM field_groups WHERE id = ?', [groupId]);

    if (groups.length === 0) {
      throw new AppError('Field group not found', 404);
    }

    const group = groups[0];
    group.fields = await this.getFieldDefinitionsByGroup(groupId);

    return group;
  }

  /**
   * Update a field group
   */
  async updateFieldGroup(groupId, organizationId, data) {
    // Verify ownership
    await this.verifyFieldGroupOwnership(groupId, organizationId);

    const updates = [];
    const values = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);

      // Update slug if name changed
      const slug = generateSlug(data.name);
      updates.push('slug = ?');
      values.push(slug);
    }

    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(data.is_active);
    }

    if (updates.length > 0) {
      values.push(groupId);
      await query(
        `UPDATE field_groups SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    return this.getFieldGroupById(groupId);
  }

  /**
   * Delete a field group
   */
  async deleteFieldGroup(groupId, organizationId) {
    // Verify ownership
    await this.verifyFieldGroupOwnership(groupId, organizationId);

    await query('DELETE FROM field_groups WHERE id = ?', [groupId]);
  }

  /**
   * Verify that a field group belongs to an organization
   */
  async verifyFieldGroupOwnership(groupId, organizationId) {
    const groups = await query(
      'SELECT id FROM field_groups WHERE id = ? AND organization_id = ?',
      [groupId, organizationId]
    );

    if (groups.length === 0) {
      throw new AppError('Field group not found or access denied', 404);
    }
  }

  // ==================== FIELD DEFINITIONS ====================

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
       WHERE field_group_id = ? AND is_active = TRUE
       ORDER BY sort_order ASC, id ASC`,
      [fieldGroupId]
    );

    // Parse JSON fields
    return fields.map((field) => this.parseFieldDefinition(field));
  }

  /**
   * Get a single field definition by ID
   */
  async getFieldDefinitionById(fieldId) {
    const fields = await query('SELECT * FROM field_definitions WHERE id = ?', [
      fieldId,
    ]);

    if (fields.length === 0) {
      throw new AppError('Field definition not found', 404);
    }

    return this.parseFieldDefinition(fields[0]);
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
      await query(
        `UPDATE field_definitions SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
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

  /**
   * Parse JSON fields in field definition
   */
  parseFieldDefinition(field) {
    if (field.options && typeof field.options === 'string') {
      field.options = JSON.parse(field.options);
    }
    if (field.validation_rules && typeof field.validation_rules === 'string') {
      field.validation_rules = JSON.parse(field.validation_rules);
    }
    if (field.conditional_logic && typeof field.conditional_logic === 'string') {
      field.conditional_logic = JSON.parse(field.conditional_logic);
    }
    return field;
  }

  // ==================== PRODUCT FIELD GROUP ASSIGNMENTS ====================

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
    const fields = await this.getFieldDefinitionsByGroup(fieldGroupId);
    for (const field of fields) {
      if (field.default_value) {
        await this.setProductFieldValue(productId, field.id, field.default_value, field.field_type);
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
       WHERE pfga.product_id = ? AND fg.is_active = TRUE
       ORDER BY fg.name ASC`,
      [productId]
    );

    // Load fields for each group
    for (const group of groups) {
      group.fields = await this.getFieldDefinitionsByGroup(group.id);
    }

    return groups;
  }

  // ==================== PRODUCT FIELD VALUES ====================

  /**
   * Get all custom field values for a product
   */
  async getProductFieldValues(productId) {
    const values = await query(
      `SELECT pfv.*, fd.name, fd.label, fd.field_type, fd.options
       FROM product_field_values pfv
       INNER JOIN field_definitions fd ON pfv.field_definition_id = fd.id
       WHERE pfv.product_id = ?
       ORDER BY fd.sort_order ASC`,
      [productId]
    );

    return values.map((value) => this.parseFieldValue(value));
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

    return this.parseFieldValue(values[0]);
  }

  /**
   * Set or update a product field value
   */
  async setProductFieldValue(productId, fieldDefinitionId, value, fieldType) {
    // Determine which column to use based on field type
    const columnMap = {
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

    const column = columnMap[fieldType];
    if (!column) {
      throw new AppError(`Invalid field type: ${fieldType}`, 400);
    }

    // Prepare value based on type
    let processedValue = value;
    if (['checkbox', 'image', 'file'].includes(fieldType) && typeof value !== 'string') {
      processedValue = JSON.stringify(value);
    }

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
      const fieldDef = await this.getFieldDefinitionById(Number(fieldDefinitionId));
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

  /**
   * Parse field value based on type
   */
  parseFieldValue(value) {
    // Determine the actual value based on field type
    const fieldType = value.field_type;
    let actualValue;

    if (fieldType === 'number') {
      actualValue = value.value_number;
    } else if (fieldType === 'toggle') {
      actualValue = value.value_boolean;
    } else if (fieldType === 'date') {
      actualValue = value.value_date;
    } else if (fieldType === 'time') {
      actualValue = value.value_time;
    } else if (['checkbox', 'image', 'file'].includes(fieldType)) {
      actualValue = value.value_json ? JSON.parse(value.value_json) : null;
    } else if (fieldType === 'richtext') {
      actualValue = value.value_longtext;
    } else {
      actualValue = value.value_text;
    }

    return {
      ...value,
      value: actualValue,
    };
  }
}

export default new CustomFieldService();
