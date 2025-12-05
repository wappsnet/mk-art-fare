import { Router } from 'express';
import { query, getConnection } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { UserRole, EventModerationStatus, EventMediaType, TicketDeliveryMethod } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  generateSlug,
  generateBookingNumber,
  getPaginationParams,
  transformImageUrls,
} from '../utils/helpers.js';
import { uploadEventMedia } from '../config/eventMulter.js';
import { emailService } from '../services/emailService.js';
import crypto from 'crypto';

const router = Router();

// Get all approved events (public)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query.page, req.query.limit);
    const { eventType, city, startDate } = req.query;

    let queryStr =
      'SELECT e.*, o.name as organization_name FROM events e LEFT JOIN organizations o ON e.organization_id = o.id WHERE e.is_active = TRUE AND e.moderation_status = ?';
    const params = [EventModerationStatus.APPROVED];

    if (eventType) {
      queryStr += ' AND e.event_type = ?';
      params.push(eventType);
    }
    if (city) {
      queryStr += ' AND e.city = ?';
      params.push(city);
    }
    if (startDate) {
      queryStr += ' AND DATE(e.start_date) >= ?';
      params.push(startDate);
    }

    queryStr += ' ORDER BY e.start_date ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    let events = await query(queryStr, params);
    events = transformImageUrls(events, 'featured_image_url', 'events/images');

    let countQuery =
      'SELECT COUNT(*) as total FROM events WHERE is_active = TRUE AND moderation_status = ?';
    const countParams = [EventModerationStatus.APPROVED];

    if (eventType) {
      countQuery += ' AND event_type = ?';
      countParams.push(eventType);
    }
    if (city) {
      countQuery += ' AND city = ?';
      countParams.push(city);
    }

    const countResult = await query(countQuery, countParams);

    sendPaginated(res, events, page, limit, countResult[0].total);
  })
);

// Get event by slug (public for approved, restricted for others)
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const event = await query(
      `SELECT e.*, o.name as organization_name,
       u.email as creator_email, u.first_name as creator_first_name, u.last_name as creator_last_name
       FROM events e
       LEFT JOIN organizations o ON e.organization_id = o.id
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.slug = ? AND e.is_active = TRUE`,
      [req.params.slug]
    );

    if (event.length === 0) {
      throw new AppError('Event not found', 404);
    }

    const eventData = event[0];

    // Only show approved events to public
    if (eventData.moderation_status !== EventModerationStatus.APPROVED) {
      throw new AppError('Event not found', 404);
    }

    const tickets = await query('SELECT * FROM event_tickets WHERE event_id = ?', [eventData.id]);
    const media = await query('SELECT * FROM event_media WHERE event_id = ? ORDER BY sort_order', [
      eventData.id,
    ]);

    const transformedEvent = transformImageUrls(eventData, 'featured_image_url', 'events/images');
    const transformedMedia = transformImageUrls(media, 'url', 'events');

    sendSuccess(res, { ...transformedEvent, tickets, media: transformedMedia });
  })
);

