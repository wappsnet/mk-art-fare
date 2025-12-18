import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { productFieldController } from '../controllers/productFieldController.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Field group assignments (require authentication for write operations)
router.post(
  '/:id/field-groups',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(productFieldController.assignFieldGroup)
);

router.delete(
  '/:id/field-groups/:groupId',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(productFieldController.unassignFieldGroup)
);

router.get('/:id/field-groups', asyncHandler(productFieldController.getProductFieldGroups));

// Field values
router.get('/:id/fields', asyncHandler(productFieldController.getProductFieldValues));

router.post(
  '/:id/fields',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(productFieldController.batchUpdateFieldValues)
);

router.patch(
  '/:id/fields/:fieldId',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(productFieldController.updateFieldValue)
);

router.delete(
  '/:id/fields/:fieldId',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(productFieldController.deleteFieldValue)
);

export default router;
