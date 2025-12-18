import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { fieldGroupController } from '../controllers/fieldGroupController.js';
import { UserRole } from '../types/index.js';

const router = Router();

// All routes require authentication and artist/admin role
router.use(authenticate);
router.use(authorize(UserRole.ARTIST, UserRole.ADMIN));

// Field Groups
router.post('/', asyncHandler(fieldGroupController.createFieldGroup));
router.get('/', asyncHandler(fieldGroupController.getFieldGroups));
router.get('/:id', asyncHandler(fieldGroupController.getFieldGroupById));
router.patch('/:id', asyncHandler(fieldGroupController.updateFieldGroup));
router.delete('/:id', asyncHandler(fieldGroupController.deleteFieldGroup));

// Field Definitions
router.post('/:id/fields', asyncHandler(fieldGroupController.createFieldDefinition));
router.patch('/:groupId/fields/:fieldId', asyncHandler(fieldGroupController.updateFieldDefinition));
router.delete('/:groupId/fields/:fieldId', asyncHandler(fieldGroupController.deleteFieldDefinition));
router.put('/:id/fields/reorder', asyncHandler(fieldGroupController.reorderFields));

export default router;
