import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import blogService from '../services/blogService.js';

const router = Router();

// Get all published posts
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { posts, total, page, limit } = await blogService.getPublishedPosts(req.query);
    sendPaginated(res, posts, page, limit, total);
  })
);

// Get post by slug
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const post = await blogService.getPostBySlug(req.params.slug);
    sendSuccess(res, post);
  })
);

// Create post
router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const post = await blogService.createPost(req.user.userId, req.body);
    sendSuccess(res, post, 'Post created successfully', 201);
  })
);

// Update post
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const postId = Number.parseInt(req.params.id);
    const updated = await blogService.updatePost(postId, req.user.userId, req.body);
    sendSuccess(res, updated, 'Post updated successfully');
  })
);

// Delete post
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const postId = Number.parseInt(req.params.id);
    await blogService.deletePost(postId, req.user.userId);
    sendSuccess(res, null, 'Post deleted successfully');
  })
);

// Add comment
router.post(
  '/:postId/comments',
  authenticate,
  asyncHandler(async (req, res) => {
    const postId = Number.parseInt(req.params.postId);
    const comment = await blogService.addComment(
      postId,
      req.user.userId,
      req.body.content,
      req.body.parentId
    );
    sendSuccess(res, comment, 'Comment added successfully', 201);
  })
);

export default router;
