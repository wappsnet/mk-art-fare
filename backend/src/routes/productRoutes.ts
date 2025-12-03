import { Router } from 'express';
import { query } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AuthRequest, UserRole } from '../types';
import { AppError } from '../middleware/errorHandler';
import { generateSlug, getPaginationParams } from '../utils/helpers';

const router = Router();

// Get all products (public)
router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query.page as string, req.query.limit as string);
  const { organizationId, categoryId, search } = req.query;

  let queryStr = 'SELECT p.*, o.name as organization_name, o.slug as organization_slug FROM products p LEFT JOIN organizations o ON p.organization_id = o.id WHERE p.is_active = TRUE';
  const params: any[] = [];

  if (organizationId) {
    queryStr += ' AND p.organization_id = ?';
    params.push(organizationId);
  }
  if (categoryId) {
    queryStr += ' AND p.category_id = ?';
    params.push(categoryId);
  }
  if (search) {
    queryStr += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  queryStr += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const products: any = await query(queryStr, params);

  let countQuery = 'SELECT COUNT(*) as total FROM products WHERE is_active = TRUE';
  const countParams: any[] = [];
  if (organizationId) {
    countQuery += ' AND organization_id = ?';
    countParams.push(organizationId);
  }
  if (categoryId) {
    countQuery += ' AND category_id = ?';
    countParams.push(categoryId);
  }

  const countResult: any = await query(countQuery, countParams);
  sendPaginated(res, products, page, limit, countResult[0].total);
}));

// Get product by slug
router.get('/:slug', asyncHandler(async (req, res) => {
  const results: any = await query(
    `SELECT p.*, o.name as organization_name, o.slug as organization_slug
     FROM products p
     LEFT JOIN organizations o ON p.organization_id = o.id
     WHERE p.slug = ? AND p.is_active = TRUE`,
    [req.params.slug]
  );

  if (results.length === 0) {
    throw new AppError('Product not found', 404);
  }

  const images: any = await query(
    'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order',
    [results[0].id]
  );

  sendSuccess(res, { ...results[0], images });
}));

// Create product (artists only)
router.post('/', authenticate, authorize(UserRole.ARTIST, UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res) => {
  const { organizationId, categoryId, name, description, price, compareAtPrice, stockQuantity, sku } = req.body;

  const org: any = await query('SELECT * FROM organizations WHERE id = ? AND owner_id = ?', [organizationId, req.user!.userId]);
  if (org.length === 0) {
    throw new AppError('Organization not found or not authorized', 403);
  }

  const slug = generateSlug(name);
  const result: any = await query(
    `INSERT INTO products (organization_id, category_id, name, slug, description, price, compare_at_price, stock_quantity, sku)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [organizationId, categoryId || null, name, slug, description || null, price, compareAtPrice || null, stockQuantity || 0, sku || null]
  );

  const product: any = await query('SELECT * FROM products WHERE id = ?', [result.insertId]);
  sendSuccess(res, product[0], 'Product created successfully', 201);
}));

// Update product
router.patch('/:id', authenticate, authorize(UserRole.ARTIST, UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res) => {
  const productId = parseInt(req.params.id);
  const product: any = await query('SELECT p.*, o.owner_id FROM products p LEFT JOIN organizations o ON p.organization_id = o.id WHERE p.id = ?', [productId]);

  if (product.length === 0) {
    throw new AppError('Product not found', 404);
  }
  if (product[0].owner_id !== req.user!.userId) {
    throw new AppError('Not authorized', 403);
  }

  const updates: string[] = [];
  const values: any[] = [];
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

  const updated: any = await query('SELECT * FROM products WHERE id = ?', [productId]);
  sendSuccess(res, updated[0], 'Product updated successfully');
}));

// Delete product
router.delete('/:id', authenticate, authorize(UserRole.ARTIST, UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res) => {
  const productId = parseInt(req.params.id);
  const product: any = await query('SELECT p.*, o.owner_id FROM products p LEFT JOIN organizations o ON p.organization_id = o.id WHERE p.id = ?', [productId]);

  if (product.length === 0) {
    throw new AppError('Product not found', 404);
  }
  if (product[0].owner_id !== req.user!.userId) {
    throw new AppError('Not authorized', 403);
  }

  await query('DELETE FROM products WHERE id = ?', [productId]);
  sendSuccess(res, null, 'Product deleted successfully');
}));

export default router;
