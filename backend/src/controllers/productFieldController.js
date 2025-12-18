import customFieldService from '../services/customFieldService.js';
import fieldValidationService from '../services/fieldValidationService.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Product Field Controller
 * Handles HTTP requests for product field assignments and values
 */

export const productFieldController = {
  // ==================== FIELD GROUP ASSIGNMENTS ====================

  /**
   * Assign a field group to a product
   * POST /api/products/:id/field-groups
   */
  async assignFieldGroup(req, res) {
    const { id } = req.params;
    const { fieldGroupId } = req.body;

    if (!fieldGroupId) {
      throw new AppError('fieldGroupId is required', 400);
    }

    // Verify product ownership
    const products = await req.app.locals.query(
      `SELECT p.id FROM products p
       INNER JOIN organizations o ON p.organization_id = o.id
       WHERE p.id = ? AND o.owner_id = ?`,
      [id, req.user.userId]
    );

    if (products.length === 0) {
      throw new AppError('Product not found or access denied', 404);
    }

    await customFieldService.assignFieldGroupToProduct(Number(id), Number(fieldGroupId));

    sendSuccess(res, null, 'Field group assigned to product successfully');
  },

  /**
   * Unassign a field group from a product
   * DELETE /api/products/:id/field-groups/:groupId
   */
  async unassignFieldGroup(req, res) {
    const { id, groupId } = req.params;

    // Verify product ownership
    const products = await req.app.locals.query(
      `SELECT p.id FROM products p
       INNER JOIN organizations o ON p.organization_id = o.id
       WHERE p.id = ? AND o.owner_id = ?`,
      [id, req.user.userId]
    );

    if (products.length === 0) {
      throw new AppError('Product not found or access denied', 404);
    }

    await customFieldService.unassignFieldGroupFromProduct(Number(id), Number(groupId));

    sendSuccess(res, null, 'Field group unassigned from product successfully');
  },

  /**
   * Get all field groups assigned to a product
   * GET /api/products/:id/field-groups
   */
  async getProductFieldGroups(req, res) {
    const { id } = req.params;

    // Product can be viewed by anyone, no ownership check needed for GET
    const groups = await customFieldService.getProductFieldGroups(Number(id));

    sendSuccess(res, groups);
  },

  // ==================== FIELD VALUES ====================

  /**
   * Get all custom field values for a product
   * GET /api/products/:id/fields
   */
  async getProductFieldValues(req, res) {
    const { id } = req.params;

    const values = await customFieldService.getProductFieldValues(Number(id));

    sendSuccess(res, values);
  },

  /**
   * Batch update product field values
   * POST /api/products/:id/fields
   * Body: { fields: { fieldDefinitionId: value, ... } }
   */
  async batchUpdateFieldValues(req, res) {
    const { id } = req.params;
    const { fields } = req.body;

    if (!fields || typeof fields !== 'object') {
      throw new AppError('fields object is required', 400);
    }

    // Verify product ownership
    const products = await req.app.locals.query(
      `SELECT p.id FROM products p
       INNER JOIN organizations o ON p.organization_id = o.id
       WHERE p.id = ? AND o.owner_id = ?`,
      [id, req.user.userId]
    );

    if (products.length === 0) {
      throw new AppError('Product not found or access denied', 404);
    }

    // Get all field definitions for validation
    const fieldIds = Object.keys(fields).map(Number);
    const fieldDefinitions = await Promise.all(
      fieldIds.map((fieldId) => customFieldService.getFieldDefinitionById(fieldId))
    );

    // Validate all fields
    const validationResults = fieldValidationService.batchValidate(
      fieldDefinitions,
      fields
    );

    if (fieldValidationService.hasErrors(validationResults)) {
      throw new AppError(
        'Validation failed',
        400,
        fieldValidationService.formatErrors(validationResults)
      );
    }

    // Update all fields
    const results = await customFieldService.batchUpdateProductFieldValues(
      Number(id),
      fields
    );

    sendSuccess(res, results, 'Product fields updated successfully');
  },

  /**
   * Update a single product field value
   * PATCH /api/products/:id/fields/:fieldId
   */
  async updateFieldValue(req, res) {
    const { id, fieldId } = req.params;
    const { value } = req.body;

    // Verify product ownership
    const products = await req.app.locals.query(
      `SELECT p.id FROM products p
       INNER JOIN organizations o ON p.organization_id = o.id
       WHERE p.id = ? AND o.owner_id = ?`,
      [id, req.user.userId]
    );

    if (products.length === 0) {
      throw new AppError('Product not found or access denied', 404);
    }

    // Get field definition for validation
    const fieldDef = await customFieldService.getFieldDefinitionById(Number(fieldId));

    // Validate
    const errors = fieldValidationService.validateFieldValue(fieldDef, value);
    if (errors.length > 0) {
      throw new AppError(`Validation failed: ${errors.join(', ')}`, 400);
    }

    // Update
    const result = await customFieldService.setProductFieldValue(
      Number(id),
      Number(fieldId),
      value,
      fieldDef.field_type
    );

    sendSuccess(res, result, 'Field value updated successfully');
  },

  /**
   * Delete a product field value
   * DELETE /api/products/:id/fields/:fieldId
   */
  async deleteFieldValue(req, res) {
    const { id, fieldId } = req.params;

    // Verify product ownership
    const products = await req.app.locals.query(
      `SELECT p.id FROM products p
       INNER JOIN organizations o ON p.organization_id = o.id
       WHERE p.id = ? AND o.owner_id = ?`,
      [id, req.user.userId]
    );

    if (products.length === 0) {
      throw new AppError('Product not found or access denied', 404);
    }

    await customFieldService.deleteProductFieldValue(Number(id), Number(fieldId));

    sendSuccess(res, null, 'Field value deleted successfully');
  },
};
