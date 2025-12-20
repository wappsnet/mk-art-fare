import { query, getConnection } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export class SubscriptionService {
  /**
   * Get all available subscription plans
   * @returns {Promise<Array>} Array of subscription plans
   */
  async getAllPlans() {
    const plans = await query(
      'SELECT * FROM subscription_plans WHERE is_active = TRUE ORDER BY price ASC'
    );

    return plans.map((plan) => ({
      ...plan,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features || '[]') : (plan.features || []),
    }));
  }

  /**
   * Get user's current active subscription
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} User subscription or null
   */
  async getUserSubscription(userId) {
    const results = await query(
      `SELECT us.*, sp.name as plan_name, sp.slug as plan_slug, sp.price,
              sp.max_organizations, sp.max_products, sp.features
       FROM user_subscriptions us
       JOIN subscription_plans sp ON us.plan_id = sp.id
       WHERE us.user_id = ? AND us.status = 'active'
       ORDER BY us.created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (results.length === 0) {
      return null;
    }

    const subscription = results[0];
    return {
      ...subscription,
      features: typeof subscription.features === 'string' ? JSON.parse(subscription.features || '[]') : (subscription.features || []),
    };
  }

  /**
   * Create default Basic subscription for new user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Created subscription
   */
  async createDefaultSubscription(userId) {
    const basicPlan = await query(
      "SELECT id FROM subscription_plans WHERE slug = 'basic' LIMIT 1"
    );

    if (basicPlan.length === 0) {
      throw new AppError('Basic plan not found', 500);
    }

    const planId = basicPlan[0].id;

    await query(
      `INSERT INTO user_subscriptions (user_id, plan_id, status)
       VALUES (?, ?, 'active')`,
      [userId, planId]
    );

    await query(
      `INSERT INTO subscription_history (user_id, to_plan_id, reason)
       VALUES (?, ?, 'initial')`,
      [userId, planId]
    );

    return await this.getUserSubscription(userId);
  }

  /**
   * Check if user can create a new organization
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Object with allowed flag and reason
   */
  async canCreateOrganization(userId) {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      return { allowed: false, reason: 'No active subscription' };
    }

    const currentCount = await query(
      'SELECT COUNT(*) as count FROM organizations WHERE owner_id = ? AND is_active = TRUE',
      [userId]
    );

    const count = currentCount[0].count;
    const maxOrgs = subscription.max_organizations;

    if (maxOrgs === -1) {
      return { allowed: true };
    }

    if (count >= maxOrgs) {
      return {
        allowed: false,
        reason: `Your ${subscription.plan_name} plan allows ${maxOrgs} shop(s). Upgrade to Pro for unlimited shops.`,
        current: count,
        max: maxOrgs,
      };
    }

    return { allowed: true, current: count, max: maxOrgs };
  }

  /**
   * Check if user can create a new product in an organization
   * @param {number} userId - User ID
   * @param {number} organizationId - Organization ID
   * @returns {Promise<Object>} Object with allowed flag and reason
   */
  async canCreateProduct(userId, organizationId) {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      return { allowed: false, reason: 'No active subscription' };
    }

    // Verify ownership
    const org = await query(
      'SELECT id FROM organizations WHERE id = ? AND owner_id = ?',
      [organizationId, userId]
    );

    if (org.length === 0) {
      return { allowed: false, reason: 'Organization not found' };
    }

    const currentCount = await query(
      'SELECT COUNT(*) as count FROM products WHERE organization_id = ? AND is_active = TRUE',
      [organizationId]
    );

    const count = currentCount[0].count;
    const maxProducts = subscription.max_products;

    if (maxProducts === -1) {
      return { allowed: true };
    }

    if (count >= maxProducts) {
      return {
        allowed: false,
        reason: `Your ${subscription.plan_name} plan allows ${maxProducts} product(s) per shop. Upgrade to Pro for unlimited products.`,
        current: count,
        max: maxProducts,
      };
    }

    return { allowed: true, current: count, max: maxProducts };
  }

  /**
   * Upgrade user subscription to Pro plan
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated subscription
   */
  async upgradeSubscription(userId) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // Get current subscription
      const currentSub = await this.getUserSubscription(userId);
      if (!currentSub) {
        throw new AppError('No active subscription found', 404);
      }

      // Get Pro plan
      const proPlan = await query(
        "SELECT id FROM subscription_plans WHERE slug = 'pro' LIMIT 1"
      );

      if (proPlan.length === 0) {
        throw new AppError('Pro plan not found', 500);
      }

      const proPlanId = proPlan[0].id;

      if (currentSub.plan_id === proPlanId) {
        throw new AppError('Already on Pro plan', 400);
      }

      // Cancel current subscription
      await connection.execute(
        `UPDATE user_subscriptions SET status = 'cancelled', cancelled_at = NOW()
         WHERE user_id = ? AND status = 'active'`,
        [userId]
      );

      // Create new Pro subscription
      await connection.execute(
        `INSERT INTO user_subscriptions (user_id, plan_id, status)
         VALUES (?, ?, 'active')`,
        [userId, proPlanId]
      );

      // Record history
      await connection.execute(
        `INSERT INTO subscription_history (user_id, from_plan_id, to_plan_id, reason)
         VALUES (?, ?, ?, 'upgrade')`,
        [userId, currentSub.plan_id, proPlanId]
      );

      await connection.commit();

      return await this.getUserSubscription(userId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Downgrade user subscription to Basic plan
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Updated subscription
   */
  async downgradeSubscription(userId) {
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // Get current subscription
      const currentSub = await this.getUserSubscription(userId);
      if (!currentSub) {
        throw new AppError('No active subscription found', 404);
      }

      // Get Basic plan
      const basicPlan = await query(
        "SELECT * FROM subscription_plans WHERE slug = 'basic' LIMIT 1"
      );

      if (basicPlan.length === 0) {
        throw new AppError('Basic plan not found', 500);
      }

      const basicPlanId = basicPlan[0].id;
      const plan = basicPlan[0];

      if (currentSub.plan_id === basicPlanId) {
        throw new AppError('Already on Basic plan', 400);
      }

      // Check if user exceeds basic plan limits
      const orgCount = await connection.execute(
        'SELECT COUNT(*) as count FROM organizations WHERE owner_id = ? AND is_active = TRUE',
        [userId]
      );

      if (orgCount[0][0].count > plan.max_organizations) {
        throw new AppError(
          `You have ${orgCount[0][0].count} shop(s), but Basic plan allows only ${plan.max_organizations}. Please delete extra shops before downgrading.`,
          400
        );
      }

      // Check products count across all organizations
      const productCount = await connection.execute(
        `SELECT COUNT(*) as count FROM products p
         JOIN organizations o ON p.organization_id = o.id
         WHERE o.owner_id = ? AND p.is_active = TRUE`,
        [userId]
      );

      if (productCount[0][0].count > plan.max_products) {
        throw new AppError(
          `You have ${productCount[0][0].count} product(s), but Basic plan allows only ${plan.max_products}. Please delete extra products before downgrading.`,
          400
        );
      }

      // Cancel current subscription
      await connection.execute(
        `UPDATE user_subscriptions SET status = 'cancelled', cancelled_at = NOW()
         WHERE user_id = ? AND status = 'active'`,
        [userId]
      );

      // Create new Basic subscription
      await connection.execute(
        `INSERT INTO user_subscriptions (user_id, plan_id, status)
         VALUES (?, ?, 'active')`,
        [userId, basicPlanId]
      );

      // Record history
      await connection.execute(
        `INSERT INTO subscription_history (user_id, from_plan_id, to_plan_id, reason)
         VALUES (?, ?, ?, 'downgrade')`,
        [userId, currentSub.plan_id, basicPlanId]
      );

      await connection.commit();

      return await this.getUserSubscription(userId);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get subscription change history for user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Subscription history
   */
  async getSubscriptionHistory(userId) {
    const history = await query(
      `SELECT sh.*,
              fp.name as from_plan_name, fp.slug as from_plan_slug,
              tp.name as to_plan_name, tp.slug as to_plan_slug
       FROM subscription_history sh
       LEFT JOIN subscription_plans fp ON sh.from_plan_id = fp.id
       JOIN subscription_plans tp ON sh.to_plan_id = tp.id
       WHERE sh.user_id = ?
       ORDER BY sh.changed_at DESC`,
      [userId]
    );

    return history;
  }

  /**
   * Get usage statistics for user
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Usage stats
   */
  async getUsageStats(userId) {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) {
      return null;
    }

    const orgCount = await query(
      'SELECT COUNT(*) as count FROM organizations WHERE owner_id = ? AND is_active = TRUE',
      [userId]
    );

    const productCount = await query(
      `SELECT COUNT(*) as count FROM products p
       JOIN organizations o ON p.organization_id = o.id
       WHERE o.owner_id = ? AND p.is_active = TRUE`,
      [userId]
    );

    return {
      organizations: {
        current: orgCount[0].count,
        max: subscription.max_organizations,
        unlimited: subscription.max_organizations === -1,
      },
      products: {
        current: productCount[0].count,
        max: subscription.max_products,
        unlimited: subscription.max_products === -1,
      },
    };
  }
}

export const subscriptionService = new SubscriptionService();
