import { Router } from 'express';
import { organizationController } from '../controllers/organizationController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { UserRole } from '../types/index.js';

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

router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(organizationController.deleteOrganization.bind(organizationController))
);

export default router;
