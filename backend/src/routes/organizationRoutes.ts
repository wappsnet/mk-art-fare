import { Router } from 'express';
import { organizationController } from '../controllers/organizationController';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../types';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(organizationController.createOrganization.bind(organizationController))
);

router.get(
  '/my',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(organizationController.getMyOrganizations.bind(organizationController))
);

router.get(
  '/',
  asyncHandler(organizationController.getAllOrganizations.bind(organizationController))
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
