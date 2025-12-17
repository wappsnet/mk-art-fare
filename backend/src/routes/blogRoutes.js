import { Router } from 'express';
import { query } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { BlogPostStatus } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateSlug, getPaginationParams, transformImageUrls } from '../utils/helpers.js';

const router = Router();

// Get all published posts
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { page, limit, offset } = getPaginationParams(req.query.page, req.query.limit);

    // Ensure limit and offset are valid integers (safe for string interpolation)
    const validLimit = Math.floor(Number(limit)) || 10;
    const validOffset = Math.floor(Number(offset)) || 0;

    let posts = await query(
      `SELECT bp.*, u.first_name, u.last_name, u.avatar_url
     FROM blog_posts bp
     LEFT JOIN users u ON bp.author_id = u.id
     WHERE bp.status = ? ORDER BY bp.published_at DESC LIMIT ${validLimit} OFFSET ${validOffset}`,
      [BlogPostStatus.PUBLISHED]
    );

    // Transform image URLs
    posts = transformImageUrls(posts, { featured_image_url: 'blog', avatar_url: 'users' });

    const countResult = await query('SELECT COUNT(*) as total FROM blog_posts WHERE status = ?', [
      BlogPostStatus.PUBLISHED,
    ]);

    sendPaginated(res, posts, page, limit, countResult[0].total);
  })
);

// Get post by slug
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const post = await query(
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

    let comments = await query(
      `SELECT bc.*, u.first_name, u.last_name, u.avatar_url
     FROM blog_comments bc
     LEFT JOIN users u ON bc.user_id = u.id
     WHERE bc.post_id = ? AND bc.is_approved = TRUE ORDER BY bc.created_at DESC`,
      [post[0].id]
    );

    // Transform image URLs
    const transformedPost = transformImageUrls(post[0], {
      featured_image_url: 'blog',
      avatar_url: 'users',
    });
    comments = transformImageUrls(comments, 'avatar_url', 'users');

    sendSuccess(res, { ...transformedPost, comments });
  })
);

// Create post
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const { title, content, excerpt, featuredImageUrl, status } = req.body;

    const slug = generateSlug(title);

    const result = await query(
      `INSERT INTO blog_posts (author_id, title, slug, content, excerpt, featured_image_url, status, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.userId,
        title,
        slug,
        content,
        excerpt || null,
        featuredImageUrl || null,
        status || BlogPostStatus.DRAFT,
        status === BlogPostStatus.PUBLISHED ? new Date() : null,
      ]
    );

    let post = await query('SELECT * FROM blog_posts WHERE id = ?', [result.insertId]);
    post = transformImageUrls(post[0], 'featured_image_url', 'blog');
    sendSuccess(res, post, 'Post created successfully', 201);
  })
);

// Update post
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const postId = Number.parseInt(req.params.id);

    const post = await query('SELECT * FROM blog_posts WHERE id = ? AND author_id = ?', [
      postId,
      req.user.userId,
    ]);

    if (post.length === 0) {
      throw new AppError('Post not found or not authorized', 404);
    }

    const updates = [];
    const values = [];
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

    let updated = await query('SELECT * FROM blog_posts WHERE id = ?', [postId]);
    updated = transformImageUrls(updated[0], 'featured_image_url', 'blog');
    sendSuccess(res, updated, 'Post updated successfully');
  })
);

// Delete post
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const postId = Number.parseInt(req.params.id);

    const post = await query('SELECT * FROM blog_posts WHERE id = ? AND author_id = ?', [
      postId,
      req.user.userId,
    ]);

    if (post.length === 0) {
      throw new AppError('Post not found or not authorized', 404);
    }

    await query('DELETE FROM blog_posts WHERE id = ?', [postId]);
    sendSuccess(res, null, 'Post deleted successfully');
  })
);

// Add comment
router.post(
  '/:postId/comments',
  authenticate,
  asyncHandler(async (req, res) => {
    const postId = Number.parseInt(req.params.postId);
    const { content, parentId } = req.body;

    const post = await query('SELECT * FROM blog_posts WHERE id = ?', [postId]);

    if (post.length === 0) {
      throw new AppError('Post not found', 404);
    }

    const result = await query(
      'INSERT INTO blog_comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)',
      [postId, req.user.userId, parentId || null, content]
    );

    const comment = await query('SELECT * FROM blog_comments WHERE id = ?', [result.insertId]);
    sendSuccess(res, comment[0], 'Comment added successfully', 201);
  })
);

export default router;
