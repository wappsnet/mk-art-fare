import { Router } from 'express';
import { query } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { UserRole } from '../types/index.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { generateSlug, getPaginationParams, transformImageUrls } from '../utils/helpers.js';
import { upload } from '../config/multer.js';
import { config } from '../config/index.js';

const router = Router();

// Get all products (public)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query.page, req.query.limit);
    const { organizationId, category, search, minPrice, maxPrice } = req.query;

    // Ensure limit and offset are valid integers
    const validLimit = Math.floor(Number(limit)) || 10;
    const validOffset = Math.floor(Number(offset)) || 0;

    let queryStr =
      'SELECT p.*, o.name as organization_name, o.slug as organization_slug FROM products p LEFT JOIN organizations o ON p.organization_id = o.id WHERE p.is_active = TRUE';
    const params = [];

    if (organizationId) {
      queryStr += ' AND p.organization_id = ?';
      params.push(organizationId);
    }

    // Handle multiple categories (comma-separated)
    if (category) {
      const categories = category.split(',').map(c => c.trim()).filter(Boolean);
      if (categories.length > 0) {
        // Get category IDs from slugs
        const categoryPlaceholders = categories.map(() => '?').join(',');
        const categoryResults = await query(
          `SELECT id FROM categories WHERE slug IN (${categoryPlaceholders})`,
          categories
        );
        const categoryIds = categoryResults.map(c => c.id);

        if (categoryIds.length > 0) {
          const placeholders = categoryIds.map(() => '?').join(',');
          queryStr += ` AND p.category_id IN (${placeholders})`;
          params.push(...categoryIds);
        }
      }
    }

    if (search) {
      queryStr += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Price filtering
    if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
      queryStr += ' AND p.price >= ?';
      params.push(parseFloat(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
      queryStr += ' AND p.price <= ?';
      params.push(parseFloat(maxPrice));
    }

    queryStr += ` ORDER BY p.created_at DESC LIMIT ${validLimit} OFFSET ${validOffset}`;

    let products = await query(queryStr, params);

    // Fetch images for each product
    for (let product of products) {
      let images = await query(
        'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order',
        [product.id]
      );
      // Transform image URLs to full URLs
      product.images = transformImageUrls(images, 'url', 'products');
    }

    // Transform product image URLs to full URLs for response
    products = products.map(product => transformImageUrls(product, 'featured_image_url', 'products'));

    // Build count query with same filters
    let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE p.is_active = TRUE';
    const countParams = [];

    if (organizationId) {
      countQuery += ' AND p.organization_id = ?';
      countParams.push(organizationId);
    }

    // Handle multiple categories in count query
    if (category) {
      const categories = category.split(',').map(c => c.trim()).filter(Boolean);
      if (categories.length > 0) {
        const categoryPlaceholders = categories.map(() => '?').join(',');
        const categoryResults = await query(
          `SELECT id FROM categories WHERE slug IN (${categoryPlaceholders})`,
          categories
        );
        const categoryIds = categoryResults.map(c => c.id);

        if (categoryIds.length > 0) {
          const placeholders = categoryIds.map(() => '?').join(',');
          countQuery += ` AND p.category_id IN (${placeholders})`;
          countParams.push(...categoryIds);
        }
      }
    }

    if (search) {
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    // Price filtering in count query
    if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
      countQuery += ' AND p.price >= ?';
      countParams.push(parseFloat(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
      countQuery += ' AND p.price <= ?';
      countParams.push(parseFloat(maxPrice));
    }

    const countResult = await query(countQuery, countParams);

    // Format response to match frontend expectations
    const responseData = {
      products,
      total: countResult[0].total,
      page,
      limit
    };

    sendSuccess(res, responseData);
  })
);

// Get product by slug
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const results = await query(
      `SELECT p.*, o.name as organization_name, o.slug as organization_slug
     FROM products p
     LEFT JOIN organizations o ON p.organization_id = o.id
     WHERE p.slug = ? AND p.is_active = TRUE`,
      [req.params.slug]
    );

    if (results.length === 0) {
      throw new AppError('Product not found', 404);
    }

    let images = await query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [results[0].id]
    );

    // Transform image URLs to full URLs
    images = transformImageUrls(images, 'url', 'products');
    const product = transformImageUrls(results[0], 'featured_image_url', 'products');

    sendSuccess(res, { ...product, images });
  })
);

// Create product (artists only)
router.post(
  '/',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const {
      organizationId,
      categoryId,
      name,
      description,
      price,
      compareAtPrice,
      stockQuantity,
      sku,
    } = req.body;

    const org = await query('SELECT * FROM organizations WHERE id = ? AND owner_id = ?', [
      organizationId,
      req.user.userId,
    ]);
    if (org.length === 0) {
      throw new AppError('Organization not found or not authorized', 403);
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

    let product = await query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    product = transformImageUrls(product[0], 'featured_image_url', 'products');
    sendSuccess(res, product, 'Product created successfully', 201);
  })
);

