import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import cartService from '../services/cartService.js';

const router = Router();

// Get cart
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user?.userId || null;
    const sessionId = req.query.sessionId || null;

    const cart = await cartService.getCart({ userId, sessionId });

    sendSuccess(res, cart);
  })
);

// Add to cart
router.post(
  '/items',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { productId, quantity, sessionId } = req.body;
    const userId = req.user?.userId || null;

    await cartService.addItemToCart({ userId, sessionId, productId, quantity });

    sendSuccess(res, null, 'Item added to cart');
  })
);

// Update cart item
router.patch(
  '/items/:productId',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const productId = Number.parseInt(req.params.productId);
    const { quantity } = req.body;
    const userId = req.user?.userId || null;
    const sessionId = req.query.sessionId || null;

    await cartService.updateCartItem({ userId, sessionId, productId, quantity });

    sendSuccess(res, null, 'Cart updated');
  })
);

// Clear cart
router.delete(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user?.userId || null;
    const sessionId = req.query.sessionId || null;

    await cartService.clearCart(userId, sessionId);

    sendSuccess(res, null, 'Cart cleared');
  })
);

export default router;