// Create event (organization owners and admins)
router.post(
  '/',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  uploadEventMedia.array('media', 10),
  asyncHandler(async (req, res) => {
    const {
      organizationId,
      title,
      description,
      eventType,
      venue,
      address,
      startDate,
      endDate,
      featuredImageUrl,
      videoUrl,
      tickets,
      mediaUrls,
    } = req.body;

    // Validate organization ownership if provided
    if (organizationId) {
      const org = await query('SELECT * FROM organizations WHERE id = ? AND owner_id = ?', [
        organizationId,
        req.user.userId,
      ]);
      if (org.length === 0 && req.user.role !== UserRole.ADMIN) {
        throw new AppError('Organization not found or not authorized', 403);
      }
    }

    const slug = generateSlug(title);
    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // Set moderation status - admins auto-approve, others pending
      const moderationStatus =
        req.user.role === UserRole.ADMIN
          ? EventModerationStatus.APPROVED
          : EventModerationStatus.PENDING;

      const eventResult = await connection.execute(
        `INSERT INTO events (organization_id, created_by, title, slug, description, event_type, venue_name,
       address_line1, address_line2, city, state, country, postal_code, latitude, longitude,
       start_date, end_date, featured_image_url, video_url, moderation_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          organizationId || null,
          req.user.userId,
          title,
          slug,
          description || null,
          eventType || null,
          venue?.name || null,
          address?.line1 || null,
          address?.line2 || null,
          address?.city || null,
          address?.state || null,
          address?.country || null,
          address?.postalCode || null,
          address?.latitude || null,
          address?.longitude || null,
          startDate,
          endDate,
          featuredImageUrl || null,
          videoUrl || null,
          moderationStatus,
        ]
      );

      const eventId = eventResult[0].insertId;

      // Handle file uploads
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const mediaType = file.mimetype.startsWith('video/')
            ? EventMediaType.VIDEO
            : EventMediaType.IMAGE;
          const filePath = file.path.replace(/\\/g, '/');

          await connection.execute(
            'INSERT INTO event_media (event_id, media_type, file_path, sort_order) VALUES (?, ?, ?, ?)',
            [eventId, mediaType, filePath, i]
          );
        }
      }

      // Handle media URLs
      if (mediaUrls && Array.isArray(mediaUrls)) {
        for (let i = 0; i < mediaUrls.length; i++) {
          const mediaUrl = mediaUrls[i];
          const mediaType = mediaUrl.type || EventMediaType.IMAGE;

          await connection.execute(
            'INSERT INTO event_media (event_id, media_type, url, alt_text, sort_order) VALUES (?, ?, ?, ?, ?)',
            [eventId, mediaType, mediaUrl.url, mediaUrl.altText || null, mediaUrl.order || i]
          );
        }
      }

      // Handle tickets
      if (tickets && tickets.length > 0) {
        for (const ticket of tickets) {
          const isFree = !ticket.price || parseFloat(ticket.price) === 0;

          await connection.execute(
            `INSERT INTO event_tickets (event_id, ticket_type, price, is_free, quantity_available,
             description, delivery_method, pickup_location, pickup_instructions)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              eventId,
              ticket.type,
              isFree ? 0 : ticket.price,
              isFree,
              ticket.quantity,
              ticket.description || null,
              ticket.deliveryMethod || TicketDeliveryMethod.VIRTUAL,
              ticket.pickupLocation || null,
              ticket.pickupInstructions || null,
            ]
          );
        }
      }

      await connection.commit();

      let event = await query('SELECT * FROM events WHERE id = ?', [eventId]);
      event = transformImageUrls(event[0], 'featured_image_url', 'events/images');

      sendSuccess(
        res,
        event,
        req.user.role === UserRole.ADMIN
          ? 'Event created and approved'
          : 'Event created and pending approval',
        201
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  })
);

// Update event
router.put(
  '/:id',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  uploadEventMedia.array('media', 10),
  asyncHandler(async (req, res) => {
    const eventId = parseInt(req.params.id);

    const existingEvent = await query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (existingEvent.length === 0) {
      throw new AppError('Event not found', 404);
    }

    // Check ownership
    if (
      req.user.role !== UserRole.ADMIN &&
      existingEvent[0].created_by !== req.user.userId
    ) {
      throw new AppError('Not authorized to update this event', 403);
    }

    const {
      title,
      description,
      eventType,
      venue,
      address,
      startDate,
      endDate,
      featuredImageUrl,
      videoUrl,
    } = req.body;

    const slug = title ? generateSlug(title) : existingEvent[0].slug;

    await query(
      `UPDATE events SET title = ?, slug = ?, description = ?, event_type = ?, venue_name = ?,
       address_line1 = ?, address_line2 = ?, city = ?, state = ?, country = ?, postal_code = ?,
       latitude = ?, longitude = ?, start_date = ?, end_date = ?, featured_image_url = ?, video_url = ?,
       moderation_status = ?
       WHERE id = ?`,
      [
        title || existingEvent[0].title,
        slug,
        description !== undefined ? description : existingEvent[0].description,
        eventType || existingEvent[0].event_type,
        venue?.name || existingEvent[0].venue_name,
        address?.line1 !== undefined ? address.line1 : existingEvent[0].address_line1,
        address?.line2 !== undefined ? address.line2 : existingEvent[0].address_line2,
        address?.city || existingEvent[0].city,
        address?.state || existingEvent[0].state,
        address?.country || existingEvent[0].country,
        address?.postalCode || existingEvent[0].postal_code,
        address?.latitude !== undefined ? address.latitude : existingEvent[0].latitude,
        address?.longitude !== undefined ? address.longitude : existingEvent[0].longitude,
        startDate || existingEvent[0].start_date,
        endDate || existingEvent[0].end_date,
        featuredImageUrl !== undefined ? featuredImageUrl : existingEvent[0].featured_image_url,
        videoUrl !== undefined ? videoUrl : existingEvent[0].video_url,
        // Reset to pending if artist updates, keep status if admin
        req.user.role === UserRole.ADMIN
          ? existingEvent[0].moderation_status
          : EventModerationStatus.PENDING,
        eventId,
      ]
    );

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      const maxOrder = await query(
        'SELECT MAX(sort_order) as max_order FROM event_media WHERE event_id = ?',
        [eventId]
      );
      let startOrder = (maxOrder[0]?.max_order || -1) + 1;

      for (const file of req.files) {
        const mediaType = file.mimetype.startsWith('video/')
          ? EventMediaType.VIDEO
          : EventMediaType.IMAGE;
        const filePath = file.path.replace(/\\/g, '/');

        await query(
          'INSERT INTO event_media (event_id, media_type, file_path, sort_order) VALUES (?, ?, ?, ?)',
          [eventId, mediaType, filePath, startOrder++]
        );
      }
    }

    let event = await query('SELECT * FROM events WHERE id = ?', [eventId]);
    event = transformImageUrls(event[0], 'featured_image_url', 'events/images');

    sendSuccess(res, event, 'Event updated successfully');
  })
);

