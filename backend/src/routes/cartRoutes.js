import { Router } from 'express';
import { query } from '../config/database.js';
import { optionalAuth } from '../middleware/auth.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

// Get cart
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    let cartId = null;

    if (req.user) {
      const cart = await query('SELECT * FROM carts WHERE user_id = ?', [req.user.userId]);
      cartId = cart.length > 0 ? cart[0].id : null;

      if (!cartId) {
        const result = await query('INSERT INTO carts (user_id) VALUES (?)', [req.user.userId]);
        cartId = result.insertId;
      }
    } else {
      const sessionId = req.query.sessionId;
      if (sessionId) {
        const cart = await query('SELECT * FROM carts WHERE session_id = ?', [sessionId]);
        cartId = cart.length > 0 ? cart[0].id : null;
      }
    }

    if (!cartId) {
      sendSuccess(res, { items: [], total: 0 });
      return;
    }

    const items = await query(
      `SELECT ci.*, p.name, p.price, p.stock_quantity, p.slug, o.name as organization_name, o.slug as organization_slug
     FROM cart_items ci
     LEFT JOIN products p ON ci.product_id = p.id
     LEFT JOIN organizations o ON p.organization_id = o.id
     WHERE ci.cart_id = ?`,
      [cartId]
    );

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    sendSuccess(res, { id: cartId, items, total });
  })
);

// Add to cart
router.post(
  '/items',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { productId, quantity, sessionId } = req.body;

    let cartId = null;

    if (req.user) {
      const cart = await query('SELECT * FROM carts WHERE user_id = ?', [req.user.userId]);
      if (cart.length > 0) {
        cartId = cart[0].id;
      } else {
        const result = await query('INSERT INTO carts (user_id) VALUES (?)', [req.user.userId]);
        cartId = result.insertId;
      }
    } else if (sessionId) {
      const cart = await query('SELECT * FROM carts WHERE session_id = ?', [sessionId]);
      if (cart.length > 0) {
        cartId = cart[0].id;
      } else {
        const result = await query('INSERT INTO carts (session_id) VALUES (?)', [sessionId]);
        cartId = result.insertId;
      }
    } else {
      throw new AppError('Session ID required for guest users', 400);
    }

    const existing = await query('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?', [
      cartId,
      productId,
    ]);

    if (existing.length > 0) {
      await query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?',
        [quantity, cartId, productId]
      );
    } else {
      await query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [
        cartId,
        productId,
        quantity,
      ]);
    }

    sendSuccess(res, null, 'Item added to cart');
  })
);

// Update cart item
router.patch(
  '/items/:productId',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const productId = parseInt(req.params.productId);
    const { quantity } = req.body;

    let cartId = null;

    if (req.user) {
      const cart = await query('SELECT * FROM carts WHERE user_id = ?', [req.user.userId]);
      cartId = cart.length > 0 ? cart[0].id : null;
    } else {
      const sessionId = req.query.sessionId;
      if (sessionId) {
        const cart = await query('SELECT * FROM carts WHERE session_id = ?', [sessionId]);
        cartId = cart.length > 0 ? cart[0].id : null;
      }
    }

    if (!cartId) {
      throw new AppError('Cart not found', 404);
    }

    if (quantity === 0) {
      await query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [
        cartId,
        productId,
      ]);
    } else {
      await query('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?', [
        quantity,
        cartId,
        productId,
      ]);
    }

    sendSuccess(res, null, 'Cart updated');
  })
);

// Clear cart
router.delete(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    let cartId = null;

    if (req.user) {
      const cart = await query('SELECT * FROM carts WHERE user_id = ?', [req.user.userId]);
      cartId = cart.length > 0 ? cart[0].id : null;
    } else {
      const sessionId = req.query.sessionId;
      if (sessionId) {
        const cart = await query('SELECT * FROM carts WHERE session_id = ?', [sessionId]);
        cartId = cart.length > 0 ? cart[0].id : null;
      }
    }

    if (cartId) {
      await query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    }

    sendSuccess(res, null, 'Cart cleared');
  })
);

export default router;
