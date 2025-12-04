import { Router } from 'express';
import { categoryController } from '../controllers/categoryController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Public routes
router.get(
  '/global',
  asyncHandler(categoryController.getGlobalCategories.bind(categoryController))
);

router.get(
  '/organization/:organizationId',
  asyncHandler(categoryController.getOrganizationCategories.bind(categoryController))
);

router.get(
  '/organization/:organizationId/shop',
  asyncHandler(categoryController.getShopCategories.bind(categoryController))
);

router.get('/:id', asyncHandler(categoryController.getCategory.bind(categoryController)));

// Protected routes
router.post(
  '/',
  authenticate,
  asyncHandler(categoryController.createCategory.bind(categoryController))
);

router.patch(
  '/:id',
  authenticate,
  asyncHandler(categoryController.updateCategory.bind(categoryController))
);

router.delete(
  '/:id',
  authenticate,
  asyncHandler(categoryController.deleteCategory.bind(categoryController))
);

export default router;
