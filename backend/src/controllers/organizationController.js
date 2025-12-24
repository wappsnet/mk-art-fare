import { organizationService } from '../services/organizationService.js';
import { sendSuccess, sendPaginated } from '../utils/response.js';
import { AppError } from '../middleware/errorHandler.js';
import { getPaginationParams } from '../utils/helpers.js';

export class OrganizationController {
  async createOrganization(req, res) {
    const organization = await organizationService.createOrganization(req.user.userId, req.body);

    sendSuccess(res, organization, 'Organization created successfully', 201);
  }

  async getOrganization(req, res) {
    const { slug } = req.params;
    const organization = await organizationService.getOrganizationBySlug(slug);

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    sendSuccess(res, organization);
  }

  async getOrganizationById(req, res) {
    const id = Number.parseInt(req.params.id);
    const organization = await organizationService.getOrganizationById(id);

    if (!organization) {
      throw new AppError('Organization not found', 404);
    }

    sendSuccess(res, organization);
  }

  async getMyOrganizations(req, res) {
    const organizations = await organizationService.getOrganizationsByOwner(req.user.userId);
    sendSuccess(res, organizations);
  }

  async updateOrganization(req, res) {
    const orgId = Number.parseInt(req.params.id);
    const organization = await organizationService.updateOrganization(
      orgId,
      req.user.userId,
      req.body
    );

    sendSuccess(res, organization, 'Organization updated successfully');
  }

  async updateTheme(req, res) {
    const orgId = Number.parseInt(req.params.id);
    const theme = await organizationService.updateOrganizationTheme(
      orgId,
      req.user.userId,
      req.body
    );

    sendSuccess(res, theme, 'Theme updated successfully');
  }

  async deleteOrganization(req, res) {
    const orgId = Number.parseInt(req.params.id);
    await organizationService.deleteOrganization(orgId, req.user.userId);

    sendSuccess(res, null, 'Organization deleted successfully');
  }

  async getAllOrganizations(req, res) {
    const { page, limit, offset } = getPaginationParams(req.query.page, req.query.limit);
    const search = req.query.search;

    const { organizations, total } = await organizationService.getAllOrganizations(
      page,
      limit,
      offset,
      search
    );

    sendPaginated(res, organizations, { page, limit, total });
  }

  async getOrganizationProducts(req, res) {
    const { slug } = req.params;
    const products = await organizationService.getOrganizationProducts(slug);

    sendSuccess(res, products);
  }
}

export const organizationController = new OrganizationController();
