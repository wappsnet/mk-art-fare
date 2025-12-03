import { Response, NextFunction } from 'express';
import { organizationService } from '../services/organizationService';
import { sendSuccess, sendPaginated } from '../utils/response';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { getPaginationParams } from '../utils/helpers';

export class OrganizationController {
  async createOrganization(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401);
      }

      const organization = await organizationService.createOrganization(
        req.user.userId,
        req.body
      );

      sendSuccess(res, organization, 'Organization created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getOrganization(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

  async getMyOrganizations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

  async updateOrganization(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

  async updateTheme(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

  async deleteOrganization(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

  async getAllOrganizations(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, offset } = getPaginationParams(req.query.page as string, req.query.limit as string);
      const search = req.query.search as string;

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
}

export const organizationController = new OrganizationController();
