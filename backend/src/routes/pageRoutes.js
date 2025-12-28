import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';
import pageService from '../services/pageService.js';

const router = Router();

/**
 * Public page routes
 */

// Get page by slug
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const page = await pageService.getPageBySlug(req.params.slug);
    sendSuccess(res, page);
  })
);

export default router;
