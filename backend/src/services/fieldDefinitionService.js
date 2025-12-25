import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const fieldDefinitionService = {
  async create(fieldGroupId, data) {
    // MySQL JSON columns automatically handle serialization
    const result = await query(
      `INSERT INTO field_definitions (
        field_group_id, name, label, type, placeholder, help_text,
        default_value, options, validation_rules, required,
        is_searchable, is_filterable, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fieldGroupId,
        data.name,
        data.label,
        data.field_type,
        data.placeholder,
        data.help_text,
        data.default_value,
        data.options || null,
        data.validation_rules || null,
        data.required || false,
        data.is_searchable || false,
        data.is_filterable || false,
        data.sort_order || 0,
      ]
    );

    return this.getById(result.insertId);
  },

  async getById(id) {
    const results = await query(
      'SELECT * FROM field_definitions WHERE id = ?',
      [id]
    );
    if (results.length === 0) {
      throw new AppError('Field definition not found', 404);
    }
    return results[0];
  },

  async getByFieldGroup(fieldGroupId) {
    return query(
      'SELECT * FROM field_definitions WHERE field_group_id = ? ORDER BY sort_order, id',
      [fieldGroupId]
    );
  },

  async update(id, data) {
    const updates = [];
    const values = [];

    if (data.name) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.label) {
      updates.push('label = ?');
      values.push(data.label);
    }
    if (data.field_type) {
      updates.push('type = ?');
      values.push(data.field_type);
    }
    if (data.placeholder !== undefined) {
      updates.push('placeholder = ?');
      values.push(data.placeholder);
    }
    if (data.help_text !== undefined) {
      updates.push('help_text = ?');
      values.push(data.help_text);
    }
    if (data.default_value !== undefined) {
      updates.push('default_value = ?');
      values.push(data.default_value);
    }
    if (data.options !== undefined) {
      updates.push('options = ?');
      values.push(data.options);
    }
    if (data.validation_rules !== undefined) {
      updates.push('validation_rules = ?');
      values.push(data.validation_rules);
    }
    if (data.required !== undefined) {
      updates.push('required = ?');
      values.push(data.required);
    }
    if (data.is_searchable !== undefined) {
      updates.push('is_searchable = ?');
      values.push(data.is_searchable);
    }
    if (data.is_filterable !== undefined) {
      updates.push('is_filterable = ?');
      values.push(data.is_filterable);
    }
    if (data.sort_order !== undefined) {
      updates.push('sort_order = ?');
      values.push(data.sort_order);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    await query(
      `UPDATE field_definitions SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.getById(id);
  },

  async delete(id) {
    await query('DELETE FROM field_definitions WHERE id = ?', [id]);
  },

  async reorder(fieldGroupId, fieldIds) {
    for (let i = 0; i < fieldIds.length; i++) {
      await query(
        'UPDATE field_definitions SET sort_order = ? WHERE id = ? AND field_group_id = ?',
        [i, fieldIds[i], fieldGroupId]
      );
    }
  },
};
