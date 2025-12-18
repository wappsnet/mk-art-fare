import customFieldService from './customFieldService.js';

/**
 * Conditional Logic Service
 * Evaluates conditional logic rules to determine whether fields should be shown or hidden
 */

class ConditionalLogicService {
  /**
   * Evaluate whether a field should be shown based on its conditional logic
   * @param {Object} fieldDefinition - The field definition with conditional_logic
   * @param {number} productId - The product ID
   * @param {Object} currentValues - Current field values (optional, for performance)
   * @returns {Promise<boolean>} True if field should be shown, false otherwise
   */
  async evaluateCondition(fieldDefinition, productId, currentValues = {}) {
    const { conditional_logic } = fieldDefinition;

    // If conditional logic is not enabled, always show the field
    if (!conditional_logic || !conditional_logic.enabled) {
      return true;
    }

    const { logic_type, rule_groups } = conditional_logic;

    // Evaluate each rule group
    const groupResults = await Promise.all(
      rule_groups.map((group) => this.evaluateRuleGroup(group, productId, currentValues))
    );

    // Combine group results based on logic_type
    if (logic_type === 'AND') {
      return groupResults.every(Boolean);
    } else {
      // OR logic
      return groupResults.some(Boolean);
    }
  }

  /**
   * Evaluate a rule group
   * @param {Object} ruleGroup - The rule group object
   * @param {number} productId - The product ID
   * @param {Object} currentValues - Current field values
   * @returns {Promise<boolean>} True if rule group passes
   */
  async evaluateRuleGroup(ruleGroup, productId, currentValues = {}) {
    const { rules, group_logic } = ruleGroup;

    // Evaluate each rule in the group
    const ruleResults = await Promise.all(
      rules.map((rule) => this.evaluateRule(rule, productId, currentValues))
    );

    // Combine rule results based on group_logic
    if (group_logic === 'AND') {
      return ruleResults.every(Boolean);
    } else {
      // OR logic
      return ruleResults.some(Boolean);
    }
  }

  /**
   * Evaluate a single rule
   * @param {Object} rule - The rule object {field_id, operator, value}
   * @param {number} productId - The product ID
   * @param {Object} currentValues - Current field values
   * @returns {Promise<boolean>} True if rule passes
   */
  async evaluateRule(rule, productId, currentValues = {}) {
    const { field_id, operator, value } = rule;

    // Get current value for the referenced field
    let fieldValue;
    if (currentValues[field_id] !== undefined) {
      fieldValue = currentValues[field_id];
    } else {
      const valueObj = await customFieldService.getProductFieldValue(productId, field_id);
      fieldValue = valueObj?.value;
    }

    // Apply operator
    return this.applyOperator(operator, fieldValue, value);
  }

  /**
   * Apply a conditional operator
   * @param {string} operator - The operator to apply
   * @param {any} fieldValue - The actual field value
   * @param {any} compareValue - The value to compare against
   * @returns {boolean} True if condition passes
   */
  applyOperator(operator, fieldValue, compareValue) {
    switch (operator) {
      case 'equals':
        return this.compareEquals(fieldValue, compareValue);

      case 'not_equals':
        return !this.compareEquals(fieldValue, compareValue);

      case 'contains':
        return this.compareContains(fieldValue, compareValue);

      case 'not_contains':
        return !this.compareContains(fieldValue, compareValue);

      case 'greater_than':
        return this.compareGreaterThan(fieldValue, compareValue);

      case 'less_than':
        return this.compareLessThan(fieldValue, compareValue);

      case 'greater_than_or_equal':
        return (
          this.compareGreaterThan(fieldValue, compareValue) ||
          this.compareEquals(fieldValue, compareValue)
        );

      case 'less_than_or_equal':
        return (
          this.compareLessThan(fieldValue, compareValue) ||
          this.compareEquals(fieldValue, compareValue)
        );

      case 'is_empty':
        return this.isEmpty(fieldValue);

      case 'is_not_empty':
        return !this.isEmpty(fieldValue);

      case 'starts_with':
        return this.compareStartsWith(fieldValue, compareValue);

      case 'ends_with':
        return this.compareEndsWith(fieldValue, compareValue);

      case 'in':
        return this.compareIn(fieldValue, compareValue);

      case 'not_in':
        return !this.compareIn(fieldValue, compareValue);

      default:
        console.warn(`Unknown conditional operator: ${operator}`);
        return true;
    }
  }

  /**
   * Comparison: equals
   */
  compareEquals(fieldValue, compareValue) {
    // Handle arrays (for checkbox fields)
    if (Array.isArray(fieldValue) && Array.isArray(compareValue)) {
      return (
        fieldValue.length === compareValue.length &&
        fieldValue.every((val) => compareValue.includes(val))
      );
    }

    // Loose equality for flexibility
    return fieldValue == compareValue;
  }

  /**
   * Comparison: contains
   */
  compareContains(fieldValue, compareValue) {
    if (this.isEmpty(fieldValue)) {
      return false;
    }

    // For arrays
    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(compareValue);
    }

