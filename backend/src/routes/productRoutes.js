import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { sendSuccess } from '../utils/response.js';
import { UserRole } from '../types/index.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { upload } from '../config/multer.js';
import productService from '../services/productService.js';

const router = Router();

// Get popular field definitions for filtering (public)
router.get(
  '/filter-fields',
  asyncHandler(async (req, res) => {
    const fields = await productService.getFilterFields();
    sendSuccess(res, fields);
  })
);

// Get all products (public)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { organizationId, category, search, minPrice, maxPrice, customFields } = req.query;
    const filters = { organizationId, category, search, minPrice, maxPrice, customFields };
    const pagination = { page: req.query.page, limit: req.query.limit };

    const responseData = await productService.getProducts(filters, pagination);

    sendSuccess(res, responseData);
  })
);

// Get product by slug
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const product = await productService.getProductBySlug(req.params.slug);
    sendSuccess(res, product);
  })
);

// Create product (artists only)
router.post(
  '/',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const product = await productService.createProduct(
      req.body.organizationId,
      req.user.userId,
      req.body
    );
    sendSuccess(res, product, 'Product created successfully', 201);
  })
);

// Update product
router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const productId = Number.parseInt(req.params.id);
    const updated = await productService.updateProduct(productId, req.user.userId, req.body);
    sendSuccess(res, updated, 'Product updated successfully');
  })
);

// Delete product
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const productId = Number.parseInt(req.params.id);
    await productService.deleteProduct(productId, req.user.userId);
    sendSuccess(res, null, 'Product deleted successfully');
  })
);

// Add product image
router.post(
  '/:id/images',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const productId = Number.parseInt(req.params.id);
    const image = await productService.addProductImage(productId, req.user.userId, req.body);
    sendSuccess(res, image, 'Image added successfully', 201);
  })
);

// Update product image
router.patch(
  '/:productId/images/:imageId',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const productId = Number.parseInt(req.params.productId);
    const imageId = Number.parseInt(req.params.imageId);
    const updated = await productService.updateProductImage(productId, imageId, req.user.userId, req.body);
    sendSuccess(res, updated, 'Image updated successfully');
  })
);

// Delete product image
router.delete(
  '/:productId/images/:imageId',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const productId = Number.parseInt(req.params.productId);
    const imageId = Number.parseInt(req.params.imageId);
    await productService.deleteProductImage(productId, imageId, req.user.userId);
    sendSuccess(res, null, 'Image deleted successfully');
  })
);

// Reorder product images
router.put(
  '/:id/images/reorder',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const productId = Number.parseInt(req.params.id);
    const images = await productService.reorderProductImages(productId, req.user.userId, req.body.imageOrders);
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
    const productId = Number.parseInt(req.params.id);

    const files = [
      ...(req.files && req.files.image ? req.files.image : []),
      ...(req.files && req.files.images ? req.files.images : []),
    ];

    const options = {
      is_thumbnail: req.body.is_thumbnail,
      alt_text: req.body.alt_text,
    };

    const result = await productService.uploadProductImages(productId, req.user.userId, files, options);
    sendSuccess(res, result, 'Image(s) uploaded successfully', 201);
  })
);

export default router;
