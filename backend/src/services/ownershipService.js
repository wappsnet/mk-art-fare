import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Ownership Service
 * Consolidates ownership verification logic to eliminate duplication
 * Replaces 15+ inline ownership checks across routes
 */

class OwnershipService {
  /**
   * Verify product ownership
   * Checks if user owns the organization that owns the product
   *
   * @param {number} productId - Product ID
   * @param {number} userId - User ID to verify
   * @param {boolean} throwError - Whether to throw error if not authorized
   * @returns {Promise<boolean>} True if user owns the product
   * @throws {AppError} If product not found or user not authorized (when throwError=true)
   */
  async verifyProductOwnership(productId, userId, throwError = true) {
    const result = await query(
      `SELECT p.*, o.owner_id
       FROM products p
       LEFT JOIN organizations o ON p.organization_id = o.id
       WHERE p.id = ?`,
      [productId]
    );

    if (result.length === 0) {
      if (throwError) {
        throw new AppError('Product not found', 404);
      }
      return false;
    }

    const isOwner = result[0].owner_id === userId;

    if (!isOwner && throwError) {
      throw new AppError('Not authorized to access this product', 403);
    }

    return isOwner;
  }

  /**
   * Verify organization ownership
   *
   * @param {number} organizationId - Organization ID
   * @param {number} userId - User ID to verify
   * @param {boolean} throwError - Whether to throw error if not authorized
   * @returns {Promise<boolean>} True if user owns the organization
   * @throws {AppError} If organization not found or user not authorized (when throwError=true)
   */
  async verifyOrganizationOwnership(organizationId, userId, throwError = true) {
    const result = await query('SELECT * FROM organizations WHERE id = ? AND owner_id = ?', [
      organizationId,
      userId,
    ]);

    if (result.length === 0) {
      if (throwError) {
        throw new AppError('Organization not found or not authorized', 403);
      }
      return false;
    }

    return true;
  }

  /**
   * Verify field group ownership
   * Field groups belong to organizations
   *
   * @param {number} fieldGroupId - Field group ID
   * @param {number} organizationId - Organization ID
   * @param {boolean} throwError - Whether to throw error if not authorized
   * @returns {Promise<boolean>} True if field group belongs to organization
   * @throws {AppError} If field group not found or doesn't belong to org (when throwError=true)
   */
  async verifyFieldGroupOwnership(fieldGroupId, organizationId, throwError = true) {
    const result = await query('SELECT * FROM field_groups WHERE id = ? AND organization_id = ?', [
      fieldGroupId,
      organizationId,
    ]);

    if (result.length === 0) {
      if (throwError) {
        throw new AppError('Field group not found or not authorized', 403);
      }
      return false;
    }

    return true;
  }

  /**
   * Verify blog post ownership
   *
   * @param {number} postId - Blog post ID
   * @param {number} userId - User ID to verify
   * @param {boolean} throwError - Whether to throw error if not authorized
   * @returns {Promise<boolean>} True if user owns the post
   * @throws {AppError} If post not found or user not authorized (when throwError=true)
   */
  async verifyBlogPostOwnership(postId, userId, throwError = true) {
    const result = await query('SELECT * FROM blog_posts WHERE id = ? AND author_id = ?', [
      postId,
      userId,
    ]);

    if (result.length === 0) {
      if (throwError) {
        throw new AppError('Blog post not found or not authorized', 403);
      }
      return false;
    }

    return true;
  }

  /**
   * Verify order ownership
   *
   * @param {number} orderId - Order ID
   * @param {number} userId - User ID to verify
   * @param {boolean} throwError - Whether to throw error if not authorized
   * @returns {Promise<boolean>} True if user owns the order
   * @throws {AppError} If order not found or user not authorized (when throwError=true)
   */
  async verifyOrderOwnership(orderId, userId, throwError = true) {
    const result = await query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [
      orderId,
      userId,
    ]);

    if (result.length === 0) {
      if (throwError) {
        throw new AppError('Order not found or not authorized', 403);
      }
      return false;
    }

