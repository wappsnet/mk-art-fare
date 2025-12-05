import { Router } from 'express';
import { query, getConnection } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { UserRole, OrderStatus, EventBookingStatus, TicketDeliveryMethod } from '../types/index.js';
import { generateOrderNumber, generateBookingNumber, getPaginationParams, calculateTax } from '../utils/helpers.js';
import { emailService } from '../services/emailService.js';
import crypto from 'crypto';

const router = Router();

// Create order from cart
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { shippingAddress, billingAddress, ticketDeliveryInfo } = req.body;

    const cart = await query('SELECT * FROM carts WHERE user_id = ?', [req.user.userId]);
    if (cart.length === 0) {
      throw new AppError('Cart not found', 404);
    }

    // Get product cart items
    const cartItems = await query(
      'SELECT ci.*, p.price, p.name, p.sku, p.organization_id FROM cart_items ci LEFT JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?',
      [cart[0].id]
    );

    // Get event ticket cart items
    const ticketCartItems = await query(
      `SELECT etci.*, et.price, et.is_free, et.ticket_type, et.event_id, et.quantity_available, et.quantity_sold,
       e.title as event_title, e.start_date, e.venue_name
       FROM event_ticket_cart_items etci
       LEFT JOIN event_tickets et ON etci.ticket_id = et.id
       LEFT JOIN events e ON et.event_id = e.id
       WHERE etci.cart_id = ?`,
      [cart[0].id]
    );

    if (cartItems.length === 0 && ticketCartItems.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    const productSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const ticketSubtotal = ticketCartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    const subtotal = productSubtotal + ticketSubtotal;
    const tax = calculateTax(productSubtotal); // Tax only on products
    const shippingCost = cartItems.length > 0 ? 9.99 : 0; // Shipping only for products
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

      // Create event ticket bookings and order items
      for (const item of ticketCartItems) {
        // Check ticket availability
        if (item.quantity_available - item.quantity_sold < item.quantity) {
          throw new AppError(`Not enough tickets available for ${item.event_title}`, 400);
        }

        // Generate virtual ticket code if virtual delivery
        const deliveryMethod = ticketDeliveryInfo?.[item.ticket_id]?.deliveryMethod || TicketDeliveryMethod.VIRTUAL;
        const virtualTicketCode = deliveryMethod === TicketDeliveryMethod.VIRTUAL
          ? crypto.randomBytes(16).toString('hex').toUpperCase()
          : null;

        const bookingNumber = generateBookingNumber();

        // Get attendee info from request or use user info
        const attendeeInfo = ticketDeliveryInfo?.[item.ticket_id]?.attendeeInfo || {};
        const attendeeName = attendeeInfo.name || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim();
        const attendeeEmail = attendeeInfo.email || req.user.email;

        // Create event booking
        const bookingResult = await connection.execute(
          `INSERT INTO event_bookings (booking_number, event_id, ticket_id, user_id, quantity, total_price, status,
           attendee_name, attendee_email, attendee_phone, delivery_method, delivery_address_line1, delivery_address_line2,
           delivery_city, delivery_state, delivery_country, delivery_postal_code, pickup_location, virtual_ticket_code)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            bookingNumber,
            item.event_id,
            item.ticket_id,
            req.user.userId,
            item.quantity,
            parseFloat(item.price) * item.quantity,
            EventBookingStatus.CONFIRMED,
            attendeeName,
            attendeeEmail,
            attendeeInfo.phone || null,
            deliveryMethod,
            deliveryMethod === TicketDeliveryMethod.PHYSICAL_DELIVERY ? shippingAddress.line1 : null,
            deliveryMethod === TicketDeliveryMethod.PHYSICAL_DELIVERY ? shippingAddress.line2 : null,
            deliveryMethod === TicketDeliveryMethod.PHYSICAL_DELIVERY ? shippingAddress.city : null,
            deliveryMethod === TicketDeliveryMethod.PHYSICAL_DELIVERY ? shippingAddress.state : null,
            deliveryMethod === TicketDeliveryMethod.PHYSICAL_DELIVERY ? shippingAddress.country : null,
            deliveryMethod === TicketDeliveryMethod.PHYSICAL_DELIVERY ? shippingAddress.postalCode : null,
            ticketDeliveryInfo?.[item.ticket_id]?.pickupLocation || null,
            virtualTicketCode,
          ]
        );

        const bookingId = bookingResult[0].insertId;

        // Update ticket sold quantity
        await connection.execute(
          'UPDATE event_tickets SET quantity_sold = quantity_sold + ? WHERE id = ?',
          [item.quantity, item.ticket_id]
        );

        // Create order event item
        await connection.execute(
          `INSERT INTO order_event_items (order_id, booking_id, ticket_id, event_id, quantity, price, subtotal,
           event_title, ticket_type, delivery_method)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            bookingId,
            item.ticket_id,
            item.event_id,
            item.quantity,
            item.price,
            parseFloat(item.price) * item.quantity,
            item.event_title,
            item.ticket_type,
            deliveryMethod,
          ]
        );

        // Send ticket email (async - don't wait)
        const bookingDetails = {
          attendee_email: attendeeEmail,
          attendee_name: attendeeName,
          booking_number: bookingNumber,
          virtual_ticket_code: virtualTicketCode,
          qr_code_url: null, // TODO: Generate QR code
          quantity: item.quantity,
          event_title: item.event_title,
          event_start_date: item.start_date,
          venue_name: item.venue_name,
          ticket_type: item.ticket_type,
          total_price: parseFloat(item.price) * item.quantity,
          delivery_method: deliveryMethod,
          pickup_location: ticketDeliveryInfo?.[item.ticket_id]?.pickupLocation,
          delivery_address_line1: deliveryMethod === TicketDeliveryMethod.PHYSICAL_DELIVERY ? shippingAddress.line1 : null,
          delivery_city: deliveryMethod === TicketDeliveryMethod.PHYSICAL_DELIVERY ? shippingAddress.city : null,
          delivery_state: deliveryMethod === TicketDeliveryMethod.PHYSICAL_DELIVERY ? shippingAddress.state : null,
          delivery_postal_code: deliveryMethod === TicketDeliveryMethod.PHYSICAL_DELIVERY ? shippingAddress.postalCode : null,
        };

        // Send email and update email_sent status
        try {
          await emailService.sendEventTicketEmail(bookingDetails);
          await connection.execute(
            'UPDATE event_bookings SET email_sent = TRUE, email_sent_at = NOW() WHERE id = ?',
            [bookingId]
          );
        } catch (emailError) {
          console.error('Failed to send ticket email:', emailError);
          // Don't fail the order if email fails
        }
      }

      // Clear cart
      await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cart[0].id]);
      await connection.execute('DELETE FROM event_ticket_cart_items WHERE cart_id = ?', [cart[0].id]);

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
      `SELECT o.*,
       (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as product_count,
       (SELECT COUNT(*) FROM order_event_items WHERE order_id = o.id) as ticket_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      [req.user.userId]
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

    // Get product items
    const items = await query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    // Get event ticket items with booking details
    const eventItems = await query(
      `SELECT oei.*, eb.booking_number, eb.attendee_name, eb.attendee_email,
       eb.delivery_method, eb.virtual_ticket_code, eb.pickup_location,
       eb.delivery_address_line1, eb.delivery_city, eb.delivery_state, eb.delivery_postal_code,
       e.start_date, e.end_date, e.venue_name
       FROM order_event_items oei
       LEFT JOIN event_bookings eb ON oei.booking_id = eb.id
       LEFT JOIN events e ON oei.event_id = e.id
       WHERE oei.order_id = ?`,
      [orderId]
    );

    sendSuccess(res, { ...order[0], items, eventItems });
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

    // Get orders with both products and event tickets for this organization
    const orders = await query(
      `SELECT DISTINCT o.id, o.order_number, o.status, o.total, o.created_at,
       (SELECT GROUP_CONCAT(DISTINCT product_name SEPARATOR ', ')
        FROM order_items WHERE order_id = o.id AND organization_id = ?) as products,
       (SELECT GROUP_CONCAT(DISTINCT event_title SEPARATOR ', ')
        FROM order_event_items oei
        INNER JOIN events e ON oei.event_id = e.id
        WHERE oei.order_id = o.id AND e.organization_id = ?) as events,
       (SELECT COALESCE(SUM(quantity), 0) FROM order_items WHERE order_id = o.id AND organization_id = ?) as product_items,
       (SELECT COALESCE(SUM(quantity), 0) FROM order_event_items oei
        INNER JOIN events e ON oei.event_id = e.id
        WHERE oei.order_id = o.id AND e.organization_id = ?) as ticket_items
       FROM orders o
       WHERE EXISTS (
         SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.organization_id = ?
       ) OR EXISTS (
         SELECT 1 FROM order_event_items oei
         INNER JOIN events e ON oei.event_id = e.id
         WHERE oei.order_id = o.id AND e.organization_id = ?
       )
       ORDER BY o.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      [orgId, orgId, orgId, orgId, orgId, orgId]
    );

    const countResult = await query(
      `SELECT COUNT(DISTINCT o.id) as total
       FROM orders o
       WHERE EXISTS (
         SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.organization_id = ?
       ) OR EXISTS (
         SELECT 1 FROM order_event_items oei
         INNER JOIN events e ON oei.event_id = e.id
         WHERE oei.order_id = o.id AND e.organization_id = ?
       )`,
      [orgId, orgId]
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

    // Total event ticket sales
    const eventStats = await query(
      `SELECT
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(oei.subtotal), 0) as total_revenue,
        COALESCE(SUM(oei.quantity), 0) as total_tickets_sold
       FROM orders o
       INNER JOIN order_event_items oei ON o.id = oei.order_id
       INNER JOIN events e ON oei.event_id = e.id
       WHERE e.organization_id = ?`,
      [orgId]
    );

    // Combined total stats
    const totalStats = {
      total_orders: Math.max(productStats[0].total_orders, eventStats[0].total_orders),
      product_revenue: parseFloat(productStats[0].total_revenue || 0),
      event_revenue: parseFloat(eventStats[0].total_revenue || 0),
      total_revenue: parseFloat(productStats[0].total_revenue || 0) + parseFloat(eventStats[0].total_revenue || 0),
      total_items_sold: parseInt(productStats[0].total_items_sold || 0),
      total_tickets_sold: parseInt(eventStats[0].total_tickets_sold || 0),
    };

    // Orders by status (combined products and events)
    const statusStats = await query(
      `SELECT
        status,
        COUNT(*) as count,
        SUM(total_revenue) as revenue
       FROM (
         SELECT DISTINCT
           o.id,
           o.status,
           (
             COALESCE((SELECT SUM(oi.subtotal) FROM order_items oi
                       WHERE oi.order_id = o.id AND oi.organization_id = ?), 0) +
             COALESCE((SELECT SUM(oei.subtotal) FROM order_event_items oei
                       INNER JOIN events e ON oei.event_id = e.id
                       WHERE oei.order_id = o.id AND e.organization_id = ?), 0)
           ) as total_revenue
         FROM orders o
         WHERE EXISTS (
           SELECT 1 FROM order_items WHERE order_id = o.id AND organization_id = ?
         ) OR EXISTS (
           SELECT 1 FROM order_event_items oei
           INNER JOIN events e ON oei.event_id = e.id
           WHERE oei.order_id = o.id AND e.organization_id = ?
         )
       ) as order_data
       GROUP BY status`,
      [orgId, orgId, orgId, orgId]
    );

    // Recent 30 days revenue (combined)
    const recentRevenue = await query(
      `SELECT
        date,
        SUM(product_revenue) as product_revenue,
        SUM(event_revenue) as event_revenue,
        COUNT(DISTINCT order_id) as orders
       FROM (
         SELECT DISTINCT
           o.id as order_id,
           DATE(o.created_at) as date,
           COALESCE((SELECT SUM(oi.subtotal) FROM order_items oi
                     WHERE oi.order_id = o.id AND oi.organization_id = ?), 0) as product_revenue,
           COALESCE((SELECT SUM(oei.subtotal) FROM order_event_items oei
                     INNER JOIN events e ON oei.event_id = e.id
                     WHERE oei.order_id = o.id AND e.organization_id = ?), 0) as event_revenue
         FROM orders o
         WHERE (
           EXISTS (SELECT 1 FROM order_items WHERE order_id = o.id AND organization_id = ?)
           OR EXISTS (
             SELECT 1 FROM order_event_items oei
             INNER JOIN events e ON oei.event_id = e.id
             WHERE oei.order_id = o.id AND e.organization_id = ?
           )
         ) AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       ) as daily_data
       GROUP BY date
       ORDER BY date DESC`,
      [orgId, orgId, orgId, orgId]
    );

    // Top selling products
    const topProducts = await query(
      `SELECT
        oi.product_name as name,
        'product' as type,
        SUM(oi.quantity) as total_sold,
        COALESCE(SUM(oi.subtotal), 0) as revenue
       FROM order_items oi
       WHERE oi.organization_id = ?
       GROUP BY oi.product_id, oi.product_name
       ORDER BY total_sold DESC
       LIMIT 5`,
      [orgId]
    );

    // Top selling event tickets
    const topEvents = await query(
      `SELECT
        oei.event_title as name,
        'event' as type,
        SUM(oei.quantity) as total_sold,
        COALESCE(SUM(oei.subtotal), 0) as revenue
       FROM order_event_items oei
       INNER JOIN events e ON oei.event_id = e.id
       WHERE e.organization_id = ?
       GROUP BY oei.event_id, oei.event_title
       ORDER BY total_sold DESC
       LIMIT 5`,
      [orgId]
    );

    sendSuccess(res, {
      total: totalStats,
      byStatus: statusStats,
      recentRevenue,
      topProducts,
      topEvents,
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