// Update product
router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id);
    const product = await query(
      'SELECT p.*, o.owner_id FROM products p LEFT JOIN organizations o ON p.organization_id = o.id WHERE p.id = ?',
      [productId]
    );

    if (product.length === 0) {
      throw new AppError('Product not found', 404);
    }
    if (product[0].owner_id !== req.user.userId) {
      throw new AppError('Not authorized', 403);
    }

    const updates = [];
    const values = [];
    const { name, description, price, compareAtPrice, stockQuantity, sku, isActive } = req.body;

    if (name !== undefined) {
      updates.push('name = ?, slug = ?');
      values.push(name, generateSlug(name));
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (compareAtPrice !== undefined) {
      updates.push('compare_at_price = ?');
      values.push(compareAtPrice);
    }
    if (stockQuantity !== undefined) {
      updates.push('stock_quantity = ?');
      values.push(stockQuantity);
    }
    if (sku !== undefined) {
      updates.push('sku = ?');
      values.push(sku);
    }
    if (isActive !== undefined) {
      updates.push('is_active = ?');
      values.push(isActive);
    }

    if (updates.length > 0) {
      values.push(productId);
      await query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    let updated = await query('SELECT * FROM products WHERE id = ?', [productId]);
    updated = transformImageUrls(updated[0], 'featured_image_url', 'products');
    sendSuccess(res, updated, 'Product updated successfully');
  })
);

// Delete product
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id);
    const product = await query(
      'SELECT p.*, o.owner_id FROM products p LEFT JOIN organizations o ON p.organization_id = o.id WHERE p.id = ?',
      [productId]
    );

    if (product.length === 0) {
      throw new AppError('Product not found', 404);
    }
    if (product[0].owner_id !== req.user.userId) {
      throw new AppError('Not authorized', 403);
    }

    await query('DELETE FROM products WHERE id = ?', [productId]);
    sendSuccess(res, null, 'Product deleted successfully');
  })
);

// Add product image
router.post(
  '/:id/images',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id);
    const { url, alt_text, is_thumbnail } = req.body;

    const product = await query(
      'SELECT p.*, o.owner_id FROM products p LEFT JOIN organizations o ON p.organization_id = o.id WHERE p.id = ?',
      [productId]
    );

    if (product.length === 0) {
      throw new AppError('Product not found', 404);
    }
    if (product[0].owner_id !== req.user.userId) {
      throw new AppError('Not authorized', 403);
    }

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

    let image = await query('SELECT * FROM product_images WHERE id = ?', [result.insertId]);
    image = transformImageUrls(image[0], 'url', 'products');
    sendSuccess(res, image, 'Image added successfully', 201);
  })
);

// Update product image
router.patch(
  '/:productId/images/:imageId',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.productId);
    const imageId = parseInt(req.params.imageId);
    const { url, alt_text, sort_order, is_thumbnail } = req.body;

    const product = await query(
      'SELECT p.*, o.owner_id FROM products p LEFT JOIN organizations o ON p.organization_id = o.id WHERE p.id = ?',
      [productId]
    );

    if (product.length === 0) {
      throw new AppError('Product not found', 404);
    }
    if (product[0].owner_id !== req.user.userId) {
      throw new AppError('Not authorized', 403);
    }

    const image = await query('SELECT * FROM product_images WHERE id = ? AND product_id = ?', [
      imageId,
      productId,
    ]);
    if (image.length === 0) {
      throw new AppError('Image not found', 404);
    }

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

    let updated = await query('SELECT * FROM product_images WHERE id = ?', [imageId]);
    updated = transformImageUrls(updated[0], 'url', 'products');
    sendSuccess(res, updated, 'Image updated successfully');
  })
);

// Delete product image
router.delete(
  '/:productId/images/:imageId',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.productId);
    const imageId = parseInt(req.params.imageId);

    const product = await query(
      'SELECT p.*, o.owner_id FROM products p LEFT JOIN organizations o ON p.organization_id = o.id WHERE p.id = ?',
      [productId]
    );

    if (product.length === 0) {
      throw new AppError('Product not found', 404);
    }
    if (product[0].owner_id !== req.user.userId) {
      throw new AppError('Not authorized', 403);
    }

    await query('DELETE FROM product_images WHERE id = ? AND product_id = ?', [imageId, productId]);
    sendSuccess(res, null, 'Image deleted successfully');
  })
);

// Reorder product images
router.put(
  '/:id/images/reorder',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id);
    const { imageOrders } = req.body; // Array of {id, sort_order}

    const product = await query(
      'SELECT p.*, o.owner_id FROM products p LEFT JOIN organizations o ON p.organization_id = o.id WHERE p.id = ?',
      [productId]
    );

    if (product.length === 0) {
      throw new AppError('Product not found', 404);
    }
    if (product[0].owner_id !== req.user.userId) {
      throw new AppError('Not authorized', 403);
    }

    // Update sort orders for each image
    for (const { id, sort_order } of imageOrders) {
      await query('UPDATE product_images SET sort_order = ? WHERE id = ? AND product_id = ?', [
        sort_order,
        id,
        productId,
      ]);
    }

    let images = await query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [productId]
    );
    images = transformImageUrls(images, 'url', 'products');
    sendSuccess(res, images, 'Images reordered successfully');
  })
);

// Upload product image file
router.post(
  '/:id/images/upload',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.id);
    const { is_thumbnail } = req.body;
    const altPayload = req.body.alt_text; // string or string[]

    const product = await query(
      'SELECT p.*, o.owner_id FROM products p LEFT JOIN organizations o ON p.organization_id = o.id WHERE p.id = ?',
      [productId]
    );
    if (product.length === 0) {
      throw new AppError('Product not found', 404);
    }
    if (product[0].owner_id !== req.user.userId) {
      throw new AppError('Not authorized', 403);
    }

    const files = [
      ...(req.files && req.files.image ? req.files.image : []),
      ...(req.files && req.files.images ? req.files.images : []),
    ];

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
    sendSuccess(res, transformedImages.length === 1 ? transformedImages[0] : transformedImages, 'Image(s) uploaded successfully', 201);
  })
);

export default router;