    return true;
  }

  /**
   * Verify product image ownership (through product ownership)
   *
   * @param {number} imageId - Product image ID
   * @param {number} userId - User ID to verify
   * @param {boolean} throwError - Whether to throw error if not authorized
   * @returns {Promise<boolean>} True if user owns the image
   * @throws {AppError} If image not found or user not authorized (when throwError=true)
   */
  async verifyProductImageOwnership(imageId, userId, throwError = true) {
    const result = await query(
      `SELECT pi.*, p.id as product_id, o.owner_id
       FROM product_images pi
       LEFT JOIN products p ON pi.product_id = p.id
       LEFT JOIN organizations o ON p.organization_id = o.id
       WHERE pi.id = ?`,
      [imageId]
    );

    if (result.length === 0) {
      if (throwError) {
        throw new AppError('Image not found', 404);
      }
      return false;
    }

    const isOwner = result[0].owner_id === userId;

    if (!isOwner && throwError) {
      throw new AppError('Not authorized to access this image', 403);
    }

    return isOwner;
  }

  /**
   * Verify category ownership
   * Categories belong to organizations
   *
   * @param {number} categoryId - Category ID
   * @param {number} organizationId - Organization ID
   * @param {boolean} throwError - Whether to throw error if not authorized
   * @returns {Promise<boolean>} True if category belongs to organization
   * @throws {AppError} If category not found or doesn't belong to org (when throwError=true)
   */
  async verifyCategoryOwnership(categoryId, organizationId, throwError = true) {
    const result = await query('SELECT * FROM categories WHERE id = ? AND organization_id = ?', [
      categoryId,
      organizationId,
    ]);

    if (result.length === 0) {
      if (throwError) {
        throw new AppError('Category not found or not authorized', 403);
      }
      return false;
    }

    return true;
  }

  /**
   * Get product with owner info
   * Fetches product and returns it with ownership info
   *
   * @param {number} productId - Product ID
   * @returns {Promise<Object>} Product with owner_id
   * @throws {AppError} If product not found
   */
  async getProductWithOwner(productId) {
    const result = await query(
      `SELECT p.*, o.owner_id, o.name as organization_name, o.slug as organization_slug
       FROM products p
       LEFT JOIN organizations o ON p.organization_id = o.id
       WHERE p.id = ?`,
      [productId]
    );

    if (result.length === 0) {
      throw new AppError('Product not found', 404);
    }

    return result[0];
  }

  /**
   * Get organization with verification
   * Fetches organization and verifies ownership
   *
   * @param {number} organizationId - Organization ID
   * @param {number} userId - User ID to verify
   * @returns {Promise<Object>} Organization object
   * @throws {AppError} If organization not found or user not authorized
   */
  async getOrganizationWithVerification(organizationId, userId) {
    const result = await query('SELECT * FROM organizations WHERE id = ? AND owner_id = ?', [
      organizationId,
      userId,
    ]);

    if (result.length === 0) {
      throw new AppError('Organization not found or not authorized', 403);
    }

    return result[0];
  }

  /**
   * Verify resource ownership by type
   * Generic method that routes to specific verification methods
   *
   * @param {string} resourceType - Type of resource ('product', 'organization', 'post', etc.)
   * @param {number} resourceId - Resource ID
   * @param {number} userId - User ID to verify
   * @param {number} organizationId - Organization ID (for field groups, categories)
   * @returns {Promise<boolean>} True if user owns the resource
   */
  async verifyOwnership(resourceType, resourceId, userId, organizationId = null) {
    switch (resourceType) {
      case 'product':
        return this.verifyProductOwnership(resourceId, userId);
      case 'organization':
        return this.verifyOrganizationOwnership(resourceId, userId);
      case 'field_group':
        return this.verifyFieldGroupOwnership(resourceId, organizationId);
      case 'post':
        return this.verifyBlogPostOwnership(resourceId, userId);
      case 'order':
        return this.verifyOrderOwnership(resourceId, userId);
      case 'product_image':
        return this.verifyProductImageOwnership(resourceId, userId);
      case 'category':
        return this.verifyCategoryOwnership(resourceId, organizationId);
      default:
        throw new AppError(`Unknown resource type: ${resourceType}`, 400);
    }
  }

  /**
   * Batch verify ownership for multiple resources
   *
   * @param {Array<Object>} resources - Array of {type, id, userId, organizationId?}
   * @returns {Promise<Object>} Map of resource IDs to ownership status
   */
  async batchVerifyOwnership(resources) {
    const results = {};

    for (const resource of resources) {
      const { type, id, userId, organizationId } = resource;
      try {
        results[id] = await this.verifyOwnership(type, id, userId, organizationId);
      } catch {
        results[id] = false;
      }
    }

    return results;
  }
}

export default new OwnershipService();
