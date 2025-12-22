import { query, getConnection } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateOrderNumber, getPaginationParams, calculateTax } from '../utils/helpers.js';
import { OrderStatus } from '../types/index.js';
import ownershipService from './ownershipService.js';

/**
 * Order Service
 * Handles order creation, retrieval, and statistics
 * Extracts business logic from orderRoutes.js (313 lines → ~100 lines)
 */

class OrderService {
  /**
   * Create order from user's cart
   *
   * @param {number} userId - User ID
   * @param {Object} addressData - Shipping and billing addresses
   * @returns {Promise<Object>} Created order
   * @throws {AppError} If cart not found or empty
   */
  async createOrderFromCart(userId, addressData) {
    const { shippingAddress, billingAddress } = addressData;

    const cart = await query('SELECT * FROM carts WHERE user_id = ?', [userId]);
    if (cart.length === 0) {
      throw new AppError('Cart not found', 404);
    }

    // Get product cart items
    const cartItems = await query(
      'SELECT ci.*, p.price, p.name, p.sku, p.organization_id FROM cart_items ci LEFT JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?',
      [cart[0].id]
    );

    if (cartItems.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = calculateTax(subtotal);
    const shippingCost = 9.99;
    const total = subtotal + tax + shippingCost;

    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      const orderNumber = generateOrderNumber();

      const orderResult = await connection.execute(
        `INSERT INTO orders (order_number, user_id, status, subtotal, tax, shipping_cost, total,
       shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_country, shipping_postal_code,
       billing_address_line1, billing_address_line2, billing_city, billing_state, billing_country, billing_postal_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          userId,
          OrderStatus.PENDING,
          subtotal,
          tax,
          shippingCost,
          total,
          shippingAddress.line1,
          shippingAddress.line2 || null,
          shippingAddress.city,
          shippingAddress.state,
          shippingAddress.country,
          shippingAddress.postalCode,
          billingAddress.line1,
          billingAddress.line2 || null,
          billingAddress.city,
          billingAddress.state,
          billingAddress.country,
          billingAddress.postalCode,
        ]
      );

      const orderId = orderResult[0].insertId;

      // Create product order items
      for (const item of cartItems) {
        await connection.execute(
          `INSERT INTO order_items (order_id, product_id, organization_id, quantity, price, subtotal, product_name, product_sku)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.organization_id,
            item.quantity,
            item.price,
            item.price * item.quantity,
            item.name,
            item.sku,
          ]
        );
      }