    // For strings
    return String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());
  }

  /**
   * Comparison: greater than
   */
  compareGreaterThan(fieldValue, compareValue) {
    if (this.isEmpty(fieldValue)) {
      return false;
    }

    return Number(fieldValue) > Number(compareValue);
  }

  /**
   * Comparison: less than
   */
  compareLessThan(fieldValue, compareValue) {
    if (this.isEmpty(fieldValue)) {
      return false;
    }

    return Number(fieldValue) < Number(compareValue);
  }

  /**
   * Comparison: starts with
   */
  compareStartsWith(fieldValue, compareValue) {
    if (this.isEmpty(fieldValue)) {
      return false;
    }

    return String(fieldValue).toLowerCase().startsWith(String(compareValue).toLowerCase());
  }

  /**
   * Comparison: ends with
   */
  compareEndsWith(fieldValue, compareValue) {
    if (this.isEmpty(fieldValue)) {
      return false;
    }

    return String(fieldValue).toLowerCase().endsWith(String(compareValue).toLowerCase());
  }

  /**
   * Comparison: in (check if value is in an array)
   */
  compareIn(fieldValue, compareValue) {
    if (!Array.isArray(compareValue)) {
      return false;
    }

    return compareValue.includes(fieldValue);
  }

  /**
   * Check if value is empty
   */
  isEmpty(value) {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    );
  }

  /**
   * Batch evaluate conditional logic for multiple fields
   * @param {Array} fieldDefinitions - Array of field definitions
   * @param {number} productId - The product ID
   * @param {Object} currentValues - Current field values
   * @returns {Promise<Object>} Object mapping field IDs to visibility (true/false)
   */
  async batchEvaluate(fieldDefinitions, productId, currentValues = {}) {
    const visibilityMap = {};

    for (const fieldDef of fieldDefinitions) {
      const isVisible = await this.evaluateCondition(fieldDef, productId, currentValues);
      visibilityMap[fieldDef.id] = isVisible;
    }

    return visibilityMap;
  }

  /**
   * Get all fields that should be visible for a product
   * @param {Array} fieldDefinitions - Array of field definitions
   * @param {number} productId - The product ID
   * @param {Object} currentValues - Current field values
   * @returns {Promise<Array>} Array of visible field definitions
   */
  async getVisibleFields(fieldDefinitions, productId, currentValues = {}) {
    const visibleFields = [];

    for (const fieldDef of fieldDefinitions) {
      const isVisible = await this.evaluateCondition(fieldDef, productId, currentValues);

      if (isVisible) {
        visibleFields.push(fieldDef);
      }
    }

    return visibleFields;
  }

  /**
   * Validate conditional logic configuration
   * @param {Object} conditionalLogic - The conditional logic object to validate
   * @returns {Array<string>} Array of error messages (empty if valid)
   */
  validateConditionalLogic(conditionalLogic) {
    const errors = [];

    if (!conditionalLogic) {
      return errors;
    }

    // Validate logic_type
    if (conditionalLogic.enabled && !conditionalLogic.logic_type) {
      errors.push('logic_type is required when conditional logic is enabled');
    }

    if (conditionalLogic.logic_type && !['AND', 'OR'].includes(conditionalLogic.logic_type)) {
      errors.push('logic_type must be either AND or OR');
    }

    // Validate rule_groups
    if (
      conditionalLogic.enabled &&
      (!conditionalLogic.rule_groups ||
        !Array.isArray(conditionalLogic.rule_groups) ||
        conditionalLogic.rule_groups.length === 0)
    ) {
      errors.push('At least one rule group is required when conditional logic is enabled');
    }

    // Validate each rule group
    if (conditionalLogic.rule_groups) {
      conditionalLogic.rule_groups.forEach((group, groupIndex) => {
        if (!group.group_logic || !['AND', 'OR'].includes(group.group_logic)) {
          errors.push(`Rule group ${groupIndex}: group_logic must be either AND or OR`);
        }

        if (!group.rules || !Array.isArray(group.rules) || group.rules.length === 0) {
          errors.push(`Rule group ${groupIndex}: At least one rule is required`);
        }

        // Validate each rule
        if (group.rules) {
          group.rules.forEach((rule, ruleIndex) => {
            if (!rule.field_id) {
              errors.push(`Rule group ${groupIndex}, rule ${ruleIndex}: field_id is required`);
            }

            if (!rule.operator) {
              errors.push(`Rule group ${groupIndex}, rule ${ruleIndex}: operator is required`);
            }

            const validOperators = [
              'equals',
              'not_equals',
              'contains',
              'not_contains',
              'greater_than',
              'less_than',
              'greater_than_or_equal',
              'less_than_or_equal',
              'is_empty',
              'is_not_empty',
              'starts_with',
              'ends_with',
              'in',
              'not_in',
            ];

            if (rule.operator && !validOperators.includes(rule.operator)) {
              errors.push(
                `Rule group ${groupIndex}, rule ${ruleIndex}: Invalid operator ${rule.operator}`
              );
            }
          });
        }
      });
    }

    return errors;
  }
}

export default new ConditionalLogicService();
