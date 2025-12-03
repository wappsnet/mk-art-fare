import { query, getConnection } from '../config/database';
import { Organization } from '../types';
import { AppError } from '../middleware/errorHandler';
import { generateSlug } from '../utils/helpers';

export class OrganizationService {
  async createOrganization(ownerId: number, data: {
    name: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
  }): Promise<Organization> {
    const slug = generateSlug(data.name);

    const existing: any = await query(
      'SELECT * FROM organizations WHERE slug = ?',
      [slug]
    );

    if (existing.length > 0) {
      throw new AppError('Organization with this name already exists', 409);
    }

    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      const orgResult: any = await connection.execute(
        `INSERT INTO organizations (owner_id, name, slug, description, logo_url, banner_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ownerId, data.name, slug, data.description || null, data.logoUrl || null, data.bannerUrl || null]
      );

      const orgId = orgResult[0].insertId;

      await connection.execute(
        'INSERT INTO shop_themes (organization_id) VALUES (?)',
        [orgId]
      );

      await connection.commit();

      const results: any = await query(
        'SELECT * FROM organizations WHERE id = ?',
        [orgId]
      );

      return results[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getOrganizationBySlug(slug: string): Promise<any> {
    const results: any = await query(
      `SELECT o.*, st.primary_color, st.secondary_color, st.background_color,
              st.text_color, st.custom_css,
              u.first_name as owner_first_name, u.last_name as owner_last_name
       FROM organizations o
       LEFT JOIN shop_themes st ON o.id = st.organization_id
       LEFT JOIN users u ON o.owner_id = u.id
       WHERE o.slug = ? AND o.is_active = TRUE`,
      [slug]
    );

    return results.length > 0 ? results[0] : null;
  }

  async getOrganizationById(id: number): Promise<Organization | null> {
    const results: any = await query(
      'SELECT * FROM organizations WHERE id = ?',
      [id]
    );

    return results.length > 0 ? results[0] : null;
  }

  async getOrganizationsByOwner(ownerId: number): Promise<Organization[]> {
    const results: any = await query(
      'SELECT * FROM organizations WHERE owner_id = ? ORDER BY created_at DESC',
      [ownerId]
    );

    return results;
  }

  async updateOrganization(orgId: number, ownerId: number, data: any): Promise<Organization> {
    const org = await this.getOrganizationById(orgId);

    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    if (org.owner_id !== ownerId) {
      throw new AppError('Not authorized to update this organization', 403);
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
      updates.push('slug = ?');
      values.push(generateSlug(data.name));
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.logoUrl !== undefined) {
      updates.push('logo_url = ?');
      values.push(data.logoUrl);
    }
    if (data.bannerUrl !== undefined) {
      updates.push('banner_url = ?');
      values.push(data.bannerUrl);
    }

    if (updates.length > 0) {
      values.push(orgId);
      await query(
        `UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    const updated = await this.getOrganizationById(orgId);
    return updated!;
  }

  async updateOrganizationTheme(orgId: number, ownerId: number, theme: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    customCss?: string;
  }): Promise<any> {
    const org = await this.getOrganizationById(orgId);

    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    if (org.owner_id !== ownerId) {
      throw new AppError('Not authorized to update this organization', 403);
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (theme.primaryColor !== undefined) {
      updates.push('primary_color = ?');
      values.push(theme.primaryColor);
    }
    if (theme.secondaryColor !== undefined) {
      updates.push('secondary_color = ?');
      values.push(theme.secondaryColor);
    }
    if (theme.backgroundColor !== undefined) {
      updates.push('background_color = ?');
      values.push(theme.backgroundColor);
    }
    if (theme.textColor !== undefined) {
      updates.push('text_color = ?');
      values.push(theme.textColor);
    }
    if (theme.customCss !== undefined) {
      updates.push('custom_css = ?');
      values.push(theme.customCss);
    }

    if (updates.length > 0) {
      values.push(orgId);
      await query(
        `UPDATE shop_themes SET ${updates.join(', ')} WHERE organization_id = ?`,
        values
      );
    }

    const results: any = await query(
      'SELECT * FROM shop_themes WHERE organization_id = ?',
      [orgId]
    );

    return results[0];
  }

  async deleteOrganization(orgId: number, ownerId: number): Promise<void> {
    const org = await this.getOrganizationById(orgId);

    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    if (org.owner_id !== ownerId) {
      throw new AppError('Not authorized to delete this organization', 403);
    }

    await query('DELETE FROM organizations WHERE id = ?', [orgId]);
  }

  async getAllOrganizations(page: number, limit: number, offset: number, search?: string): Promise<{ organizations: any[]; total: number }> {
    let queryStr = `
      SELECT o.*, u.first_name as owner_first_name, u.last_name as owner_last_name
      FROM organizations o
      LEFT JOIN users u ON o.owner_id = u.id
      WHERE o.is_active = TRUE
    `;
    const params: any[] = [];

    if (search) {
      queryStr += ' AND (o.name LIKE ? OR o.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    queryStr += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const organizations: any = await query(queryStr, params);

    let countQuery = 'SELECT COUNT(*) as total FROM organizations WHERE is_active = TRUE';
    const countParams: any[] = [];

    if (search) {
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const countResult: any = await query(countQuery, countParams);
    const total = countResult[0].total;

    return { organizations, total };
  }
}

export const organizationService = new OrganizationService();
