# Event Management System - Implementation Guide

## Overview

This document describes the comprehensive event management system with moderation, ticketing, and payment integration for the Art Fare platform.

## Features Implemented

### 1. Event Creation & Management

#### Organization Owners Can:
- Create events with full details (name, description, address, venue, dates)
- Upload images and videos (files or URLs)
- Add multiple media items per event
- Create both free and paid tickets
- Choose ticket delivery methods (virtual, physical delivery, pickup)
- View and manage their events
- Edit and update events (triggers re-moderation for non-admins)

#### Platform Super Admins Can:
- Create events (auto-approved)
- Access all events across the platform
- Moderate events (approve, decline, remove)
- Leave comments on moderation decisions
- View moderation history

### 2. Event Moderation Workflow

**Moderation Statuses:**
- `pending` - Newly created events awaiting approval
- `approved` - Events visible on public events page
- `declined` - Events rejected with moderator comment
- `removed` - Previously approved events removed by admin

**Moderation Features:**
- Admin-only moderation endpoints
- Moderation comments for feedback
- Automatic email notifications to event creators
- Complete moderation history log
- Re-moderation when organization owners update events

### 3. Event Media Management

**Supported Media Types:**
- Images: JPEG, JPG, PNG, GIF, WebP
- Videos: MP4, AVI, MOV, WMV, FLV, WebM, MKV

**Media Upload Options:**
- File uploads (10 files max per event)
- External URLs for images/videos
- Featured image for event listing
- Multiple images/videos per event with sort ordering

**Storage:**
- Images: `uploads/events/images/`
- Videos: `uploads/events/videos/`
- File size limits:
  - Images: 10MB
  - Videos: 100MB

### 4. Ticketing System

**Ticket Types:**
- Free tickets (price = 0)
- Paid tickets (any price)

**Ticket Delivery Methods:**
- **Virtual** - Email with QR code and ticket code
- **Physical Delivery** - Tickets mailed to address
- **Pickup** - Self-pickup at designated location
- **All** - Support all delivery methods

**Ticket Features:**
- Ticket type/name
- Price and quantity management
- Quantity tracking (available vs sold)
- Delivery method per ticket type
- Pickup location and instructions
- Description/details

### 5. Cart & Checkout Integration

**Cart Features:**
- Add event tickets to cart alongside products
- Quantity management
- Delivery method selection
- Combined checkout for products and tickets

**Checkout Process:**
1. User adds tickets to cart
2. Selects delivery method (virtual/delivery/pickup)
3. Provides delivery address if physical delivery
4. Proceeds through checkout
5. Receives email confirmation with ticket details

### 6. Email Notifications

**Event Ticket Email:**
- Sent after successful checkout/payment
- Includes virtual ticket code (if virtual delivery)
- QR code image (if available)
- Event details (date, venue, ticket type)
- Delivery information based on method
- Link to view tickets

**Moderation Notification Email:**
- Sent when event is approved/declined/removed
- Includes moderator comment
- Links to view event (if approved) or manage events
- Moderator name

**Email Templates Include:**
- Event confirmation with booking number
- Virtual ticket with QR code
- Pickup instructions
- Delivery address confirmation
- Moderation decisions with comments

### 7. Virtual Ticket Generation

**Auto-Generated for Virtual Delivery:**
- Unique ticket code (UUID format)
- QR code URL (placeholder - integrate QR generation library)
- Booking number for reference
- Email tracking (sent status and timestamp)

## Database Schema

### New Tables

#### `event_media`
Stores multiple images/videos per event
- Support for both file uploads and URLs
- Ordering for gallery display
- Media type classification

#### `event_ticket_cart_items`
Event tickets in shopping cart
- Links tickets to cart
- Quantity management

#### `order_event_items`
Event tickets in completed orders
- Order history tracking
- Delivery method tracking

#### `event_moderation_logs`
Complete moderation history
- All moderation actions logged
- Moderator details and comments
- Timestamp tracking

### Updated Tables

#### `events`
Added fields:
- `moderation_status` - Current approval status
- `moderation_comment` - Admin feedback
- `moderated_by` - Admin who reviewed
- `moderated_at` - Review timestamp
- `created_by` - Event creator
- `video_url` - External video link
- `video_file` - Uploaded video file

#### `event_tickets`
Added fields:
- `is_free` - Free vs paid flag
- `delivery_method` - How tickets are delivered
- `pickup_location` - Where to collect tickets
- `pickup_instructions` - Pickup details

#### `event_bookings`
Added fields:
- `delivery_method` - Selected delivery option
- `delivery_address_*` - Physical delivery address
- `pickup_location` - Selected pickup point
- `virtual_ticket_code` - Unique ticket identifier
- `qr_code_url` - QR code image path
- `email_sent` - Email delivery status
- `email_sent_at` - When email was sent

## API Endpoints

### Public Endpoints

```
GET /api/events
- Get all approved events
- Query params: eventType, city, startDate, page, limit

GET /api/events/:slug
- Get single approved event with tickets and media
```

### Organization Owner Endpoints

```
POST /api/events
- Create new event (requires authentication)
- Multipart form data for file uploads
- Auto-pending for artists, auto-approved for admins

PUT /api/events/:id
- Update existing event
- Requires ownership or admin role
- Triggers re-moderation for artists

GET /api/events/my/events
- Get all events created by current user

DELETE /api/events/:id
- Soft delete event (sets is_active = false)
```

