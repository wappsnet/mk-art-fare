import { Router } from 'express';
import { query, getConnection } from '../config/database';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AuthRequest, UserRole, OrderStatus } from '../types';
import { AppError } from '../middleware/errorHandler';
import { generateOrderNumber, getPaginationParams, calculateTax } from '../utils/helpers';

const router = Router();

// Create order from cart
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { shippingAddress, billingAddress } = req.body;

  const cart: any = await query('SELECT * FROM carts WHERE user_id = ?', [req.user!.userId]);
  if (cart.length === 0) {
    throw new AppError('Cart not found', 404);
  }

  const cartItems: any = await query(
    'SELECT ci.*, p.price, p.name, p.sku, p.organization_id FROM cart_items ci LEFT JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?',
    [cart[0].id]
  );

  if (cartItems.length === 0) {
    throw new AppError('Cart is empty', 400);
  }

  const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
  const tax = calculateTax(subtotal);
  const shippingCost = 9.99;
  const total = subtotal + tax + shippingCost;

  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const orderNumber = generateOrderNumber();

    const orderResult: any = await connection.execute(
      `INSERT INTO orders (order_number, user_id, status, subtotal, tax, shipping_cost, total,
       shipping_address_line1, shipping_address_line2, shipping_city, shipping_state, shipping_country, shipping_postal_code,
       billing_address_line1, billing_address_line2, billing_city, billing_state, billing_country, billing_postal_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber, req.user!.userId, OrderStatus.PENDING, subtotal, tax, shippingCost, total,
        shippingAddress.line1, shippingAddress.line2 || null, shippingAddress.city, shippingAddress.state, shippingAddress.country, shippingAddress.postalCode,
        billingAddress.line1, billingAddress.line2 || null, billingAddress.city, billingAddress.state, billingAddress.country, billingAddress.postalCode
      ]
    );

    const orderId = orderResult[0].insertId;

    for (const item of cartItems) {
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, organization_id, quantity, price, subtotal, product_name, product_sku)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.organization_id, item.quantity, item.price, item.price * item.quantity, item.name, item.sku]
      );
    }

    await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cart[0].id]);

    await connection.commit();

    const order: any = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
    sendSuccess(res, order[0], 'Order created successfully', 201);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

// Get user orders
router.get('/my', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { page, limit, offset } = getPaginationParams(req.query.page as string, req.query.limit as string);

  const orders: any = await query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [req.user!.userId, limit, offset]
  );

  const countResult: any = await query('SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [req.user!.userId]);

  sendPaginated(res, orders, page, limit, countResult[0].total);
}));

// Get order by ID
router.get('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const orderId = parseInt(req.params.id);

  const order: any = await query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, req.user!.userId]);

  if (order.length === 0) {
    throw new AppError('Order not found', 404);
  }

  const items: any = await query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

  sendSuccess(res, { ...order[0], items });
}));

// Get organization orders (for artists)
router.get('/organization/:orgId', authenticate, authorize(UserRole.ARTIST, UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res) => {
  const orgId = parseInt(req.params.orgId);

  const org: any = await query('SELECT * FROM organizations WHERE id = ? AND owner_id = ?', [orgId, req.user!.userId]);
  if (org.length === 0) {
    throw new AppError('Organization not found', 404);
  }

  const orders: any = await query(
    `SELECT DISTINCT o.*, oi.product_name, oi.quantity, oi.subtotal
     FROM orders o
     INNER JOIN order_items oi ON o.id = oi.order_id
     WHERE oi.organization_id = ?
     ORDER BY o.created_at DESC`,
    [orgId]
  );

  sendSuccess(res, orders);
}));

// Update order status (admin only)
router.patch('/:id/status', authenticate, authorize(UserRole.ADMIN), asyncHandler(async (req: AuthRequest, res) => {
  const orderId = parseInt(req.params.id);
  const { status } = req.body;

  await query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

  const order: any = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
  sendSuccess(res, order[0], 'Order status updated');
}));

export default router;
