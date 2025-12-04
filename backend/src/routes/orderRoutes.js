import { Router } from 'express';
import { query, getConnection } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { UserRole, OrderStatus } from '../types/index.js';
import { generateOrderNumber, getPaginationParams, calculateTax } from '../utils/helpers.js';

const router = Router();

// Create order from cart
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { shippingAddress, billingAddress } = req.body;

    const cart = await query('SELECT * FROM carts WHERE user_id = ?', [req.user.userId]);
    if (cart.length === 0) {
      throw new AppError('Cart not found', 404);
    }

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
          req.user.userId,
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

      await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cart[0].id]);

      await connection.commit();

      const order = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
      sendSuccess(res, order[0], 'Order created successfully', 201);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  })
);

// Get user orders
router.get(
  '/my',
  authenticate,
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query.page, req.query.limit);

    const orders = await query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.user.userId, limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [
      req.user.userId,
    ]);

    sendPaginated(res, orders, page, limit, countResult[0].total);
  })
);

// Get order by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const orderId = parseInt(req.params.id);

    const order = await query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [
      orderId,
      req.user.userId,
    ]);

    if (order.length === 0) {
      throw new AppError('Order not found', 404);
    }

    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    sendSuccess(res, { ...order[0], items });
  })
);

// Get organization orders (for artists)
router.get(
  '/organization/:orgId',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const orgId = parseInt(req.params.orgId);
    const { page, limit, offset } = getPaginationParams(req.query.page, req.query.limit);

    const org = await query('SELECT * FROM organizations WHERE id = ? AND owner_id = ?', [
      orgId,
      req.user.userId,
    ]);
    if (org.length === 0) {
      throw new AppError('Organization not found', 404);
    }

    const orders = await query(
      `SELECT o.id, o.order_number, o.status, o.total, o.created_at,
              GROUP_CONCAT(DISTINCT oi.product_name SEPARATOR ', ') as products,
              SUM(oi.quantity) as total_items
       FROM orders o
       INNER JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.organization_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [orgId, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(DISTINCT o.id) as total
       FROM orders o
       INNER JOIN order_items oi ON o.id = oi.order_id
       WHERE oi.organization_id = ?`,
      [orgId]
    );

    sendPaginated(res, orders, page, limit, countResult[0].total);
  })
);

// Get organization sales statistics
router.get(
  '/organization/:orgId/stats',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const orgId = parseInt(req.params.orgId);

    const org = await query('SELECT * FROM organizations WHERE id = ? AND owner_id = ?', [
      orgId,
      req.user.userId,
    ]);
    if (org.length === 0) {
      throw new AppError('Organization not found', 404);
    }

    // Total sales and orders
    const totalStats = await query(
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
       WHERE oi.organization_id = ? AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(o.created_at)
       ORDER BY date DESC`,
      [orgId]
    );

    // Top selling products
    const topProducts = await query(
      `SELECT
        oi.product_name,
        SUM(oi.quantity) as total_sold,
        COALESCE(SUM(oi.subtotal), 0) as revenue
       FROM order_items oi
       WHERE oi.organization_id = ?
       GROUP BY oi.product_id, oi.product_name
       ORDER BY total_sold DESC
       LIMIT 5`,
      [orgId]
    );

    sendSuccess(res, {
      total: totalStats[0],
      byStatus: statusStats,
      recentRevenue,
      topProducts,
    });
  })
);

// Update order status (admin only)
router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    await query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

    const order = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
    sendSuccess(res, order[0], 'Order status updated');
  })
);

export default router;
