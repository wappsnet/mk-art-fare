import { Router } from 'express';
import { subscriptionController } from '../controllers/subscriptionController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Get all available plans (public endpoint)
router.get(
  '/plans',
  asyncHandler(subscriptionController.getPlans.bind(subscriptionController))
);

// Get current user's subscription (authenticated)
router.get(
  '/current',
  authenticate,
  asyncHandler(subscriptionController.getCurrentSubscription.bind(subscriptionController))
);

// Upgrade to Pro plan (authenticated)
router.post(
  '/upgrade',
  authenticate,
  asyncHandler(subscriptionController.upgradeSubscription.bind(subscriptionController))
);

// Downgrade to Basic plan (authenticated)
router.post(
  '/downgrade',
  authenticate,
  asyncHandler(subscriptionController.downgradeSubscription.bind(subscriptionController))
);

// Get subscription history (authenticated)
router.get(
  '/history',
  authenticate,
  asyncHandler(subscriptionController.getSubscriptionHistory.bind(subscriptionController))
);

export default router;
