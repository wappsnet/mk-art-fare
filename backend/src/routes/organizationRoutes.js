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
    const orgId = parseInt(req.params.id);

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
    const orgId = parseInt(req.params.id);

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
