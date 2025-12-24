import { Router } from 'express';
import { organizationController } from '../controllers/organizationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { UserRole } from '../types/index.js';
import { organizationUpload } from '../config/organizationMulter.js';
import { sendSuccess } from '../utils/response.js';
import { query } from '../config/database.js';
import { toFullImageUrl } from '../utils/helpers.js';

const router = Router();

router.post(
  '/',
  authenticate,
  asyncHandler(organizationController.createOrganization.bind(organizationController))
);

router.get(
  '/my',
  authenticate,
  asyncHandler(organizationController.getMyOrganizations.bind(organizationController))
);

router.get(
  '/',
  asyncHandler(organizationController.getAllOrganizations.bind(organizationController))
);

router.get(
  '/id/:id',
  asyncHandler(organizationController.getOrganizationById.bind(organizationController))
);

// Get products by organization ID (for shop management)
router.get(
  '/id/:id/products',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const orgId = Number.parseInt(req.params.id);

    // Verify organization ownership
    const org = await query('SELECT * FROM organizations WHERE id = ? AND owner_id = ?', [
      orgId,
      req.user.userId,
    ]);
    if (org.length === 0 && req.user.role !== UserRole.ADMIN) {
      throw new AppError('Organization not found', 404);
    }

    const products = await query(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.organization_id = ?
       ORDER BY p.created_at DESC`,
      [orgId]
    );

    // Get images for each product
    for (const product of products) {
      const images = await query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order', [
        product.id,
      ]);
      // Transform image URLs - database column is 'url', transform to 'image_url' for frontend
      product.images = images.map(img => ({
        ...img,
        url: toFullImageUrl(img.url, 'products'),
        image_url: toFullImageUrl(img.url, 'products')
      }));
    }

    sendSuccess(res, products);
  })
);

router.get(
  '/:slug/products',
  asyncHandler(organizationController.getOrganizationProducts.bind(organizationController))
);

router.get(
  '/:slug',
  asyncHandler(organizationController.getOrganization.bind(organizationController))
);

router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(organizationController.updateOrganization.bind(organizationController))
);

router.patch(
  '/:id/theme',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(organizationController.updateTheme.bind(organizationController))
);

// Upload logo
router.post(
  '/:id/upload-logo',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  organizationUpload.single('logo'),
  asyncHandler(async (req, res) => {
    const orgId = Number.parseInt(req.params.id);

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Store only the filename in the database
    const filename = req.file.filename;

    await query('UPDATE organizations SET logo_url = ? WHERE id = ?', [filename, orgId]);

    // Return full URL in response
    sendSuccess(res, { logo_url: toFullImageUrl(filename, 'organizations') }, 'Logo uploaded successfully');
  })
);

// Upload banner
router.post(
  '/:id/upload-banner',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  organizationUpload.single('banner'),
  asyncHandler(async (req, res) => {
    const orgId = Number.parseInt(req.params.id);

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Store only the filename in the database
    const filename = req.file.filename;

    await query('UPDATE organizations SET banner_url = ? WHERE id = ?', [filename, orgId]);

    // Return full URL in response
    sendSuccess(res, { banner_url: toFullImageUrl(filename, 'organizations') }, 'Banner uploaded successfully');
  })
);

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(organizationController.deleteOrganization.bind(organizationController))
);

export default router;
