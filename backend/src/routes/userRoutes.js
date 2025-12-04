import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Profile management
router.patch(
  '/profile',
  authenticate,
  asyncHandler(userController.updateProfile.bind(userController))
);

// Address management
router.get(
  '/addresses',
  authenticate,
  asyncHandler(userController.getAddresses.bind(userController))
);

router.post(
  '/addresses',
  authenticate,
  asyncHandler(userController.addAddress.bind(userController))
);

router.patch(
  '/addresses/:id',
  authenticate,
  asyncHandler(userController.updateAddress.bind(userController))
);

router.delete(
  '/addresses/:id',
  authenticate,
  asyncHandler(userController.deleteAddress.bind(userController))
);

// Admin routes
router.get(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(userController.getAllUsers.bind(userController))
);

router.patch(
  '/:id/role',
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(userController.updateUserRole.bind(userController))
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(userController.toggleUserStatus.bind(userController))
);

export default router;