      // Clear cart
      await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cart[0].id]);

      await connection.commit();

      const order = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
      return order[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get user's orders with pagination
   *
   * @param {number} userId - User ID
   * @param {Object} pagination - Pagination params { page, limit }
   * @returns {Promise<Object>} { orders, total, page, limit }
   */
  async getUserOrders(userId, pagination = {}) {
    const { page, limit, offset } = getPaginationParams(pagination.page, pagination.limit);

    // Ensure limit and offset are valid integers
    const validLimit = Math.floor(Number(limit)) || 10;
    const validOffset = Math.floor(Number(offset)) || 0;

    const orders = await query(
      `SELECT o.*,
       (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC
       LIMIT ${validLimit} OFFSET ${validOffset}`,
      [userId]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [
      userId,
    ]);

    return {
      orders,
      total: countResult[0].total,
      page,
      limit,
    };
  }

  /**
   * Get order by ID (with ownership verification)
   *
   * @param {number} orderId - Order ID
   * @param {number} userId - User ID (for verification)
   * @returns {Promise<Object>} Order with items
   * @throws {AppError} If order not found or user not authorized
   */
  async getOrderById(orderId, userId) {
    const order = await query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [
      orderId,
      userId,
    ]);

    if (order.length === 0) {
      throw new AppError('Order not found', 404);
    }

    // Get product items
    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    return { ...order[0], items };
  }

  /**
   * Get orders for an organization (for artists)
   *
   * @param {number} orgId - Organization ID
   * @param {number} userId - User ID (for ownership verification)
   * @param {Object} pagination - Pagination params
   * @returns {Promise<Object>} { orders, total, page, limit }
   * @throws {AppError} If organization not found or user not authorized
   */
  async getOrganizationOrders(orgId, userId, pagination = {}) {
    // Verify organization ownership
    await ownershipService.verifyOrganizationOwnership(orgId, userId);

    const { page, limit, offset } = getPaginationParams(pagination.page, pagination.limit);

    // Ensure limit and offset are valid integers
    const validLimit = Math.floor(Number(limit)) || 10;
    const validOffset = Math.floor(Number(offset)) || 0;

    // Get orders with products for this organization
    const orders = await query(
      `SELECT DISTINCT o.id, o.order_number, o.status, o.total, o.created_at,
       (SELECT GROUP_CONCAT(DISTINCT product_name SEPARATOR ', ')
        FROM order_items WHERE order_id = o.id AND organization_id = ?) as products,
       (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE order_id = o.id AND organization_id = ?) as item_count
       FROM orders o
       WHERE EXISTS (
         SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.organization_id = ?
       )
       ORDER BY o.created_at DESC
       LIMIT ${validLimit} OFFSET ${validOffset}`,
      [orgId, orgId, orgId]
    );

    const countResult = await query(
      `SELECT COUNT(DISTINCT o.id) as total
       FROM orders o
       WHERE EXISTS (
         SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.organization_id = ?
       )`,
      [orgId]
    );

    return {
      orders,
      total: countResult[0].total,
      page,
      limit,
    };
  }

  /**
   * Get organization sales statistics
   *
   * @param {number} orgId - Organization ID
   * @param {number} userId - User ID (for ownership verification)
   * @returns {Promise<Object>} Statistics object
   * @throws {AppError} If organization not found or user not authorized
   */
  async getOrganizationStats(orgId, userId) {
    // Verify organization ownership
    await ownershipService.verifyOrganizationOwnership(orgId, userId);

    // Total product sales
    const productStats = await query(
      `SELECT
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(oi.subtotal), 0) as total_revenue,
        COALESCE(SUM(oi.quantity), 0) as total_items_sold
       FROM orders o
       INNER JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.organization_id = ?`,
      [orgId]
    );

    // Orders by status
    const statusStats = await query(
      `SELECT
        o.status,
        COUNT(DISTINCT o.id) as count,
        COALESCE(SUM(oi.subtotal), 0) as revenue
       FROM orders o
       INNER JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.organization_id = ?
       GROUP BY o.status`,
      [orgId]
    );

    // Recent 30 days revenue
    const recentRevenue = await query(
      `SELECT
        DATE(o.created_at) as date,
        COALESCE(SUM(oi.subtotal), 0) as revenue,
        COUNT(DISTINCT o.id) as orders
       FROM orders o
       INNER JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.organization_id = ?
       AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(o.created_at)
       ORDER BY date DESC`,
      [orgId]
    );

    // Top selling products
    const topProducts = await query(
      `SELECT
        oi.product_name as name,
        SUM(oi.quantity) as total_sold,
        COALESCE(SUM(oi.subtotal), 0) as revenue
       FROM order_items oi
       WHERE oi.organization_id = ?
       GROUP BY oi.product_id, oi.product_name
       ORDER BY total_sold DESC
       LIMIT 5`,
      [orgId]
    );

    return {
      total: {
        total_orders: productStats[0].total_orders,
        total_revenue: productStats[0].total_revenue,
        total_items_sold: productStats[0].total_items_sold,
      },
      byStatus: statusStats,
      recentRevenue,
      topProducts,
    };
  }

  /**
   * Update order status
   *
   * @param {number} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, status) {
    await query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

    const order = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
    return order[0];
  }

  /**
   * Get order items for an order
   *
   * @param {number} orderId - Order ID
   * @returns {Promise<Array>} Array of order items
   */
  async getOrderItems(orderId) {
    return await query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
  }

  /**
   * Calculate order totals from cart items
   *
   * @param {Array} cartItems - Cart items array
   * @returns {Object} { subtotal, tax, shippingCost, total }
   */
  calculateOrderTotals(cartItems) {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = calculateTax(subtotal);
    const shippingCost = 9.99; // Could be dynamic based on items/location

    return {
      subtotal,
      tax,
      shippingCost,
      total: subtotal + tax + shippingCost,
    };
  }
}

export default new OrderService();
