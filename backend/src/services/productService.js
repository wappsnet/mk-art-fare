import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateSlug, transformImageUrls, getPaginationParams } from '../utils/helpers.js';
import { buildProductQuery, buildProductCountQuery } from '../utils/productQueryBuilder.js';
import ownershipService from './ownershipService.js';
import { subscriptionService } from './subscriptionService.js';
import { ensureFound } from '../utils/validators.js';

/**
 * Product Service
 * Handles all product and product image operations
 * Extracts business logic from productRoutes.js (520 lines → ~150 lines)
 */

class ProductService {
  // ==================== PRODUCT CRUD ====================

  /**
   * Get products with filtering and pagination
   *
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination params
   * @returns {Promise<Object>} { products, total, page, limit }
   */
  async getProducts(filters = {}, pagination = {}) {
    const { page, limit, offset } = getPaginationParams(pagination.page, pagination.limit);

    // Ensure limit and offset are valid integers
    const validLimit = Math.floor(Number(limit)) || 10;
    const validOffset = Math.floor(Number(offset)) || 0;

    // Build product query using helper functions
    const { queryStr, params } = await buildProductQuery(filters);

    // Execute main query with pagination
    const finalQuery = `${queryStr} ORDER BY p.created_at DESC LIMIT ${validLimit} OFFSET ${validOffset}`;
    let products = await query(finalQuery, params);

    // Fetch and transform images for each product
    for (const product of products) {
      const images = await query(
        'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order',
        [product.id]
      );
      product.images = transformImageUrls(images, 'url', 'products');
    }

    // Transform product image URLs
    products = products.map((product) =>
      transformImageUrls(product, 'featured_image_url', 'products')
    );

    // Get total count
    const { queryStr: countQuery, params: countParams } = await buildProductCountQuery(filters);
    const countResult = await query(countQuery, countParams);

    return {
      products,
      total: countResult[0].total,
      page,
      limit,
    };
  }

  /**
   * Get product by slug (public)
   *
   * @param {string} slug - Product slug
   * @returns {Promise<Object>} Product with images
   * @throws {AppError} If product not found
   */
  async getProductBySlug(slug) {
    const results = await query(
      `SELECT p.*, o.name as organization_name, o.slug as organization_slug
       FROM products p
       LEFT JOIN organizations o ON p.organization_id = o.id
       WHERE p.slug = ? AND p.is_active = TRUE`,
      [slug]
    );

    ensureFound(results, 'Product');

    let images = await query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [results[0].id]
    );

    // Transform image URLs to full URLs
    images = transformImageUrls(images, 'url', 'products');
    const product = transformImageUrls(results[0], 'featured_image_url', 'products');

