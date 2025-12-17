import { query, getConnection } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateSlug, transformImageUrls } from '../utils/helpers.js';

export class OrganizationService {
  async createOrganization(ownerId, data) {
    const slug = data.slug || generateSlug(data.name);

    const existing = await query('SELECT * FROM organizations WHERE slug = ?', [slug]);

    if (existing.length > 0) {
      throw new AppError('Organization with this name already exists', 409);
    }

    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // Check user's current role and upgrade to artist if needed
      const userResult = await connection.execute('SELECT role FROM users WHERE id = ?', [ownerId]);

      if (userResult[0].length > 0 && userResult[0][0].role === 'customer') {
        await connection.execute('UPDATE users SET role = ? WHERE id = ?', ['artist', ownerId]);
      }

      const orgResult = await connection.execute(
        `INSERT INTO organizations (owner_id, name, slug, description, logo_url, banner_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          ownerId,
          data.name,
          slug,
          data.description || null,
          data.logoUrl || null,
          data.bannerUrl || null,
        ]
      );

      const orgId = orgResult[0].insertId;

      await connection.execute('INSERT INTO shop_themes (organization_id) VALUES (?)', [orgId]);

      await connection.commit();

      const results = await query('SELECT * FROM organizations WHERE id = ?', [orgId]);

      return transformImageUrls(results[0], ['logo_url', 'banner_url'], 'organizations');
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getOrganizationBySlug(slug) {
    const results = await query(
      `SELECT o.*, st.primary_color, st.secondary_color, st.background_color,
              st.text_color, st.custom_css,
              u.first_name as owner_first_name, u.last_name as owner_last_name
       FROM organizations o
       LEFT JOIN shop_themes st ON o.id = st.organization_id
       LEFT JOIN users u ON o.owner_id = u.id
       WHERE o.slug = ? AND o.is_active = TRUE`,
      [slug]
    );

    return results.length > 0
      ? transformImageUrls(results[0], ['logo_url', 'banner_url'], 'organizations')
      : null;
  }

  async getOrganizationById(id) {
    const results = await query('SELECT * FROM organizations WHERE id = ?', [id]);

    return results.length > 0
      ? transformImageUrls(results[0], ['logo_url', 'banner_url'], 'organizations')
      : null;
  }

  async getOrganizationsByOwner(ownerId) {
    const results = await query(
      'SELECT * FROM organizations WHERE owner_id = ? ORDER BY created_at DESC',
      [ownerId]
    );

    return transformImageUrls(results, ['logo_url', 'banner_url'], 'organizations');
  }

  async updateOrganization(orgId, ownerId, data) {
    const org = await this.getOrganizationById(orgId);

    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    if (org.owner_id !== ownerId) {
      throw new AppError('Not authorized to update this organization', 403);
    }

    const updates = [];
    const values = [];

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
      await query(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    return await this.getOrganizationById(orgId);
  }

  async updateOrganizationTheme(orgId, ownerId, theme) {
    const org = await this.getOrganizationById(orgId);

    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    if (org.owner_id !== ownerId) {
      throw new AppError('Not authorized to update this organization', 403);
    }

    const updates = [];
    const values = [];

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
      await query(`UPDATE shop_themes SET ${updates.join(', ')} WHERE organization_id = ?`, values);
    }

    const results = await query('SELECT * FROM shop_themes WHERE organization_id = ?', [orgId]);

    return results[0];
  }

  async deleteOrganization(orgId, ownerId) {
    const org = await this.getOrganizationById(orgId);

    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    if (org.owner_id !== ownerId) {
      throw new AppError('Not authorized to delete this organization', 403);
    }

    await query('DELETE FROM organizations WHERE id = ?', [orgId]);
  }

  async getAllOrganizations(page, limit, offset, search) {
    // Ensure limit and offset are valid integers
    const validLimit = Math.floor(Number(limit)) || 10;
    const validOffset = Math.floor(Number(offset)) || 0;

    let queryStr = `
      SELECT o.*, u.first_name as owner_first_name, u.last_name as owner_last_name
      FROM organizations o
      LEFT JOIN users u ON o.owner_id = u.id
      WHERE o.is_active = TRUE
    `;
    const params = [];

    if (search) {
      queryStr += ' AND (o.name LIKE ? OR o.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    queryStr += ` ORDER BY o.created_at DESC LIMIT ${validLimit} OFFSET ${validOffset}`;

    let organizations = await query(queryStr, params);
    organizations = transformImageUrls(organizations, ['logo_url', 'banner_url'], 'organizations');

    let countQuery = 'SELECT COUNT(*) as total FROM organizations WHERE is_active = TRUE';
    const countParams = [];

    if (search) {
      countQuery += ' AND (name LIKE ? OR description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await query(countQuery, countParams);
    const total = countResult[0].total;

    return { organizations, total };
  }

  async getOrganizationProducts(slug) {
    const org = await this.getOrganizationBySlug(slug);

    if (!org) {
      throw new AppError('Organization not found', 404);
    }

    const products = await query(
      `SELECT p.*, o.name as organization_name, o.slug as organization_slug,
              c.name as category_name,
              (SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', pi.id,
                  'product_id', pi.product_id,
                  'url', pi.url,
                  'alt_text', pi.alt_text,
                  'sort_order', pi.sort_order,
                  'is_thumbnail', pi.is_thumbnail
                )
              )
              FROM product_images pi
              WHERE pi.product_id = p.id
              ORDER BY pi.sort_order ASC
              ) as images
       FROM products p
       LEFT JOIN organizations o ON p.organization_id = o.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.organization_id = ? AND p.is_active = TRUE
       ORDER BY p.created_at DESC`,
      [org.id]
    );

    return products.map((p) => {
      const parsedImages = Array.isArray(p.images)
        ? p.images
        : typeof p.images === 'string' && p.images.length
        ? JSON.parse(p.images)
        : [];

      return {
        ...transformImageUrls(p, 'featured_image_url', 'products'),
        images: transformImageUrls(parsedImages, 'url', 'products'),
      };
    });
  }
}

export const organizationService = new OrganizationService();
