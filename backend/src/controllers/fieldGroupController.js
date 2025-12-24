import { fieldGroupService } from '../services/fieldGroupService.js';
import { fieldDefinitionService } from '../services/fieldDefinitionService.js';
import { sendSuccess } from '../utils/response.js';

export const fieldGroupController = {
  async createFieldGroup(req, res) {
    const group = await fieldGroupService.create(req.body.organizationId, req.body);
    sendSuccess(res, group, 201);
  },

  async getFieldGroups(req, res) {
    const { organizationId, includeFields } = req.query;
    const groups = await fieldGroupService.getByOrganization(
      Number.parseInt(organizationId),
      includeFields === 'true'
    );
    sendSuccess(res, groups);
  },

  async getFieldGroupById(req, res) {
    const group = await fieldGroupService.getById(Number.parseInt(req.params.id));
    const fields = await fieldDefinitionService.getByFieldGroup(group.id);
    sendSuccess(res, { ...group, fields });
  },

  async updateFieldGroup(req, res) {
    const group = await fieldGroupService.update(Number.parseInt(req.params.id), req.body);
    sendSuccess(res, group);
  },

  async deleteFieldGroup(req, res) {
    await fieldGroupService.delete(Number.parseInt(req.params.id));
    sendSuccess(res, { message: 'Field group deleted successfully' });
  },

  async createFieldDefinition(req, res) {
    const field = await fieldDefinitionService.create(Number.parseInt(req.params.id), req.body);
    sendSuccess(res, field, 201);
  },

  async updateFieldDefinition(req, res) {
    const field = await fieldDefinitionService.update(
      Number.parseInt(req.params.fieldId),
      req.body
    );
    sendSuccess(res, field);
  },

  async deleteFieldDefinition(req, res) {
    await fieldDefinitionService.delete(Number.parseInt(req.params.fieldId));
    sendSuccess(res, { message: 'Field definition deleted successfully' });
  },

  async reorderFields(req, res) {
    await fieldDefinitionService.reorder(
      Number.parseInt(req.params.id),
      req.body.fieldIds
    );
    sendSuccess(res, { message: 'Fields reordered successfully' });
  },
};
