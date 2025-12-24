import { productFieldService } from '../services/productFieldService.js';
import { sendSuccess } from '../utils/response.js';

export const productFieldController = {
  async assignFieldGroup(req, res) {
    await productFieldService.assignFieldGroup(
      Number.parseInt(req.params.id),
      req.body.fieldGroupId
    );
    sendSuccess(res, { message: 'Field group assigned successfully' });
  },

  async unassignFieldGroup(req, res) {
    await productFieldService.unassignFieldGroup(
      Number.parseInt(req.params.id),
      Number.parseInt(req.params.groupId)
    );
    sendSuccess(res, { message: 'Field group unassigned successfully' });
  },

  async getProductFieldGroups(req, res) {
    const groups = await productFieldService.getProductFieldGroups(
      Number.parseInt(req.params.id)
    );
    sendSuccess(res, groups);
  },

  async getProductFieldValues(req, res) {
    const values = await productFieldService.getProductFieldValues(
      Number.parseInt(req.params.id)
    );
    sendSuccess(res, values);
  },

  async batchUpdateFieldValues(req, res) {
    await productFieldService.batchUpdateFieldValues(
      Number.parseInt(req.params.id),
      req.body.fields
    );
    sendSuccess(res, { message: 'Field values updated successfully' });
  },

  async updateFieldValue(req, res) {
    await productFieldService.updateFieldValue(
      Number.parseInt(req.params.id),
      Number.parseInt(req.params.fieldId),
      req.body.value
    );
    sendSuccess(res, { message: 'Field value updated successfully' });
  },

  async deleteFieldValue(req, res) {
    await productFieldService.deleteFieldValue(
      Number.parseInt(req.params.id),
      Number.parseInt(req.params.fieldId)
    );
    sendSuccess(res, { message: 'Field value deleted successfully' });
  },
};
