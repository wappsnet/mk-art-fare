import { query } from '../../config/database.js';
import { AppError, asyncHandler } from '../../middleware/errorHandler.js';

/**
 * Moderate an organization (approve/decline)
 * PATCH /api/admin/organizations/:id/moderate
 */
export const moderateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const userId = req.user.userId;

  // Validate status
  if (!['approved', 'declined'].includes(status)) {
    throw new AppError('Invalid moderation status', 400);
  }

  // Check if organization exists
  const orgResult = await query('SELECT * FROM organizations WHERE id = ?', [id]);

  if (orgResult.length === 0) {
    throw new AppError('Organization not found', 404);
  }

  // Update moderation status
  await query(
    `UPDATE organizations
     SET moderation_status = ?,
         moderation_note = ?,
         moderated_by = ?,
         moderated_at = NOW()
     WHERE id = ?`,
    [status, note || null, userId, id]
  );

  // Get updated organization
  const updated = await query('SELECT * FROM organizations WHERE id = ?', [id]);

  res.json({
    success: true,
    data: updated[0],
    message: `Organization ${status} successfully`,
  });
});

/**
 * Moderate a product (approve/decline)
 * PATCH /api/admin/products/:id/moderate
 */
export const moderateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const userId = req.user.userId;

  // Validate status
  if (!['approved', 'declined'].includes(status)) {
    throw new AppError('Invalid moderation status', 400);
  }

  // Check if product exists
  const productResult = await query('SELECT * FROM products WHERE id = ?', [id]);

  if (productResult.length === 0) {
    throw new AppError('Product not found', 404);
  }

  // Update moderation status
  await query(
    `UPDATE products
     SET moderation_status = ?,
         moderation_note = ?,
         moderated_by = ?,
         moderated_at = NOW()
     WHERE id = ?`,
    [status, note || null, userId, id]
  );

  // Get updated product
  const updated = await query('SELECT * FROM products WHERE id = ?', [id]);

  res.json({
    success: true,
    data: updated[0],
    message: `Product ${status} successfully`,
  });
});

/**
 * Moderate an event (approve/decline)
 * PATCH /api/admin/events/:id/moderate
 */
export const moderateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const userId = req.user.userId;

  // Validate status
  if (!['approved', 'declined'].includes(status)) {
    throw new AppError('Invalid moderation status', 400);
  }

  // Check if event exists
  const eventResult = await query('SELECT * FROM events WHERE id = ?', [id]);

  if (eventResult.length === 0) {
    throw new AppError('Event not found', 404);
  }

  // Update moderation status
  await query(
    `UPDATE events
     SET moderation_status = ?,
         moderation_comment = ?,
         moderated_by = ?,
         moderated_at = NOW()
     WHERE id = ?`,
    [status, note || null, userId, id]
  );

  // Get updated event
  const updated = await query('SELECT * FROM events WHERE id = ?', [id]);

  res.json({
    success: true,
    data: updated[0],
    message: `Event ${status} successfully`,
  });
});
