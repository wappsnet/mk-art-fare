import { subscriptionService } from '../services/subscriptionService.js';
import { sendSuccess } from '../utils/response.js';

export class SubscriptionController {
  /**
   * Get all available subscription plans
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPlans(req, res) {
    const plans = await subscriptionService.getAllPlans();
    sendSuccess(res, plans, 'Subscription plans retrieved successfully');
  }

  /**
   * Get current user's subscription
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCurrentSubscription(req, res) {
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
  }

  /**
   * Upgrade user subscription to Pro plan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async upgradeSubscription(req, res) {
    const subscription = await subscriptionService.upgradeSubscription(req.user.userId);
    const usageStats = await subscriptionService.getUsageStats(req.user.userId);

    sendSuccess(
      res,
      { subscription, usage: usageStats },
      'Successfully upgraded to Pro plan',
      200
    );
  }

  /**
   * Downgrade user subscription to Basic plan
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async downgradeSubscription(req, res) {
    const subscription = await subscriptionService.downgradeSubscription(req.user.userId);
    const usageStats = await subscriptionService.getUsageStats(req.user.userId);

    sendSuccess(
      res,
      { subscription, usage: usageStats },
      'Successfully downgraded to Basic plan',
      200
    );
  }

  /**
   * Get subscription change history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSubscriptionHistory(req, res) {
    const history = await subscriptionService.getSubscriptionHistory(req.user.userId);
    sendSuccess(res, history, 'Subscription history retrieved successfully');
  }
}

export const subscriptionController = new SubscriptionController();
