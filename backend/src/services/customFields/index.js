/**
 * Custom Fields Module
 * Provides a unified interface to custom field services
 * Maintains backward compatibility with the old customFieldService
 */

import fieldGroupService from './fieldGroupService.js';
import fieldDefinitionService from './fieldDefinitionService.js';
import fieldAssignmentService from './fieldAssignmentService.js';
import fieldValueService from './fieldValueService.js';
import {
  parseFieldDefinition,
  parseFieldValue,
  getColumnForFieldType,
  processValueForStorage,
} from './fieldParsingService.js';

/**
 * Unified Custom Field Service
 * Facade pattern - maintains backward compatibility while using modular services
 */
class CustomFieldService {
  // ==================== FIELD GROUPS ====================

  async createFieldGroup(organizationId, data) {
    return fieldGroupService.createFieldGroup(organizationId, data);
  }

  async getFieldGroupsByOrganization(organizationId, includeFields = false) {
    return fieldGroupService.getFieldGroupsByOrganization(organizationId, includeFields);
  }

  async getFieldGroupById(groupId) {
    return fieldGroupService.getFieldGroupById(groupId);
  }

  async updateFieldGroup(groupId, organizationId, data) {
    return fieldGroupService.updateFieldGroup(groupId, organizationId, data);
  }

  async deleteFieldGroup(groupId, organizationId) {
    return fieldGroupService.deleteFieldGroup(groupId, organizationId);
  }

  async verifyFieldGroupOwnership(groupId, organizationId) {
    return fieldGroupService.verifyFieldGroupOwnership(groupId, organizationId);
  }

  // ==================== FIELD DEFINITIONS ====================

  async createFieldDefinition(fieldGroupId, data) {
    return fieldDefinitionService.createFieldDefinition(fieldGroupId, data);
  }

  async getFieldDefinitionsByGroup(fieldGroupId) {
    return fieldDefinitionService.getFieldDefinitionsByGroup(fieldGroupId);
  }

  async getFieldDefinitionById(fieldId) {
    return fieldDefinitionService.getFieldDefinitionById(fieldId);
  }

  async updateFieldDefinition(fieldId, data) {
    return fieldDefinitionService.updateFieldDefinition(fieldId, data);
  }

  async deleteFieldDefinition(fieldId) {
    return fieldDefinitionService.deleteFieldDefinition(fieldId);
  }

  async reorderFields(fieldGroupId, fieldIds) {
    return fieldDefinitionService.reorderFields(fieldGroupId, fieldIds);
  }

  parseFieldDefinition(field) {
    return parseFieldDefinition(field);
  }

  // ==================== PRODUCT FIELD GROUP ASSIGNMENTS ====================

  async assignFieldGroupToProduct(productId, fieldGroupId) {
    return fieldAssignmentService.assignFieldGroupToProduct(productId, fieldGroupId);
  }

  async unassignFieldGroupFromProduct(productId, fieldGroupId) {
    return fieldAssignmentService.unassignFieldGroupFromProduct(productId, fieldGroupId);
  }

  async getProductFieldGroups(productId) {
    return fieldAssignmentService.getProductFieldGroups(productId);
  }

  // ==================== PRODUCT FIELD VALUES ====================

  async getProductFieldValues(productId) {
    return fieldValueService.getProductFieldValues(productId);
  }

  async getProductFieldValue(productId, fieldDefinitionId) {
    return fieldValueService.getProductFieldValue(productId, fieldDefinitionId);
  }

  async setProductFieldValue(productId, fieldDefinitionId, value, fieldType) {
    return fieldValueService.setProductFieldValue(productId, fieldDefinitionId, value, fieldType);
  }

  async batchUpdateProductFieldValues(productId, fields) {
    return fieldValueService.batchUpdateProductFieldValues(productId, fields);
  }

  async deleteProductFieldValue(productId, fieldDefinitionId) {
    return fieldValueService.deleteProductFieldValue(productId, fieldDefinitionId);
  }

  parseFieldValue(value) {
    return parseFieldValue(value);
  }
}

// Export default instance (backward compatibility)
export default new CustomFieldService();

// Export individual services for direct use
export {
  fieldGroupService,
  fieldDefinitionService,
  fieldAssignmentService,
  fieldValueService,
  parseFieldDefinition,
  parseFieldValue,
  getColumnForFieldType,
  processValueForStorage,
};
