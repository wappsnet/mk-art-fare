import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateSlug } from '../utils/helpers.js';

export class CategoryService {
  // Get all global categories (predefined by admin)
  async getGlobalCategories() {
    const results = await query(
      'SELECT * FROM categories WHERE is_global = TRUE ORDER BY name ASC'
    );
    return results;
  }

  // Get categories for a specific organization (both global and shop-specific)
  async getCategoriesForOrganization(organizationId) {
    const results = await query(
      `SELECT * FROM categories
       WHERE is_global = TRUE OR organization_id = ?
       ORDER BY is_global DESC, name ASC`,
      [organizationId]
    );
    return results;
  }

  // Get shop-specific categories only
  async getShopCategories(organizationId) {
    const results = await query(
      'SELECT * FROM categories WHERE organization_id = ? ORDER BY name ASC',
      [organizationId]
    );
    return results;
  }

  // Create a new category (either global by admin or shop-specific by artist)
  async createCategory(data, userId, userRole) {
    const slug = data.slug || generateSlug(data.name);

    // Check if slug already exists (for global categories or within the same organization)
    const whereClause = data.organization_id
      ? 'WHERE slug = ? AND (is_global = TRUE OR organization_id = ?)'
      : 'WHERE slug = ? AND is_global = TRUE';

    const params = data.organization_id ? [slug, data.organization_id] : [slug];

    const existing = await query(whereClause, params);

    if (existing.length > 0) {
      throw new AppError('Category with this name already exists', 409);
    }

    // Only admins can create global categories
    if (data.is_global && userRole !== 'admin') {
      throw new AppError('Only admins can create global categories', 403);
    }

    // If organization_id is provided, verify the user owns the organization
    if (data.organization_id) {
      const orgResult = await query('SELECT owner_id FROM organizations WHERE id = ?', [
        data.organization_id,
      ]);

      if (orgResult.length === 0) {
        throw new AppError('Organization not found', 404);
      }

      if (orgResult[0].owner_id !== userId && userRole !== 'admin') {
        throw new AppError('Not authorized to create categories for this organization', 403);
      }
    }

    const result = await query(
      `INSERT INTO categories (name, slug, description, parent_id, organization_id, is_global)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        slug,
        data.description || null,
        data.parent_id || null,
        data.organization_id || null,
        data.is_global || false,
      ]
    );

    const categoryResult = await query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

    return categoryResult[0];
  }

  // Update category
  async updateCategory(categoryId, data, userId, userRole) {
    const categoryResult = await query('SELECT * FROM categories WHERE id = ?', [categoryId]);

    if (categoryResult.length === 0) {
      throw new AppError('Category not found', 404);
    }

    const category = categoryResult[0];

    // Check permissions
    if (category.is_global && userRole !== 'admin') {
      throw new AppError('Only admins can update global categories', 403);
    }

    if (category.organization_id) {
      const orgResult = await query('SELECT owner_id FROM organizations WHERE id = ?', [
        category.organization_id,
      ]);

      if (orgResult.length > 0 && orgResult[0].owner_id !== userId && userRole !== 'admin') {
        throw new AppError('Not authorized to update this category', 403);
      }
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
    if (data.parent_id !== undefined) {
      updates.push('parent_id = ?');
      values.push(data.parent_id);
    }

    if (updates.length > 0) {
      values.push(categoryId);
      await query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    const updated = await query('SELECT * FROM categories WHERE id = ?', [categoryId]);

    return updated[0];
  }

  // Delete category
  async deleteCategory(categoryId, userId, userRole) {
    const categoryResult = await query('SELECT * FROM categories WHERE id = ?', [categoryId]);

    if (categoryResult.length === 0) {
      throw new AppError('Category not found', 404);
    }

    const category = categoryResult[0];

    // Check permissions
    if (category.is_global && userRole !== 'admin') {
      throw new AppError('Only admins can delete global categories', 403);
    }

    if (category.organization_id) {
      const orgResult = await query('SELECT owner_id FROM organizations WHERE id = ?', [
        category.organization_id,
      ]);

      if (orgResult.length > 0 && orgResult[0].owner_id !== userId && userRole !== 'admin') {
        throw new AppError('Not authorized to delete this category', 403);
      }
    }

    // Check if category is being used by products
    const productsUsingCategory = await query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [categoryId]
    );

    if (productsUsingCategory[0].count > 0) {
      throw new AppError('Cannot delete category that is being used by products', 400);
    }

    await query('DELETE FROM categories WHERE id = ?', [categoryId]);
  }

  // Get category by ID
  async getCategoryById(categoryId) {
    const results = await query('SELECT * FROM categories WHERE id = ?', [categoryId]);

    return results.length > 0 ? results[0] : null;
  }
}

export const categoryService = new CategoryService();
