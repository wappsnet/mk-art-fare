import express from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { UserRole } from '../../types/index.js';
import {
  moderateOrganization,
  moderateProduct,
  moderateEvent,
} from '../../controllers/admin/moderationController.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// Organization moderation
router.patch('/organizations/:id/moderate', moderateOrganization);

// Product moderation
router.patch('/products/:id/moderate', moderateProduct);

// Event moderation
router.patch('/events/:id/moderate', moderateEvent);

export default router;
