import { query } from '../../config/database.js';
import { generateSlug } from '../../utils/helpers.js';
import { AppError } from '../../middleware/errorHandler.js';

/**
 * Field Group Service
 * Manages field groups (collections of custom fields)
 */

class FieldGroupService {
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
       WHERE organization_id = ? AND is_active = TRUE`,
      [organizationId]
    );

    if (includeFields) {
      // Lazy load to avoid circular dependency
      const { getFieldDefinitionsByGroup } = await import('./fieldDefinitionService.js');
      // Fetch fields for each group
      for (const group of groups) {
        group.fields = await getFieldDefinitionsByGroup(group.id);
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

    // Lazy load to avoid circular dependency
    const { getFieldDefinitionsByGroup } = await import('./fieldDefinitionService.js');
    group.fields = await getFieldDefinitionsByGroup(groupId);

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
      await query(`UPDATE field_groups SET ${updates.join(', ')} WHERE id = ?`, values);
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
    const groups = await query('SELECT id FROM field_groups WHERE id = ? AND organization_id = ?', [
      groupId,
      organizationId,
    ]);

    if (groups.length === 0) {
      throw new AppError('Field group not found or access denied', 404);
    }
  }
}

export default new FieldGroupService();
