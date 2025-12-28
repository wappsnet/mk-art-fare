import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { ensureFound } from '../utils/validators.js';

/**
 * Page Service
 * Handles static page content management
 */

class PageService {
  /**
   * Get all pages (admin only)
   *
   * @returns {Promise<Array>} All pages
   */
  async getAllPages() {
    return await query(
      `SELECT id, slug, title, meta_description, is_published, created_at, updated_at
       FROM pages`
    );
  }

  /**
   * Get page by slug (public)
   *
   * @param {string} slug - Page slug
   * @returns {Promise<Object>} Page data
   * @throws {AppError} If page not found or not published
   */
  async getPageBySlug(slug) {
    const page = await query('SELECT * FROM pages WHERE slug = ? AND is_published = TRUE', [slug]);

    ensureFound(page, 'Page');

    // Parse JSON content
    const pageData = page[0];
    if (pageData.content && typeof pageData.content === 'string') {
      pageData.content = JSON.parse(pageData.content);
    }

    return pageData;
  }

  /**
   * Get page by ID (admin only)
   *
   * @param {number} id - Page ID
   * @returns {Promise<Object>} Page data
   * @throws {AppError} If page not found
   */
  async getPageById(id) {
    const page = await query('SELECT * FROM pages WHERE id = ?', [id]);

    ensureFound(page, 'Page');

    // Parse JSON content
    const pageData = page[0];
    if (pageData.content && typeof pageData.content === 'string') {
      pageData.content = JSON.parse(pageData.content);
    }

    return pageData;
  }

  /**
   * Update page content (admin only)
   *
   * @param {number} id - Page ID
   * @param {Object} data - Update data { title, content, meta_description, is_published }
   * @returns {Promise<Object>} Updated page
   * @throws {AppError} If page not found
   */
  async updatePage(id, data) {
    // Verify page exists
    await this.getPageById(id);

    const { title, content, meta_description, is_published } = data;

    // Prepare content (ensure it's JSON)
    let jsonContent = content;
    if (typeof content !== 'string') {
      jsonContent = JSON.stringify(content);
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }

    if (content !== undefined) {
      updates.push('content = ?');
      values.push(jsonContent);
    }

    if (meta_description !== undefined) {
      updates.push('meta_description = ?');
      values.push(meta_description);
    }

    if (is_published !== undefined) {
      updates.push('is_published = ?');
      values.push(is_published ? 1 : 0);
    }

    if (updates.length === 0) {
      throw new AppError('No valid fields to update', 400);
    }

    values.push(id);

    await query(`UPDATE pages SET ${updates.join(', ')} WHERE id = ?`, values);

    return this.getPageById(id);
  }

  /**
   * Create new page (admin only)
   *
   * @param {Object} data - Page data { slug, title, content, meta_description, is_published }
   * @returns {Promise<Object>} Created page
   * @throws {AppError} If slug already exists
   */
  async createPage(data) {
    const { slug, title, content, meta_description, is_published } = data;

    if (!slug || !title || !content) {
      throw new AppError('Slug, title, and content are required', 400);
    }

    // Check if slug already exists
    const existing = await query('SELECT id FROM pages WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      throw new AppError('A page with this slug already exists', 400);
    }

    // Prepare content (ensure it's JSON)
    let jsonContent = content;
    if (typeof content !== 'string') {
      jsonContent = JSON.stringify(content);
    }

    const result = await query(
      `INSERT INTO pages (slug, title, content, meta_description, is_published)
       VALUES (?, ?, ?, ?, ?)`,
      [slug, title, jsonContent, meta_description || null, is_published === false ? 0 : 1]
    );

    return this.getPageById(result.insertId);
  }

  /**
   * Delete page (admin only)
   *
   * @param {number} id - Page ID
   * @throws {AppError} If page not found
   */
  async deletePage(id) {
    // Verify page exists
    await this.getPageById(id);

    await query('DELETE FROM pages WHERE id = ?', [id]);
  }
}

export default new PageService();
