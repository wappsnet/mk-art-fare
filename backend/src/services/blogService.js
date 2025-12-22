import { query } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateSlug, getPaginationParams, transformImageUrls } from '../utils/helpers.js';
import { BlogPostStatus } from '../types/index.js';
import ownershipService from './ownershipService.js';
import { ensureFound } from '../utils/validators.js';

/**
 * Blog Service
 * Handles blog posts and comments
 * Extracts business logic from blogRoutes.js (209 lines → ~80 lines)
 */

class BlogService {
  /**
   * Get all published blog posts with pagination
   *
   * @param {Object} pagination - Pagination params { page, limit }
   * @returns {Promise<Object>} { posts, total, page, limit }
   */
  async getPublishedPosts(pagination = {}) {
    const { page, limit, offset } = getPaginationParams(pagination.page, pagination.limit);

    // Ensure limit and offset are valid integers
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

    return {
      posts,
      total: countResult[0].total,
      page,
      limit,
    };
  }

  /**
   * Get blog post by slug with comments
   *
   * @param {string} slug - Post slug
   * @returns {Promise<Object>} Post with comments
   * @throws {AppError} If post not found
   */
  async getPostBySlug(slug) {
    const post = await query(
      `SELECT bp.*, u.first_name, u.last_name, u.avatar_url
       FROM blog_posts bp
       LEFT JOIN users u ON bp.author_id = u.id
       WHERE bp.slug = ? AND bp.status = ?`,
      [slug, BlogPostStatus.PUBLISHED]
    );

    ensureFound(post, 'Post');

    // Increment view count
    await this.incrementViewCount(post[0].id);

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

    return { ...transformedPost, comments };
  }

