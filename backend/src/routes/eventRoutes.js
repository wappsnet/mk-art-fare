import { Router } from 'express';
import { query, getConnection } from '../config/database.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { UserRole, EventBookingStatus } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateSlug, generateBookingNumber, getPaginationParams, transformImageUrls } from '../utils/helpers.js';

const router = Router();

// Get all events
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query.page, req.query.limit);
    const { eventType, city, startDate } = req.query;

    let queryStr =
      'SELECT e.*, o.name as organization_name FROM events e LEFT JOIN organizations o ON e.organization_id = o.id WHERE e.is_active = TRUE';
    const params = [];

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
    events = transformImageUrls(events, 'featured_image_url', 'events');

    let countQuery = 'SELECT COUNT(*) as total FROM events WHERE is_active = TRUE';
    const countParams = [];

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

// Get event by slug
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const event = await query(
      'SELECT e.*, o.name as organization_name FROM events e LEFT JOIN organizations o ON e.organization_id = o.id WHERE e.slug = ? AND e.is_active = TRUE',
      [req.params.slug]
    );

    if (event.length === 0) {
      throw new AppError('Event not found', 404);
    }

    const tickets = await query('SELECT * FROM event_tickets WHERE event_id = ?', [event[0].id]);
    const transformedEvent = transformImageUrls(event[0], 'featured_image_url', 'events');

    sendSuccess(res, { ...transformedEvent, tickets });
  })
);

// Create event
router.post(
  '/',
  authenticate,
  authorize(UserRole.ARTIST, UserRole.ADMIN),
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
      tickets,
    } = req.body;

    if (organizationId) {
      const org = await query('SELECT * FROM organizations WHERE id = ? AND owner_id = ?', [
        organizationId,
        req.user.userId,
      ]);
      if (org.length === 0) {
        throw new AppError('Organization not found or not authorized', 403);
      }
    }

    const slug = generateSlug(title);

    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      const eventResult = await connection.execute(
        `INSERT INTO events (organization_id, title, slug, description, event_type, venue_name,
       address_line1, address_line2, city, state, country, postal_code, latitude, longitude,
       start_date, end_date, featured_image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          organizationId || null,
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
        ]
      );

      const eventId = eventResult[0].insertId;

      if (tickets && tickets.length > 0) {
        for (const ticket of tickets) {
          await connection.execute(
            'INSERT INTO event_tickets (event_id, ticket_type, price, quantity_available, description) VALUES (?, ?, ?, ?, ?)',
            [eventId, ticket.type, ticket.price, ticket.quantity, ticket.description || null]
          );
        }
      }

      await connection.commit();

      let event = await query('SELECT * FROM events WHERE id = ?', [eventId]);
      event = transformImageUrls(event[0], 'featured_image_url', 'events');
      sendSuccess(res, event, 'Event created successfully', 201);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  })
);

// Book event ticket
router.post(
  '/:eventId/book',
  authenticate,
  asyncHandler(async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    const { ticketId, quantity, attendeeInfo } = req.body;

    const ticket = await query('SELECT * FROM event_tickets WHERE id = ? AND event_id = ?', [
      ticketId,
      eventId,
    ]);

    if (ticket.length === 0) {
      throw new AppError('Ticket not found', 404);
    }

    if (ticket[0].quantity_available - ticket[0].quantity_sold < quantity) {
      throw new AppError('Not enough tickets available', 400);
    }

    const totalPrice = ticket[0].price * quantity;
    const bookingNumber = generateBookingNumber();

    const connection = await getConnection();

    try {
      await connection.beginTransaction();

      const bookingResult = await connection.execute(
        `INSERT INTO event_bookings (booking_number, event_id, ticket_id, user_id, quantity, total_price, status,
       attendee_name, attendee_email, attendee_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingNumber,
          eventId,
          ticketId,
          req.user.userId,
          quantity,
          totalPrice,
          EventBookingStatus.CONFIRMED,
          attendeeInfo.name,
          attendeeInfo.email,
          attendeeInfo.phone || null,
        ]
      );

      await connection.execute(
        'UPDATE event_tickets SET quantity_sold = quantity_sold + ? WHERE id = ?',
        [quantity, ticketId]
      );

      await connection.commit();

      const booking = await query('SELECT * FROM event_bookings WHERE id = ?', [
        bookingResult[0].insertId,
      ]);
      sendSuccess(res, booking[0], 'Booking confirmed', 201);
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
