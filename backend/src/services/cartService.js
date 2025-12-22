import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Cart Service
 * Handles cart operations and eliminates duplication in cart routes
 */

class CartService {
  /**
   * Get or create cart for user or guest session
   * Eliminates 4+ duplicated occurrences of this logic
   *
   * @param {number|null} userId - User ID (null for guests)
   * @param {string|null} sessionId - Session ID for guest users
   * @param {boolean} createIfNotExists - Whether to create cart if it doesn't exist
   * @returns {Promise<number|null>} Cart ID or null
   */
  async getOrCreateCart(userId = null, sessionId = null, createIfNotExists = true) {
    let cartId = null;

    if (userId) {
      // Authenticated user
      const cart = await query('SELECT * FROM carts WHERE user_id = ?', [userId]);
      cartId = cart.length > 0 ? cart[0].id : null;

      if (!cartId && createIfNotExists) {
        const result = await query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
        cartId = result.insertId;
      }
    } else if (sessionId) {
      // Guest user with session
      const cart = await query('SELECT * FROM carts WHERE session_id = ?', [sessionId]);
      cartId = cart.length > 0 ? cart[0].id : null;

      if (!cartId && createIfNotExists) {
        const result = await query('INSERT INTO carts (session_id) VALUES (?)', [sessionId]);
        cartId = result.insertId;
      }
    }

    return cartId;
  }

  /**
   * Get cart with items and calculated total
   *
   * @param {number|null} userId - User ID (null for guests)
   * @param {string|null} sessionId - Session ID for guest users
   * @returns {Promise<Object>} Cart object with items and total
   */
  async getCart({ userId = null, sessionId = null }) {
    const cartId = await this.getOrCreateCart(userId, sessionId, false);

    if (!cartId) {
      return { items: [], total: 0 };
    }

    const items = await this.getCartItems(cartId);
    const total = this.calculateCartTotal(items);

    return { id: cartId, items, total };
  }

  /**
   * Get cart items with product details
   *
   * @param {number} cartId - Cart ID
   * @returns {Promise<Array>} Array of cart items with product info
   */
  async getCartItems(cartId) {
    return await query(
      `SELECT ci.*, p.name, p.price, p.stock_quantity, p.slug,
              o.name as organization_name, o.slug as organization_slug
       FROM cart_items ci
       LEFT JOIN products p ON ci.product_id = p.id
       LEFT JOIN organizations o ON p.organization_id = o.id
       WHERE ci.cart_id = ?`,
      [cartId]
    );
  }

  /**
   * Add item to cart (or increment quantity if exists)
   *
   * @param {number|null} userId - User ID (null for guests)
   * @param {string|null} sessionId - Session ID for guest users
   * @param {number} productId - Product ID to add
   * @param {number} quantity - Quantity to add
   * @returns {Promise<void>}
   * @throws {AppError} If session ID is required but not provided
   */
  async addItemToCart({ userId = null, sessionId = null, productId, quantity }) {
    // Validate inputs
    if (!productId) {
      throw new AppError('Product ID is required', 400);
    }
    if (!quantity || quantity < 1) {
      throw new AppError('Valid quantity is required', 400);
    }

    // Get or create cart
    if (!userId && !sessionId) {
      throw new AppError('Session ID required for guest users', 400);
    }

    const cartId = await this.getOrCreateCart(userId, sessionId, true);

    // Check if item already exists in cart
    const existing = await query('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?', [
      cartId,
      productId,
    ]);

    if (existing.length > 0) {
      // Increment existing item quantity
      await query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?',
        [quantity, cartId, productId]
      );
    } else {
      // Add new item
      await query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [
        cartId,
        productId,
        quantity,
      ]);
    }
  }

  /**
   * Update cart item quantity
   *
   * @param {number|null} userId - User ID (null for guests)
   * @param {string|null} sessionId - Session ID for guest users
   * @param {number} productId - Product ID to update
   * @param {number} quantity - New quantity (0 to remove)
   * @returns {Promise<void>}
   * @throws {AppError} If cart not found
   */
  async updateCartItem({ userId = null, sessionId = null, productId, quantity }) {
    const cartId = await this.getOrCreateCart(userId, sessionId, false);

    if (!cartId) {
      throw new AppError('Cart not found', 404);
    }

    if (quantity === 0) {
      // Remove item from cart
      await query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [
        cartId,
        productId,
      ]);
    } else {
      // Update quantity
      await query('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?', [
        quantity,
        cartId,
        productId,
      ]);
    }
  }

  /**
   * Remove item from cart
   *
   * @param {number} cartId - Cart ID
   * @param {number} productId - Product ID to remove
   * @returns {Promise<void>}
   */
  async removeCartItem(cartId, productId) {
    await query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);
  }

  /**
   * Clear all items from cart
   *
   * @param {number|null} userId - User ID (null for guests)
   * @param {string|null} sessionId - Session ID for guest users
   * @returns {Promise<void>}
   */
  async clearCart(userId = null, sessionId = null) {
    const cartId = await this.getOrCreateCart(userId, sessionId, false);

    if (cartId) {
      await query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    }
  }

  /**
   * Calculate cart total from items
   *
   * @param {Array} items - Cart items array
   * @returns {number} Total price
   */
  calculateCartTotal(items) {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /**
   * Merge guest cart into user cart after login
   *
   * @param {string} sessionId - Guest session ID
   * @param {number} userId - User ID to merge into
   * @returns {Promise<void>}
   */
  async mergeGuestCartToUser(sessionId, userId) {
    // Get guest cart
    const guestCart = await query('SELECT * FROM carts WHERE session_id = ?', [sessionId]);
    if (guestCart.length === 0) return;

    const guestCartId = guestCart[0].id;

    // Get or create user cart
    const userCartId = await this.getOrCreateCart(userId, null, true);

    // Get guest cart items
    const guestItems = await query('SELECT * FROM cart_items WHERE cart_id = ?', [guestCartId]);

    // Merge items into user cart
    for (const item of guestItems) {
      const existing = await query(
        'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
        [userCartId, item.product_id]
      );

      if (existing.length > 0) {
        // Increment quantity
        await query(
          'UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?',
          [item.quantity, userCartId, item.product_id]
        );
      } else {
        // Add item to user cart
        await query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [
          userCartId,
          item.product_id,
          item.quantity,
        ]);
      }
    }

    // Delete guest cart
    await query('DELETE FROM cart_items WHERE cart_id = ?', [guestCartId]);
    await query('DELETE FROM carts WHERE id = ?', [guestCartId]);
  }

  /**
   * Get cart item count
   *
   * @param {number} cartId - Cart ID
   * @returns {Promise<number>} Total item count (sum of quantities)
   */
  async getCartItemCount(cartId) {
    const result = await query('SELECT SUM(quantity) as count FROM cart_items WHERE cart_id = ?', [
      cartId,
    ]);

    return result[0].count || 0;
  }

  /**
   * Validate cart items availability and stock
   *
   * @param {number} cartId - Cart ID
   * @returns {Promise<Object>} { valid: boolean, errors: Array }
   */
  async validateCart(cartId) {
    const items = await this.getCartItems(cartId);
    const errors = [];

    for (const item of items) {
      // Check if product exists and is active
      if (!item.name) {
        errors.push({ productId: item.product_id, error: 'Product no longer available' });
        continue;
      }

      // Check stock
      if (item.quantity > item.stock_quantity) {
        errors.push({
          productId: item.product_id,
          error: `Only ${item.stock_quantity} items in stock`,
          available: item.stock_quantity,
          requested: item.quantity,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      items,
    };
  }
}

export default new CartService();