  /**
   * Create a blog post
   *
   * @param {number} userId - Author user ID
   * @param {Object} data - Post data { title, content, excerpt, featuredImageUrl, status }
   * @returns {Promise<Object>} Created post
   */
  async createPost(userId, data) {
    const { title, content, excerpt, featuredImageUrl, status } = data;

    const slug = generateSlug(title);

    const result = await query(
      `INSERT INTO blog_posts (author_id, title, slug, content, excerpt, featured_image_url, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        title,
        slug,
        content,
        excerpt || null,
        featuredImageUrl || null,
        status || BlogPostStatus.DRAFT,
        status === BlogPostStatus.PUBLISHED ? new Date() : null,
      ]
    );

    const post = await query('SELECT * FROM blog_posts WHERE id = ?', [result.insertId]);
    return transformImageUrls(post[0], 'featured_image_url', 'blog');
  }

  /**
   * Update a blog post
   *
   * @param {number} postId - Post ID
   * @param {number} userId - User ID (for ownership verification)
   * @param {Object} data - Updated post data
   * @returns {Promise<Object>} Updated post
   * @throws {AppError} If post not found or user not authorized
   */
  async updatePost(postId, userId, data) {
    // Verify ownership
    await ownershipService.verifyBlogPostOwnership(postId, userId);

    const post = await query('SELECT * FROM blog_posts WHERE id = ?', [postId]);

    const updates = [];
    const values = [];
    const { title, content, excerpt, featuredImageUrl, status } = data;

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
      // Set published_at if publishing for the first time
      if (status === BlogPostStatus.PUBLISHED && !post[0].published_at) {
        updates.push('published_at = ?');
        values.push(new Date());
      }
    }

    if (updates.length > 0) {
      values.push(postId);
      await query(`UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    const updated = await query('SELECT * FROM blog_posts WHERE id = ?', [postId]);
    return transformImageUrls(updated[0], 'featured_image_url', 'blog');
  }

  /**
   * Delete a blog post
   *
   * @param {number} postId - Post ID
   * @param {number} userId - User ID (for ownership verification)
   * @returns {Promise<void>}
   * @throws {AppError} If post not found or user not authorized
   */
  async deletePost(postId, userId) {
    // Verify ownership
    await ownershipService.verifyBlogPostOwnership(postId, userId);

    await query('DELETE FROM blog_posts WHERE id = ?', [postId]);
  }

  /**
   * Add a comment to a blog post
   *
   * @param {number} postId - Post ID
   * @param {number} userId - Commenter user ID
   * @param {string} content - Comment content
   * @param {number|null} parentId - Parent comment ID (for replies)
   * @returns {Promise<Object>} Created comment
   * @throws {AppError} If post not found
   */
  async addComment(postId, userId, content, parentId = null) {
    const post = await query('SELECT * FROM blog_posts WHERE id = ?', [postId]);
    ensureFound(post, 'Post');

    const result = await query(
      'INSERT INTO blog_comments (post_id, user_id, parent_id, content) VALUES (?, ?, ?, ?)',
      [postId, userId, parentId || null, content]
    );

    const comment = await query('SELECT * FROM blog_comments WHERE id = ?', [result.insertId]);
    return comment[0];
  }

  /**
   * Increment post view count
   *
   * @param {number} postId - Post ID
   * @returns {Promise<void>}
   */
  async incrementViewCount(postId) {
    await query('UPDATE blog_posts SET view_count = view_count + 1 WHERE id = ?', [postId]);
  }

  /**
   * Get comments for a post
   *
   * @param {number} postId - Post ID
   * @param {boolean} approvedOnly - Only get approved comments
   * @returns {Promise<Array>} Array of comments
   */
  async getPostComments(postId, approvedOnly = true) {
    const whereClause = approvedOnly
      ? 'WHERE bc.post_id = ? AND bc.is_approved = TRUE'
      : 'WHERE bc.post_id = ?';

    const comments = await query(
      `SELECT bc.*, u.first_name, u.last_name, u.avatar_url
       FROM blog_comments bc
       LEFT JOIN users u ON bc.user_id = u.id
       ${whereClause} ORDER BY bc.created_at DESC`,
      [postId]
    );

    return transformImageUrls(comments, 'avatar_url', 'users');
  }

  /**
   * Get user's own blog posts (all statuses)
   *
   * @param {number} userId - Author user ID
   * @param {Object} pagination - Pagination params
   * @returns {Promise<Object>} { posts, total, page, limit }
   */
  async getUserPosts(userId, pagination = {}) {
    const { page, limit, offset } = getPaginationParams(pagination.page, pagination.limit);

    const validLimit = Math.floor(Number(limit)) || 10;
    const validOffset = Math.floor(Number(offset)) || 0;

    let posts = await query(
      `SELECT * FROM blog_posts
       WHERE author_id = ?
       ORDER BY created_at DESC
       LIMIT ${validLimit} OFFSET ${validOffset}`,
      [userId]
    );

    posts = transformImageUrls(posts, 'featured_image_url', 'blog');

    const countResult = await query(
      'SELECT COUNT(*) as total FROM blog_posts WHERE author_id = ?',
      [userId]
    );

    return {
      posts,
      total: countResult[0].total,
      page,
      limit,
    };
  }

  /**
   * Approve a comment (admin function)
   *
   * @param {number} commentId - Comment ID
   * @returns {Promise<Object>} Updated comment
   */
  async approveComment(commentId) {
    await query('UPDATE blog_comments SET is_approved = TRUE WHERE id = ?', [commentId]);
    const comment = await query('SELECT * FROM blog_comments WHERE id = ?', [commentId]);
    return comment[0];
  }

  /**
   * Delete a comment
   *
   * @param {number} commentId - Comment ID
   * @param {number} userId - User ID (comment author or post author)
   * @returns {Promise<void>}
   * @throws {AppError} If not authorized
   */
  async deleteComment(commentId, userId) {
    const comment = await query(
      `SELECT bc.*, bp.author_id as post_author_id
       FROM blog_comments bc
       LEFT JOIN blog_posts bp ON bc.post_id = bp.id
       WHERE bc.id = ?`,
      [commentId]
    );

    ensureFound(comment, 'Comment');

    // User can delete if they're the comment author or the post author
    if (comment[0].user_id !== userId && comment[0].post_author_id !== userId) {
      throw new AppError('Not authorized to delete this comment', 403);
    }

    await query('DELETE FROM blog_comments WHERE id = ?', [commentId]);
  }
}

export default new BlogService();
