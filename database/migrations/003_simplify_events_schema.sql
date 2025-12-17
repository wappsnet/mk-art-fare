-- Simplify Events Schema Migration
-- Remove event moderation workflow, ticketing, and booking functionality
-- Keep only: events list (approved only), event detail, and admin creation

-- Drop tables that are no longer needed
DROP TABLE IF EXISTS event_moderation_logs;
DROP TABLE IF EXISTS order_event_items;
DROP TABLE IF EXISTS event_bookings;
DROP TABLE IF EXISTS event_ticket_cart_items;
DROP TABLE IF EXISTS event_tickets;
DROP TABLE IF EXISTS event_media;

-- Remove unnecessary columns from events table
ALTER TABLE events
DROP COLUMN IF EXISTS moderation_comment,
DROP COLUMN IF EXISTS moderated_by,
DROP COLUMN IF EXISTS moderated_at,
DROP COLUMN IF EXISTS video_url,
DROP COLUMN IF EXISTS video_file;

-- Keep moderation_status and created_by columns as they are still useful
-- moderation_status: to filter approved events (admin-created events are auto-approved)
-- created_by: to track who created the event

-- Update existing events to have approved status if they don't already
UPDATE events SET moderation_status = 'approved' WHERE moderation_status IS NULL;
