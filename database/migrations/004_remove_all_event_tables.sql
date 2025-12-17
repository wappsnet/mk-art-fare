-- Remove All Event-Related Tables and Data
-- This migration completely removes all event functionality from the database

-- Drop all event-related tables (in correct order to respect foreign keys)
DROP TABLE IF EXISTS event_moderation_logs;
DROP TABLE IF EXISTS order_event_items;
DROP TABLE IF EXISTS event_bookings;
DROP TABLE IF EXISTS event_ticket_cart_items;
DROP TABLE IF EXISTS event_tickets;
DROP TABLE IF EXISTS event_media;
DROP TABLE IF EXISTS events;

-- Note: This is a destructive migration that will permanently delete all event data
-- Make sure to backup your database before running this migration if you might need the data in the future