// Get events by organization (for organization owners)
router.get(
  '/organization/:orgId',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const orgId = parseInt(req.params.orgId);
    const { page, limit, offset } = getPaginationParams(req.query.page, req.query.limit);

    // Verify organization ownership
    const org = await query('SELECT * FROM organizations WHERE id = ? AND owner_id = ?', [
      orgId,
      req.user.userId,
    ]);
    if (org.length === 0 && req.user.role !== UserRole.ADMIN) {
      throw new AppError('Organization not found or not authorized', 403);
    }

    // Get events with proper parameter types
    const queryStr = `SELECT e.*, o.name as organization_name
       FROM events e
       LEFT JOIN organizations o ON e.organization_id = o.id
       WHERE e.organization_id = ?
       ORDER BY e.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`;

    const events = await query(queryStr, [orgId]);

    const countResult = await query('SELECT COUNT(*) as total FROM events WHERE organization_id = ?', [
      orgId,
    ]);

    // Get tickets for each event
    for (let event of events) {
      const tickets = await query('SELECT * FROM event_tickets WHERE event_id = ?', [event.id]);
      event.tickets = tickets;
    }

    const transformedEvents = transformImageUrls(events, 'featured_image_url', 'events/images');

    sendPaginated(res, transformedEvents, page, limit, countResult[0].total);
  })
);

