# Database Schema Documentation

## Overview

The Art Fare database is designed to support a multi-vendor e-commerce platform for artists with additional features for events and blogging.

## Entity Relationship Diagram

### Core Entities

#### Users & Authentication
- **users**: Core user accounts (customers, artists, admins)
- **refresh_tokens**: JWT refresh tokens for authentication
- **password_resets**: Temporary tokens for password recovery
- **user_addresses**: Saved shipping and billing addresses

#### Organizations & Products
- **organizations**: Artist shops/organizations
- **shop_themes**: Custom branding for each shop
- **categories**: Product categorization (hierarchical)
- **products**: Items for sale
- **product_images**: Multiple images per product

#### Shopping & Orders
- **carts**: Shopping carts (user or session-based)
- **cart_items**: Items in carts
- **orders**: Purchase orders
- **order_items**: Individual items within orders

#### Community Features
- **blog_posts**: Art-related blog content
- **blog_comments**: Threaded conversations on posts
- **events**: Art events with location data
- **event_tickets**: Ticket types for events
- **event_bookings**: User bookings for events

## Key Relationships

### User Relationships
- One user can own multiple organizations (1:N)
- One user can have multiple orders (1:N)
- One user can have one active cart (1:1)
- One user can write multiple blog posts (1:N)
- One user can make multiple event bookings (1:N)

### Organization Relationships
- One organization has one theme (1:1)
- One organization has multiple products (1:N)
- One organization can host multiple events (1:N)

### Product Relationships
- One product belongs to one organization (N:1)
- One product can have multiple images (1:N)
- One product belongs to one category (N:1)
- Categories can be nested (self-referential)

### Order Relationships
- One order belongs to one user (N:1)
- One order can contain items from multiple organizations (N:N through order_items)
- Order items maintain snapshot of product info at purchase time

### Event Relationships
- One event can have multiple ticket types (1:N)
- One ticket type can have multiple bookings (1:N)
- Events are optionally linked to organizations

## User Roles

1. **Customer**: Can browse, purchase, and attend events
2. **Artist**: Can create organizations, manage products, and view sales
3. **Admin**: Full platform management capabilities

## Authentication Strategy

- JWT-based authentication with access and refresh tokens
- Support for email/password and Google OAuth
- Refresh tokens stored in database with expiration
- Password reset via email token

## Multi-vendor Support

The platform supports multiple independent artist shops:
- Each organization operates independently
- Customers can purchase from multiple shops in one order
- Order items track which organization each item belongs to
- Artists only see their own sales and products

## Indexing Strategy

Indexes are created on:
- Foreign keys for join performance
- Frequently searched fields (email, slug, status)
- Date fields for time-based queries
- Composite indexes where needed (organization_id + slug)

## Data Integrity

- Cascading deletes for dependent data
- SET NULL for optional relationships
- UNIQUE constraints on slugs and identifiers
- DEFAULT values for boolean flags and timestamps
