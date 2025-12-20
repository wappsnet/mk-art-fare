import { subscriptionService } from '../services/subscriptionService.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';

export class SubscriptionController {
  /**
   * Get all available subscription plans
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getPlans(req, res, next) {
    try {
      const plans = await subscriptionService.getAllPlans();
      sendSuccess(res, plans, 'Subscription plans retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's subscription
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getCurrentSubscription(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      let subscription = await subscriptionService.getUserSubscription(req.user.userId);

      // If no subscription exists, create default Basic subscription
      if (!subscription) {
        subscription = await subscriptionService.createDefaultSubscription(req.user.userId);
      }

      const usageStats = await subscriptionService.getUsageStats(req.user.userId);

      sendSuccess(
        res,
        { subscription, usage: usageStats },
        'Subscription retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upgrade user subscription to Pro plan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async upgradeSubscription(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const subscription = await subscriptionService.upgradeSubscription(req.user.userId);
      const usageStats = await subscriptionService.getUsageStats(req.user.userId);

      sendSuccess(
        res,
        { subscription, usage: usageStats },
        'Successfully upgraded to Pro plan',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Downgrade user subscription to Basic plan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async downgradeSubscription(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const subscription = await subscriptionService.downgradeSubscription(req.user.userId);
      const usageStats = await subscriptionService.getUsageStats(req.user.userId);

      sendSuccess(
        res,
        { subscription, usage: usageStats },
        'Successfully downgraded to Basic plan',
        200
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subscription change history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getSubscriptionHistory(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const history = await subscriptionService.getSubscriptionHistory(req.user.userId);
      sendSuccess(res, history, 'Subscription history retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionController = new SubscriptionController();