### Admin Moderation Endpoints

```
GET /api/events/admin/moderation
- Get all events for moderation
- Query params: status, page, limit

POST /api/events/admin/moderation/:id
- Moderate event (approve/decline/remove)
- Body: { action, comment }
- Sends email notification

GET /api/events/admin/moderation/:id/history
- Get moderation history for specific event
```

### Ticketing Endpoints

```
POST /api/events/tickets/:ticketId/cart
- Add event ticket to cart
- Body: { quantity, deliveryMethod }

GET /api/events/bookings/my
- Get user's event bookings
```

## File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── eventMulter.js          # Event media upload configuration
│   ├── routes/
│   │   ├── eventRoutes.js          # Updated with moderation & media
│   │   └── cartRoutes.js           # Updated with event tickets
│   ├── services/
│   │   └── emailService.js         # Updated with ticket & moderation emails
│   └── types/
│       └── index.js                # Added event-related enums
├── database/
│   └── migrations/
│       └── 002_event_moderation_and_ticketing.sql
```

## Implementation Steps

### Backend Completed ✓
1. Database schema migration created
2. Event multer configuration for media uploads
3. Updated type definitions with new enums
4. Enhanced email service with ticket and moderation templates
5. Comprehensive event routes with moderation workflow
6. Cart integration for event tickets
7. Admin moderation endpoints
8. Media upload handling (files + URLs)

### Next Steps - Frontend Implementation

#### 1. Events Page (Public)
```
frontend/src/pages/Events.jsx
- Display grid of approved events
- Filter by type, city, date
- Event cards with featured image
- Link to event detail page
```

#### 2. Event Detail Page
```
frontend/src/pages/EventDetail.jsx
- Full event information
- Image/video gallery
- Ticket selection
- Add to cart functionality
- Delivery method selection
```

#### 3. Organization Dashboard
```
frontend/src/pages/org/MyEvents.jsx
- List creator's events
- Show moderation status
- Create/edit event forms
- Upload media
- Manage tickets
```

#### 4. Admin Moderation Dashboard
```
frontend/src/pages/admin/EventModeration.jsx
- List all events by status
- Filter pending/approved/declined
- Approve/decline/remove actions
- Add moderation comments
- View moderation history
```

#### 5. Ticket Management
```
frontend/src/pages/MyTickets.jsx
- View purchased tickets
- Display virtual ticket codes
- Show QR codes
- Booking details
- Delivery status
```

## Testing Checklist

### Event Creation
- [ ] Organization owner can create event
- [ ] Admin can create auto-approved event
- [ ] Media uploads (files) work
- [ ] Media URLs can be added
- [ ] Free tickets can be created
- [ ] Paid tickets can be created
- [ ] Multiple delivery methods work

### Moderation
- [ ] New events start as pending
- [ ] Admin can approve events
- [ ] Admin can decline with comment
- [ ] Admin can remove events
- [ ] Moderation emails are sent
- [ ] Moderation history is logged
- [ ] Updated events require re-moderation

### Ticketing
- [ ] Tickets can be added to cart
- [ ] Cart shows both products and tickets
- [ ] Checkout processes tickets
- [ ] Virtual tickets generate codes
- [ ] Email sends with ticket details
- [ ] Delivery options work correctly

### Permissions
- [ ] Only owners can edit their events
- [ ] Only admins can moderate
- [ ] Public can only see approved events
- [ ] Authentication required for tickets

## Environment Variables

No new environment variables required. Uses existing:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` for emails
- `FRONTEND_URL` for email links

## Security Considerations

1. **File Uploads**
   - File type validation (images/videos only)
   - File size limits enforced
   - Sanitized file names

2. **Authorization**
   - Ownership checks on update/delete
   - Admin-only moderation endpoints
   - User must be authenticated for tickets

3. **Input Validation**
   - Validate moderation status values
   - Validate delivery methods
   - Check ticket availability

4. **SQL Injection Prevention**
   - Parameterized queries throughout
   - Input sanitization

## Future Enhancements

1. **QR Code Generation**
   - Integrate QR code library (e.g., `qrcode`, `node-qrcode`)
   - Generate unique QR codes on booking
   - Store QR code images

2. **Payment Integration**
   - Stripe/PayPal for paid tickets
   - Payment status tracking
   - Refund handling

3. **Advanced Features**
   - Ticket transfers
   - Event capacity management
   - Waitlist functionality
   - Early bird pricing
   - Discount codes
   - Seating selection

4. **Notifications**
   - SMS notifications
   - Event reminders
   - Ticket delivery tracking

5. **Analytics**
   - Event attendance tracking
   - Ticket sales reports
   - Revenue analytics
   - Popular events dashboard

## Migration Instructions

To apply the database changes:

```bash
# Using MySQL client
mysql -u your_user -p art_fare_db < database/migrations/002_event_moderation_and_ticketing.sql

# Or using the migrate script (if configured)
npm run migrate
```

## Support

For questions or issues with the event system implementation, refer to:
- Database schema: `/database/schema.sql` and migration file
- API routes: `/backend/src/routes/eventRoutes.js`
- Email templates: `/backend/src/services/emailService.js`
- Type definitions: `/backend/src/types/index.js`
