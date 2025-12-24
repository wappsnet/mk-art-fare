import { query } from '../config/database.js';

export const productFieldService = {
  async assignFieldGroup(productId, fieldGroupId) {
    await query(
      `INSERT IGNORE INTO product_field_groups (product_id, field_group_id)
       VALUES (?, ?)`,
      [productId, fieldGroupId]
    );
  },

  async unassignFieldGroup(productId, fieldGroupId) {
    await query(
      'DELETE FROM product_field_groups WHERE product_id = ? AND field_group_id = ?',
      [productId, fieldGroupId]
    );
  },

  async getProductFieldGroups(productId) {
    const groups = await query(
      `SELECT fg.* FROM field_groups fg
       INNER JOIN product_field_groups pfg ON fg.id = pfg.field_group_id
       WHERE pfg.product_id = ? AND fg.is_active = TRUE
       ORDER BY fg.name`,
      [productId]
    );

    for (const group of groups) {
      group.fields = await query(
        `SELECT * FROM field_definitions WHERE field_group_id = ? ORDER BY sort_order, id`,
        [group.id]
      );
    }

    return groups;
  },

  async getProductFieldValues(productId) {
    const values = await query(
      `SELECT pfv.*, fd.name, fd.label, fd.type
       FROM product_field_values pfv
       INNER JOIN field_definitions fd ON pfv.field_definition_id = fd.id
       WHERE pfv.product_id = ?`,
      [productId]
    );

    return values.map(v => ({
      id: v.id,
      field_definition_id: v.field_definition_id,
      name: v.name,
      label: v.label,
      type: v.type,
      value: v.value,
    }));
  },

  async updateFieldValue(productId, fieldDefinitionId, value) {
    // MySQL JSON column automatically handles serialization
    // Pass the value directly without stringifying
    await query(
      `INSERT INTO product_field_values (product_id, field_definition_id, value)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value = ?`,
      [productId, fieldDefinitionId, value, value]
    );
  },

  async batchUpdateFieldValues(productId, fields) {
    for (const [fieldDefinitionId, value] of Object.entries(fields)) {
      await this.updateFieldValue(productId, Number.parseInt(fieldDefinitionId), value);
    }
  },

  async deleteFieldValue(productId, fieldDefinitionId) {
    await query(
      'DELETE FROM product_field_values WHERE product_id = ? AND field_definition_id = ?',
      [productId, fieldDefinitionId]
    );
  },
};