// Get my events (for organization owners - all events created by user)
router.get(
  '/my/events',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query.page, req.query.limit);

    const events = await query(
      `SELECT e.*, o.name as organization_name
       FROM events e
       LEFT JOIN organizations o ON e.organization_id = o.id
       WHERE e.created_by = ?
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.userId, limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) as total FROM events WHERE created_by = ?', [
      req.user.userId,
    ]);

    const transformedEvents = transformImageUrls(events, 'featured_image_url', 'events/images');

    sendPaginated(res, transformedEvents, page, limit, countResult[0].total);
  })
);

// Delete event
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const eventId = parseInt(req.params.id);

    const existingEvent = await query('SELECT * FROM events WHERE id = ?', [eventId]);
    if (existingEvent.length === 0) {
      throw new AppError('Event not found', 404);
    }

    if (
      req.user.role !== UserRole.ADMIN &&
      existingEvent[0].created_by !== req.user.userId
    ) {
      throw new AppError('Not authorized to delete this event', 403);
    }

    await query('UPDATE events SET is_active = FALSE WHERE id = ?', [eventId]);

    sendSuccess(res, null, 'Event deleted successfully');
  })
);

// ADMIN ROUTES - Event Moderation

// Get all events for moderation (admin only)
router.get(
  '/admin/moderation',
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query.page, req.query.limit);
    const { status } = req.query;

    let queryStr = `SELECT e.*, o.name as organization_name,
      u.email as creator_email, u.first_name as creator_first_name, u.last_name as creator_last_name,
      m.first_name as moderator_first_name, m.last_name as moderator_last_name
      FROM events e
      LEFT JOIN organizations o ON e.organization_id = o.id
      LEFT JOIN users u ON e.created_by = u.id
      LEFT JOIN users m ON e.moderated_by = m.id
      WHERE e.is_active = TRUE`;

    const params = [];

    if (status) {
      queryStr += ' AND e.moderation_status = ?';
      params.push(status);
    }

    queryStr += ' ORDER BY e.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const events = await query(queryStr, params);

    let countQuery = 'SELECT COUNT(*) as total FROM events WHERE is_active = TRUE';
    const countParams = [];

    if (status) {
      countQuery += ' AND moderation_status = ?';
      countParams.push(status);
    }

    const countResult = await query(countQuery, countParams);

    const transformedEvents = transformImageUrls(events, 'featured_image_url', 'events/images');

    sendPaginated(res, transformedEvents, page, limit, countResult[0].total);
  })
);

// Moderate event (approve/decline/remove)
router.post(
  '/admin/moderation/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const eventId = parseInt(req.params.id);
    const { action, comment } = req.body;

    if (!Object.values(EventModerationStatus).includes(action)) {
      throw new AppError('Invalid moderation action', 400);
    }

    const existingEvent = await query(
      `SELECT e.*, u.email as creator_email, u.first_name as creator_first_name
       FROM events e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = ?`,
      [eventId]
    );

    if (existingEvent.length === 0) {
      throw new AppError('Event not found', 404);
    }

    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      // Update event moderation status
      await connection.execute(
        `UPDATE events SET moderation_status = ?, moderation_comment = ?,
         moderated_by = ?, moderated_at = NOW() WHERE id = ?`,
        [action, comment || null, req.user.userId, eventId]
      );

      // Log moderation action
      await connection.execute(
        'INSERT INTO event_moderation_logs (event_id, moderator_id, action, comment) VALUES (?, ?, ?, ?)',
        [eventId, req.user.userId, action, comment || null]
      );

      await connection.commit();

      // Send notification email to event creator
      const moderatorName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Admin';

      await emailService.sendEventModerationNotification(
        {
          ...existingEvent[0],
          slug: existingEvent[0].slug,
        },
        action,
        comment,
        moderatorName
      );

      sendSuccess(res, null, `Event ${action} successfully`);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  })
);

// Get moderation history for an event
router.get(
  '/admin/moderation/:id/history',
  authenticate,
  authorize(UserRole.ADMIN),
  asyncHandler(async (req, res) => {
    const eventId = parseInt(req.params.id);

    const history = await query(
      `SELECT eml.*, u.first_name, u.last_name, u.email as moderator_email
       FROM event_moderation_logs eml
       LEFT JOIN users u ON eml.moderator_id = u.id
       WHERE eml.event_id = ?
       ORDER BY eml.created_at DESC`,
      [eventId]
    );

    sendSuccess(res, history);
  })
);

// Add ticket to cart
router.post(
  '/tickets/:ticketId/cart',
  authenticate,
  asyncHandler(async (req, res) => {
    const ticketId = parseInt(req.params.ticketId);
    const { quantity, deliveryMethod } = req.body;

    if (!quantity || quantity < 1) {
      throw new AppError('Valid quantity is required', 400);
    }

    const ticket = await query(
      'SELECT et.*, e.title as event_title FROM event_tickets et LEFT JOIN events e ON et.event_id = e.id WHERE et.id = ?',
      [ticketId]
    );

    if (ticket.length === 0) {
      throw new AppError('Ticket not found', 404);
    }

    if (ticket[0].quantity_available - ticket[0].quantity_sold < quantity) {
      throw new AppError('Not enough tickets available', 400);
    }

    // Validate delivery method
    if (deliveryMethod && !Object.values(TicketDeliveryMethod).includes(deliveryMethod)) {
      throw new AppError('Invalid delivery method', 400);
    }

    // Get or create cart
    let cart = await query('SELECT * FROM carts WHERE user_id = ?', [req.user.userId]);
    let cartId;

    if (cart.length > 0) {
      cartId = cart[0].id;
    } else {
      const result = await query('INSERT INTO carts (user_id) VALUES (?)', [req.user.userId]);
      cartId = result.insertId;
    }

    // Check if ticket already in cart
    const existing = await query(
      'SELECT * FROM event_ticket_cart_items WHERE cart_id = ? AND ticket_id = ?',
      [cartId, ticketId]
    );

    if (existing.length > 0) {
      await query(
        'UPDATE event_ticket_cart_items SET quantity = quantity + ? WHERE cart_id = ? AND ticket_id = ?',
        [quantity, cartId, ticketId]
      );
    } else {
      await query(
        'INSERT INTO event_ticket_cart_items (cart_id, ticket_id, quantity) VALUES (?, ?, ?)',
        [cartId, ticketId, quantity]
      );
    }

    sendSuccess(res, null, 'Ticket added to cart');
  })
);

// Get user bookings
router.get(
  '/bookings/my',
  authenticate,
  asyncHandler(async (req, res) => {
    const bookings = await query(
      `SELECT eb.*, e.title as event_title, e.start_date, e.venue_name, et.ticket_type
     FROM event_bookings eb
     LEFT JOIN events e ON eb.event_id = e.id
     LEFT JOIN event_tickets et ON eb.ticket_id = et.id
     WHERE eb.user_id = ? ORDER BY eb.created_at DESC`,
      [req.user.userId]
    );

    sendSuccess(res, bookings);
  })
);

export default router;
