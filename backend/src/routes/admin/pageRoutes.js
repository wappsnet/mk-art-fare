import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { UserRole } from '../../types/index.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { sendSuccess } from '../../utils/response.js';
import pageService from '../../services/pageService.js';

const router = Router();

/**
 * Admin page routes
 * All routes require authentication and admin role
 */

// All routes require admin authentication
router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

// Get all pages
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const pages = await pageService.getAllPages();
    sendSuccess(res, pages);
  })
);

// Get page by ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const pageId = Number.parseInt(req.params.id);
    const page = await pageService.getPageById(pageId);
    sendSuccess(res, page);
  })
);

// Create new page
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const page = await pageService.createPage(req.body);
    sendSuccess(res, page, 'Page created successfully', 201);
  })
);

// Update page
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const pageId = Number.parseInt(req.params.id);
    const page = await pageService.updatePage(pageId, req.body);
    sendSuccess(res, page, 'Page updated successfully');
  })
);

// Delete page
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const pageId = Number.parseInt(req.params.id);
    await pageService.deletePage(pageId);
    sendSuccess(res, null, 'Page deleted successfully');
  })
);

export default router;
