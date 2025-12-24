import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateSlug } from '../utils/helpers.js';

export const fieldGroupService = {
  async create(organizationId, data) {
    const slug = generateSlug(data.name);
    const result = await query(
      `INSERT INTO field_groups (organization_id, name, slug, description)
       VALUES (?, ?, ?, ?)`,
      [organizationId, data.name, slug, data.description]
    );
    return this.getById(result.insertId);
  },

  async getById(id) {
    const results = await query(
      `SELECT * FROM field_groups WHERE id = ?`,
      [id]
    );
    if (results.length === 0) {
      throw new AppError('Field group not found', 404);
    }
    return results[0];
  },

  async getByOrganization(organizationId, includeFields = false) {
    const groups = await query(
      `SELECT * FROM field_groups
       WHERE organization_id = ? AND is_active = TRUE
       ORDER BY name`,
      [organizationId]
    );

    if (includeFields) {
      for (const group of groups) {
        group.fields = await query(
          `SELECT * FROM field_definitions
           WHERE field_group_id = ?
           ORDER BY sort_order, id`,
          [group.id]
        );
      }
    }

    return groups;
  },

  async update(id, data) {
    const updates = [];
    const values = [];

    if (data.name) {
      updates.push('name = ?', 'slug = ?');
      values.push(data.name, generateSlug(data.name));
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    await query(
      `UPDATE field_groups SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.getById(id);
  },

  async delete(id) {
    await query('DELETE FROM field_groups WHERE id = ?', [id]);
  },
};