    return { ...product, images };
  }

  /**
   * Get filter fields for product filtering (public)
   *
   * @returns {Promise<Array>} Array of filterable field definitions
   */
  async getFilterFields() {
    const filterableTypes = ['text', 'select', 'radio', 'number', 'toggle', 'color', 'date'];

    const fields = await query(
      `SELECT DISTINCT fd.id, fd.name, fd.label, fd.field_type, fd.options, fd.field_group_id,
              fg.name as group_name
       FROM field_definitions fd
       INNER JOIN field_groups fg ON fd.field_group_id = fg.id
       INNER JOIN product_field_group_assignments pfga ON fg.id = pfga.field_group_id
       WHERE fd.field_type IN (${filterableTypes.map(() => '?').join(',')})
         AND fg.is_active = TRUE
       GROUP BY fd.id, fg.name, fd.sort_order
       HAVING COUNT(DISTINCT pfga.product_id) >= 1
       ORDER BY COUNT(DISTINCT pfga.product_id) DESC, fg.name, fd.sort_order
       LIMIT 20`,
      filterableTypes
    );

    // Parse JSON options for select/radio fields
    return fields.map((field) => {
      let parsedOptions = null;
      if (field.options) {
        try {
          parsedOptions = JSON.parse(field.options);
        } catch (error) {
          console.error('Failed to parse field options:', {
            fieldId: field.id,
            fieldName: field.name,
            error: error.message,
          });
        }
      }
      return {
        ...field,
        options: parsedOptions,
      };
    });
  }

  /**
   * Create a new product
   *
   * @param {number} organizationId - Organization ID
   * @param {number} userId - User ID (for ownership verification)
   * @param {Object} data - Product data
   * @returns {Promise<Object>} Created product
   * @throws {AppError} If not authorized or subscription limit reached
   */
  async createProduct(organizationId, userId, data) {
    const { categoryId, name, description, price, compareAtPrice, stockQuantity, sku } = data;

    // Verify organization ownership
    await ownershipService.verifyOrganizationOwnership(organizationId, userId);

    // Check subscription limits
    const canCreate = await subscriptionService.canCreateProduct(userId, organizationId);
    if (!canCreate.allowed) {
      throw new AppError(canCreate.reason, 403);
    }

    const slug = generateSlug(name);
    const result = await query(
      `INSERT INTO products (organization_id, category_id, name, slug, description, price, compare_at_price, stock_quantity, sku)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        organizationId,
        categoryId || null,
        name,
        slug,
        description || null,
        price,
        compareAtPrice || null,
        stockQuantity || 0,
        sku || null,
      ]
    );

    const product = await query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    return transformImageUrls(product[0], 'featured_image_url', 'products');
  }

  /**
   * Update a product
   *
   * @param {number} productId - Product ID
   * @param {number} userId - User ID (for ownership verification)
   * @param {Object} data - Updated product data
   * @returns {Promise<Object>} Updated product
   * @throws {AppError} If not authorized or product not found
   */
  async updateProduct(productId, userId, data) {
    // Verify ownership
    await ownershipService.verifyProductOwnership(productId, userId);

    // Import buildProductUpdateQuery locally to avoid circular dependency
    const { buildProductUpdateQuery } = await import('../utils/productQueryBuilder.js');
    const { updates, values } = buildProductUpdateQuery(data);

    if (updates.length > 0) {
      values.push(productId);
      await query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    const updated = await query('SELECT * FROM products WHERE id = ?', [productId]);
    return transformImageUrls(updated[0], 'featured_image_url', 'products');
  }

  /**
   * Delete a product
   *
   * @param {number} productId - Product ID
   * @param {number} userId - User ID (for ownership verification)
   * @returns {Promise<void>}
   * @throws {AppError} If not authorized or product not found
   */
  async deleteProduct(productId, userId) {
    // Verify ownership
    await ownershipService.verifyProductOwnership(productId, userId);

    await query('DELETE FROM products WHERE id = ?', [productId]);
  }

  // ==================== PRODUCT IMAGES ====================

  /**
   * Get all images for a product
   *
   * @param {number} productId - Product ID
   * @returns {Promise<Array>} Array of product images
   */
  async getProductImages(productId) {
    const images = await query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [productId]
    );

    return transformImageUrls(images, 'url', 'products');
  }

  /**
   * Add product image
   *
   * @param {number} productId - Product ID
   * @param {number} userId - User ID (for ownership verification)
   * @param {Object} imageData - Image data { url, alt_text, is_thumbnail }
   * @returns {Promise<Object>} Created image
   * @throws {AppError} If not authorized
   */
  async addProductImage(productId, userId, imageData) {
    const { url, alt_text, is_thumbnail } = imageData;

    // Verify ownership
    await ownershipService.verifyProductOwnership(productId, userId);

    // Get the highest sort_order
    const maxOrder = await query(
      'SELECT MAX(sort_order) as max_order FROM product_images WHERE product_id = ?',
      [productId]
    );
    const sortOrder = (maxOrder[0].max_order || -1) + 1;

    // If this is set as thumbnail, unset all other thumbnails
    if (is_thumbnail) {
      await query('UPDATE product_images SET is_thumbnail = FALSE WHERE product_id = ?', [
        productId,
      ]);
    }

    const result = await query(
      'INSERT INTO product_images (product_id, url, alt_text, sort_order, is_thumbnail) VALUES (?, ?, ?, ?, ?)',
      [productId, url, alt_text || null, sortOrder, is_thumbnail || false]
    );

    const image = await query('SELECT * FROM product_images WHERE id = ?', [result.insertId]);
    return transformImageUrls(image[0], 'url', 'products');
  }

  /**
   * Update product image
   *
   * @param {number} productId - Product ID
   * @param {number} imageId - Image ID
   * @param {number} userId - User ID (for ownership verification)
   * @param {Object} data - Updated image data
   * @returns {Promise<Object>} Updated image
   * @throws {AppError} If not authorized or image not found
   */
  async updateProductImage(productId, imageId, userId, data) {
    const { url, alt_text, sort_order, is_thumbnail } = data;

    // Verify ownership
    await ownershipService.verifyProductOwnership(productId, userId);

    const image = await query('SELECT * FROM product_images WHERE id = ? AND product_id = ?', [
      imageId,
      productId,
    ]);
    ensureFound(image, 'Image');

    // If setting as thumbnail, unset all other thumbnails
    if (is_thumbnail) {
      await query(
        'UPDATE product_images SET is_thumbnail = FALSE WHERE product_id = ? AND id != ?',
        [productId, imageId]
      );
    }

    const updates = [];
    const values = [];

    if (url !== undefined) {
      updates.push('url = ?');
      values.push(url);
    }
    if (alt_text !== undefined) {
      updates.push('alt_text = ?');
      values.push(alt_text);
    }
    if (sort_order !== undefined) {
      updates.push('sort_order = ?');
      values.push(sort_order);
    }
    if (is_thumbnail !== undefined) {
      updates.push('is_thumbnail = ?');
      values.push(is_thumbnail);
    }

    if (updates.length > 0) {
      values.push(imageId);
      await query(`UPDATE product_images SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    const updated = await query('SELECT * FROM product_images WHERE id = ?', [imageId]);
    return transformImageUrls(updated[0], 'url', 'products');
  }

  /**
   * Delete product image
   *
   * @param {number} productId - Product ID
   * @param {number} imageId - Image ID
   * @param {number} userId - User ID (for ownership verification)
   * @returns {Promise<void>}
   * @throws {AppError} If not authorized
   */
  async deleteProductImage(productId, imageId, userId) {
    // Verify ownership
    await ownershipService.verifyProductOwnership(productId, userId);

    await query('DELETE FROM product_images WHERE id = ? AND product_id = ?', [imageId, productId]);
  }

  /**
   * Reorder product images
   *
   * @param {number} productId - Product ID
   * @param {number} userId - User ID (for ownership verification)
   * @param {Array} imageOrders - Array of {id, sort_order}
   * @returns {Promise<Array>} Updated images
   * @throws {AppError} If not authorized
   */
  async reorderProductImages(productId, userId, imageOrders) {
    // Verify ownership
    await ownershipService.verifyProductOwnership(productId, userId);

    // Update sort orders for each image
    for (const { id, sort_order } of imageOrders) {
      await query('UPDATE product_images SET sort_order = ? WHERE id = ? AND product_id = ?', [
        sort_order,
        id,
        productId,
      ]);
    }

    const images = await query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [productId]
    );
    return transformImageUrls(images, 'url', 'products');
  }

  /**
   * Upload product images (handles file uploads)
   *
   * @param {number} productId - Product ID
   * @param {number} userId - User ID (for ownership verification)
   * @param {Array} files - Array of uploaded files
   * @param {Object} options - Upload options { is_thumbnail, alt_text }
   * @returns {Promise<Array|Object>} Created image(s)
   * @throws {AppError} If not authorized or no files
   */
  async uploadProductImages(productId, userId, files, options = {}) {
    const { is_thumbnail, alt_text: altPayload } = options;

    // Verify ownership
    await ownershipService.verifyProductOwnership(productId, userId);

    if (!files || files.length === 0) {
      throw new AppError('No file uploaded', 400);
    }

    // Get current max sort order once
    const maxOrder = await query(
      'SELECT MAX(sort_order) as max_order FROM product_images WHERE product_id = ?',
      [productId]
    );
    let nextOrder = (maxOrder[0].max_order || -1) + 1;

    // If request sets thumbnail, make the first uploaded image the thumbnail
    const firstIsThumbnail = is_thumbnail === 'true' || is_thumbnail === true;
    if (firstIsThumbnail) {
      await query('UPDATE product_images SET is_thumbnail = FALSE WHERE product_id = ?', [
        productId,
      ]);
    }

    const created = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      // Store only the filename without path or host
      const filename = f.filename;
      const isThumb = firstIsThumbnail && i === 0;
      let altForThis = null;
      if (Array.isArray(altPayload)) {
        altForThis = altPayload[i] ?? null;
      } else if (typeof altPayload === 'string') {
        altForThis = altPayload || null;
      }

      const result = await query(
        'INSERT INTO product_images (product_id, url, alt_text, sort_order, is_thumbnail) VALUES (?, ?, ?, ?, ?)',
        [productId, filename, altForThis, nextOrder++, isThumb]
      );

      const rows = await query('SELECT * FROM product_images WHERE id = ?', [result.insertId]);
      created.push(rows[0]);
    }

    // Transform image URLs to full URLs for response
    const transformedImages = transformImageUrls(created, 'url', 'products');
    return transformedImages.length === 1 ? transformedImages[0] : transformedImages;
  }
}

export default new ProductService();
