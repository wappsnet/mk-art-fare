import customFieldService from '../services/customFields/index.js';
import conditionalLogicService from '../services/conditionalLogicService.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendSuccess } from '../utils/response.js';

/**
 * Field Group Controller
 * Handles HTTP requests for field groups and field definitions
 */

export const fieldGroupController = {
  // ==================== FIELD GROUPS ====================

  /**
   * Create a new field group
   * POST /api/field-groups
   */
  async createFieldGroup(req, res) {
    const { name, description, organizationId } = req.body;

    if (!name || !organizationId) {
      throw new AppError('Name and organizationId are required', 400);
    }

    // Verify user owns the organization
    const org = await req.app.locals.query(
      'SELECT id FROM organizations WHERE id = ? AND owner_id = ?',
      [organizationId, req.user.userId]
    );

    if (org.length === 0) {
      throw new AppError('Organization not found or access denied', 404);
    }

    const fieldGroup = await customFieldService.createFieldGroup(organizationId, {
      name,
      description,
    });

    sendSuccess(res, fieldGroup, 'Field group created successfully', 201);
  },

  /**
   * Get all field groups for an organization
   * GET /api/field-groups?organizationId=123&includeFields=true
   */
  async getFieldGroups(req, res) {
    const { organizationId, includeFields } = req.query;

    if (!organizationId) {
      throw new AppError('organizationId is required', 400);
    }

    // Verify access
    const org = await req.app.locals.query(
      'SELECT id FROM organizations WHERE id = ? AND owner_id = ?',
      [organizationId, req.user.userId]
    );

    if (org.length === 0) {
      throw new AppError('Organization not found or access denied', 404);
    }

    const groups = await customFieldService.getFieldGroupsByOrganization(
      Number(organizationId),
      includeFields === 'true'
    );

    sendSuccess(res, groups);
  },

  /**
   * Get a single field group by ID
   * GET /api/field-groups/:id
   */
  async getFieldGroupById(req, res) {
    const { id } = req.params;

    const fieldGroup = await customFieldService.getFieldGroupById(Number(id));

    // Verify ownership
    const org = await req.app.locals.query(
      'SELECT id FROM organizations WHERE id = ? AND owner_id = ?',
      [fieldGroup.organization_id, req.user.userId]
    );

    if (org.length === 0) {
      throw new AppError('Access denied', 403);
    }

    sendSuccess(res, fieldGroup);
  },

  /**
   * Update a field group
   * PATCH /api/field-groups/:id
   */
  async updateFieldGroup(req, res) {
    const { id } = req.params;
    const updates = req.body;

    // Get field group to verify ownership
    const fieldGroup = await customFieldService.getFieldGroupById(Number(id));

    // Verify ownership
    const org = await req.app.locals.query(
      'SELECT id FROM organizations WHERE id = ? AND owner_id = ?',
      [fieldGroup.organization_id, req.user.userId]
    );

    if (org.length === 0) {
      throw new AppError('Access denied', 403);
    }

    const updated = await customFieldService.updateFieldGroup(
      Number(id),
      fieldGroup.organization_id,
      updates
    );

    sendSuccess(res, updated, 'Field group updated successfully');
  },

  /**
   * Delete a field group
   * DELETE /api/field-groups/:id
   */
  async deleteFieldGroup(req, res) {
    const { id } = req.params;

    // Get field group to verify ownership
    const fieldGroup = await customFieldService.getFieldGroupById(Number(id));

    // Verify ownership
    const org = await req.app.locals.query(
      'SELECT id FROM organizations WHERE id = ? AND owner_id = ?',
      [fieldGroup.organization_id, req.user.userId]
    );

    if (org.length === 0) {
      throw new AppError('Access denied', 403);
    }

    await customFieldService.deleteFieldGroup(Number(id), fieldGroup.organization_id);

    sendSuccess(res, null, 'Field group deleted successfully');
  },

  // ==================== FIELD DEFINITIONS ====================

  /**
   * Add a field definition to a field group
   * POST /api/field-groups/:id/fields
   */
  async createFieldDefinition(req, res) {
    const { id } = req.params;
    const fieldData = req.body;

    // Get field group to verify ownership
    const fieldGroup = await customFieldService.getFieldGroupById(Number(id));

    // Verify ownership
    const org = await req.app.locals.query(
      'SELECT id FROM organizations WHERE id = ? AND owner_id = ?',
      [fieldGroup.organization_id, req.user.userId]
    );

    if (org.length === 0) {
      throw new AppError('Access denied', 403);
    }

    // Validate conditional logic if provided
    if (fieldData.conditional_logic) {
      const errors = conditionalLogicService.validateConditionalLogic(
        fieldData.conditional_logic
      );
      if (errors.length > 0) {
        throw new AppError(`Conditional logic validation failed: ${errors.join(', ')}`, 400);
      }
    }

    const fieldDefinition = await customFieldService.createFieldDefinition(
      Number(id),
      fieldData
    );

    sendSuccess(res, fieldDefinition, 'Field definition created successfully', 201);
  },

  /**
   * Update a field definition
   * PATCH /api/field-groups/:groupId/fields/:fieldId
   */
  async updateFieldDefinition(req, res) {
    const { groupId, fieldId } = req.params;
    const updates = req.body;

    // Get field group to verify ownership
    const fieldGroup = await customFieldService.getFieldGroupById(Number(groupId));

    // Verify ownership
    const org = await req.app.locals.query(
      'SELECT id FROM organizations WHERE id = ? AND owner_id = ?',
      [fieldGroup.organization_id, req.user.userId]
    );

    if (org.length === 0) {
      throw new AppError('Access denied', 403);
    }

    // Validate conditional logic if provided
    if (updates.conditional_logic) {
      const errors = conditionalLogicService.validateConditionalLogic(
        updates.conditional_logic
      );
      if (errors.length > 0) {
        throw new AppError(`Conditional logic validation failed: ${errors.join(', ')}`, 400);
      }
    }

    const updated = await customFieldService.updateFieldDefinition(Number(fieldId), updates);

    sendSuccess(res, updated, 'Field definition updated successfully');
  },

  /**
   * Delete a field definition
   * DELETE /api/field-groups/:groupId/fields/:fieldId
   */
  async deleteFieldDefinition(req, res) {
    const { groupId, fieldId } = req.params;

    // Get field group to verify ownership
    const fieldGroup = await customFieldService.getFieldGroupById(Number(groupId));

    // Verify ownership
    const org = await req.app.locals.query(
      'SELECT id FROM organizations WHERE id = ? AND owner_id = ?',
      [fieldGroup.organization_id, req.user.userId]
    );

    if (org.length === 0) {
      throw new AppError('Access denied', 403);
    }

    await customFieldService.deleteFieldDefinition(Number(fieldId));

    sendSuccess(res, null, 'Field definition deleted successfully');
  },

  /**
   * Reorder field definitions in a group
   * PUT /api/field-groups/:id/fields/reorder
   */
  async reorderFields(req, res) {
    const { id } = req.params;
    const { fieldIds } = req.body;

    if (!Array.isArray(fieldIds)) {
      throw new AppError('fieldIds must be an array', 400);
    }

    // Get field group to verify ownership
    const fieldGroup = await customFieldService.getFieldGroupById(Number(id));

    // Verify ownership
    const org = await req.app.locals.query(
      'SELECT id FROM organizations WHERE id = ? AND owner_id = ?',
      [fieldGroup.organization_id, req.user.userId]
    );

    if (org.length === 0) {
      throw new AppError('Access denied', 403);
    }

    const reordered = await customFieldService.reorderFields(Number(id), fieldIds);

    sendSuccess(res, reordered, 'Fields reordered successfully');
  },
};
