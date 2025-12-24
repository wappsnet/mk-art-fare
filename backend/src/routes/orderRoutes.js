import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { UserRole } from '../types/index.js';
import orderService from '../services/orderService.js';

const router = Router();

// Create order from cart
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const order = await orderService.createOrderFromCart(req.user.userId, req.body);
    sendSuccess(res, order, 'Order created successfully', 201);
  })
);

// Get user orders
router.get(
  '/my',
  authenticate,
  asyncHandler(async (req, res) => {
    const { orders, total, page, limit } = await orderService.getUserOrders(req.user.userId, req.query);
    sendPaginated(res, orders, { page, limit, total });
  })
);

// Get order by ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const orderId = Number.parseInt(req.params.id);
    const order = await orderService.getOrderById(orderId, req.user.userId);
    sendSuccess(res, order);
  })
);

// Get organization orders (for artists)
router.get(
  '/organization/:orgId',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const orgId = Number.parseInt(req.params.orgId);
    const { orders, total, page, limit } = await orderService.getOrganizationOrders(
      orgId,
      req.user.userId,
      req.query
    );
    sendPaginated(res, orders, { page, limit, total });
  })
);

// Get organization sales statistics
router.get(
  '/organization/:orgId/stats',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const orgId = Number.parseInt(req.params.orgId);
    const stats = await orderService.getOrganizationStats(orgId, req.user.userId);
    sendSuccess(res, stats);
  })
);

// Update order status (admin only)
router.patch(
  '/:id/status',
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const orderId = Number.parseInt(req.params.id);
    const order = await orderService.updateOrderStatus(orderId, req.body.status);
    sendSuccess(res, order, 'Order status updated');
  })
);

export default router;
