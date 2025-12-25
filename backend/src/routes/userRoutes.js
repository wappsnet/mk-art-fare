import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { UserRole } from '../types/index.js';
import { userUpload } from '../config/userMulter.js';
import { query } from '../config/database.js';
import { sendSuccess } from '../utils/response.js';
import { toFullImageUrl } from '../utils/helpers.js';

const router = Router();

// Profile management
router.patch(
  '/profile',
  authenticate,
  asyncHandler(userController.updateProfile.bind(userController))
);

// Upload avatar
router.post(
  '/avatar',
  authenticate,
  userUpload.single('avatar'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Store only the filename in the database
    const filename = req.file.filename;

    await query('UPDATE users SET avatar_url = ? WHERE id = ?', [filename, req.user.userId]);

    // Return full URL in response
    sendSuccess(
      res,
      { avatar_url: toFullImageUrl(filename, 'users') },
      'Avatar uploaded successfully'
    );
  })
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
