import { Router } from 'express';
import { query } from '../config/database';
import { authenticate, optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AuthRequest, BlogPostStatus } from '../types';
import { AppError } from '../middleware/errorHandler';
import { generateSlug, getPaginationParams } from '../utils/helpers';

const router = Router();

// Get all published posts
router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query.page as string, req.query.limit as string);

  const posts: any = await query(
    `SELECT bp.*, u.first_name, u.last_name, u.avatar_url
     FROM blog_posts bp
     LEFT JOIN users u ON bp.author_id = u.id
     WHERE bp.status = ? ORDER BY bp.published_at DESC LIMIT ? OFFSET ?`,
    [BlogPostStatus.PUBLISHED, limit, offset]
  );

  const countResult: any = await query('SELECT COUNT(*) as total FROM blog_posts WHERE status = ?', [BlogPostStatus.PUBLISHED]);

  sendPaginated(res, posts, page, limit, countResult[0].total);
}));

// Get post by slug
router.get('/:slug', asyncHandler(async (req, res) => {
  const post: any = await query(
    `SELECT bp.*, u.first_name, u.last_name, u.avatar_url
     FROM blog_posts bp
     LEFT JOIN users u ON bp.author_id = u.id
     WHERE bp.slug = ? AND bp.status = ?`,
    [req.params.slug, BlogPostStatus.PUBLISHED]
  );

  if (post.length === 0) {
    throw new AppError('Post not found', 404);
  }

  await query('UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?', [post[0].id]);

  const comments: any = await query(
    `SELECT bc.*, u.first_name, u.last_name, u.avatar_url
     FROM blog_comments bc
     LEFT JOIN users u ON bc.user_id = u.id
     WHERE bc.post_id = ? AND bc.is_approved = TRUE ORDER BY bc.created_at DESC`,
    [post[0].id]
  );

  sendSuccess(res, { ...post[0], comments });
}));

// Create post
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const { title, content, excerpt, featuredImageUrl, status } = req.body;

  const slug = generateSlug(title);

  const result: any = await query(
    `INSERT INTO blog_posts (author_id, title, slug, content, excerpt, featured_image_url, status, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user!.userId, title, slug, content, excerpt || null, featuredImageUrl || null, status || BlogPostStatus.DRAFT, status === BlogPostStatus.PUBLISHED ? new Date() : null]
  );

  const post: any = await query('SELECT * FROM blog_posts WHERE id = ?', [result.insertId]);
  sendSuccess(res, post[0], 'Post created successfully', 201);
}));

// Update post
router.patch('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const postId = parseInt(req.params.id);

  const post: any = await query('SELECT * FROM blog_posts WHERE id = ? AND author_id = ?', [postId, req.user!.userId]);

  if (post.length === 0) {
    throw new AppError('Post not found or not authorized', 404);
  }

  const updates: string[] = [];
  const values: any[] = [];
  const { title, content, excerpt, featuredImageUrl, status } = req.body;

  if (title !== undefined) {
    updates.push('title = ?, slug = ?');
    values.push(title, generateSlug(title));
  }
  if (content !== undefined) {
    updates.push('content = ?');
    values.push(content);
  }
  if (excerpt !== undefined) {
    updates.push('excerpt = ?');
    values.push(excerpt);
  }
  if (featuredImageUrl !== undefined) {
    updates.push('featured_image_url = ?');
    values.push(featuredImageUrl);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
    if (status === BlogPostStatus.PUBLISHED && !post[0].published_at) {
      updates.push('published_at = ?');
      values.push(new Date());
    }
  }

  if (updates.length > 0) {
    values.push(postId);
    await query(`UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`, values);
  }

  const updated: any = await query('SELECT * FROM blog_posts WHERE id = ?', [postId]);
  sendSuccess(res, updated[0], 'Post updated successfully');
}));

// Delete post
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const postId = parseInt(req.params.id);

  const post: any = await query('SELECT * FROM blog_posts WHERE id = ? AND author_id = ?', [postId, req.user!.userId]);

  if (post.length === 0) {
    throw new AppError('Post not found or not authorized', 404);
  }

  await query('DELETE FROM blog_posts WHERE id = ?', [postId]);
  sendSuccess(res, null, 'Post deleted successfully');
}));

// Add comment
router.post('/:postId/comments', authenticate, asyncHandler(async (req: AuthRequest, res) => {
  const postId = parseInt(req.params.postId);
  const { content, parentId } = req.body;

  const post: any = await query('SELECT * FROM blog_posts WHERE id = ?', [postId]);

  if (post.length === 0) {
    throw new AppError('Post not found', 404);
  }

  const result: any = await query(
    'INSERT INTO blog_comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)',
    [postId, req.user!.userId, parentId || null, content]
  );

  const comment: any = await query('SELECT * FROM blog_comments WHERE id = ?', [result.insertId]);
  sendSuccess(res, comment[0], 'Comment added successfully', 201);
}));

export default router;
