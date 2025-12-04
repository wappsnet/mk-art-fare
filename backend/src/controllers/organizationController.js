import { organizationService } from '../services/organizationService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';
import { getPaginationParams } from '../utils/helpers.js';

export class OrganizationController {
  async createOrganization(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const organization = await organizationService.createOrganization(req.user.userId, req.body);

      sendSuccess(res, organization, 'Organization created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getOrganization(req, res, next) {
    try {
      const { slug } = req.params;
      const organization = await organizationService.getOrganizationBySlug(slug);

      if (!organization) {
        throw new AppError('Organization not found', 404);
      }

      sendSuccess(res, organization);
    } catch (error) {
      next(error);
    }
  }

  async getOrganizationById(req, res, next) {
    try {
      const id = parseInt(req.params.id);
      const organization = await organizationService.getOrganizationById(id);

      if (!organization) {
        throw new AppError('Organization not found', 404);
      }

      sendSuccess(res, organization);
    } catch (error) {
      next(error);
    }
  }

  async getMyOrganizations(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const organizations = await organizationService.getOrganizationsByOwner(req.user.userId);
      sendSuccess(res, organizations);
    } catch (error) {
      next(error);
    }
  }

  async updateOrganization(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const orgId = parseInt(req.params.id);
      const organization = await organizationService.updateOrganization(
        orgId,
        req.user.userId,
        req.body
      );

      sendSuccess(res, organization, 'Organization updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateTheme(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const orgId = parseInt(req.params.id);
      const theme = await organizationService.updateOrganizationTheme(
        orgId,
        req.user.userId,
        req.body
      );

      sendSuccess(res, theme, 'Theme updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteOrganization(req, res, next) {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const orgId = parseInt(req.params.id);
      await organizationService.deleteOrganization(orgId, req.user.userId);

      sendSuccess(res, null, 'Organization deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllOrganizations(req, res, next) {
    try {
      const { page, limit, offset } = getPaginationParams(req.query.page, req.query.limit);
      const search = req.query.search;

      const { organizations, total } = await organizationService.getAllOrganizations(
        page,
        limit,
        offset,
        search
      );

      sendPaginated(res, organizations, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  async getOrganizationProducts(req, res, next) {
    try {
      const { slug } = req.params;
      const products = await organizationService.getOrganizationProducts(slug);

      sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  }
}

export const organizationController = new OrganizationController();
