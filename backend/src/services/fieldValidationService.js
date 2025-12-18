/**
 * Field Validation Service
 * Handles validation of custom field values based on field type and validation rules
 */

class FieldValidationService {
  /**
   * Validate a field value against its field definition
   * @param {Object} fieldDefinition - The field definition with validation rules
   * @param {any} value - The value to validate
   * @returns {Array<string>} Array of error messages (empty if valid)
   */
  validateFieldValue(fieldDefinition, value) {
    const { field_type, validation_rules } = fieldDefinition;
    const errors = [];

    // Required validation
    if (validation_rules?.required && this.isEmpty(value)) {
      errors.push(`${fieldDefinition.label} is required`);
      return errors; // Stop further validation if required field is empty
    }

    // Skip type validation if value is empty and not required
    if (this.isEmpty(value)) {
      return errors;
    }

    // Type-specific validation
    switch (field_type) {
      case 'text':
      case 'richtext':
        errors.push(...this.validateText(value, validation_rules, fieldDefinition.label));
        break;
      case 'number':
        errors.push(...this.validateNumber(value, validation_rules, fieldDefinition.label));
        break;
      case 'select':
      case 'radio':
        errors.push(...this.validateOption(value, fieldDefinition.options, fieldDefinition.label));
        break;
      case 'checkbox':
        errors.push(
          ...this.validateCheckbox(
            value,
            fieldDefinition.options,
            validation_rules,
            fieldDefinition.label
          )
        );
        break;
      case 'toggle':
        errors.push(...this.validateBoolean(value, fieldDefinition.label));
        break;
      case 'date':
        errors.push(...this.validateDate(value, validation_rules, fieldDefinition.label));
        break;
      case 'time':
        errors.push(...this.validateTime(value, fieldDefinition.label));
        break;
      case 'color':
        errors.push(...this.validateColor(value, fieldDefinition.label));
        break;
      case 'image':
      case 'file':
        errors.push(...this.validateFile(value, validation_rules, fieldDefinition.label));
        break;
    }

    return errors;
  }

  /**
   * Check if a value is empty
   */
  isEmpty(value) {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    );
  }

  /**
   * Validate text fields
   */
  validateText(value, rules, label) {
    const errors = [];
    const str = String(value);

    if (rules?.minLength && str.length < rules.minLength) {
      errors.push(`${label} must be at least ${rules.minLength} characters`);
    }

    if (rules?.maxLength && str.length > rules.maxLength) {
      errors.push(`${label} must be at most ${rules.maxLength} characters`);
    }

    if (rules?.pattern) {
      try {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(str)) {
          errors.push(`${label} has invalid format`);
        }
      } catch (error) {
        errors.push(`${label} has invalid validation pattern`);
      }
    }

    return errors;
  }

  /**
   * Validate number fields
   */
  validateNumber(value, rules, label) {
    const errors = [];
    const num = Number(value);

    if (Number.isNaN(num)) {
      errors.push(`${label} must be a valid number`);
      return errors;
    }

    if (rules?.min !== undefined && num < rules.min) {
      errors.push(`${label} must be at least ${rules.min}`);
    }

    if (rules?.max !== undefined && num > rules.max) {
      errors.push(`${label} must be at most ${rules.max}`);
    }

    if (rules?.step !== undefined) {
      const remainder = (num - (rules.min || 0)) % rules.step;
      if (remainder !== 0) {
        errors.push(`${label} must be a multiple of ${rules.step}`);
      }
    }

    return errors;
  }

  /**
   * Validate select/radio option fields
   */
  validateOption(value, options, label) {
    const errors = [];

    if (!Array.isArray(options) || options.length === 0) {
      return errors;
    }

    const validValues = options.map((opt) => opt.value);
    if (!validValues.includes(value)) {
      errors.push(`${label} has an invalid option selected`);
    }

    return errors;
  }

  /**
   * Validate checkbox fields (multiple selection)
   */
  validateCheckbox(value, options, rules, label) {
    const errors = [];

    if (!Array.isArray(value)) {
      errors.push(`${label} must be an array`);
      return errors;
    }

    if (!Array.isArray(options) || options.length === 0) {
      return errors;
    }

    const validValues = new Set(options.map((opt) => opt.value));

    // Check if all selected values are valid
    for (const selectedValue of value) {
      if (!validValues.has(selectedValue)) {
        errors.push(`${label} contains an invalid option: ${selectedValue}`);
      }
    }

    // Min/max selection validation
    if (rules?.minSelect && value.length < rules.minSelect) {
      errors.push(`${label} requires at least ${rules.minSelect} selection(s)`);
    }

    if (rules?.maxSelect && value.length > rules.maxSelect) {
      errors.push(`${label} allows at most ${rules.maxSelect} selection(s)`);
    }

    return errors;
  }

  /**
   * Validate boolean/toggle fields
   */
  validateBoolean(value, label) {
    const errors = [];

    if (typeof value !== 'boolean') {
      errors.push(`${label} must be true or false`);
    }

    return errors;
  }

  /**
   * Validate date fields
   */
  validateDate(value, rules, label) {
    const errors = [];

    // Check if valid date format
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      errors.push(`${label} must be a valid date`);
      return errors;
    }

    // Min date validation
    if (rules?.minDate) {
      const minDate = new Date(rules.minDate);
      if (date < minDate) {
        errors.push(`${label} must be on or after ${minDate.toLocaleDateString()}`);
      }
    }

    // Max date validation
    if (rules?.maxDate) {
      const maxDate = new Date(rules.maxDate);
      if (date > maxDate) {
        errors.push(`${label} must be on or before ${maxDate.toLocaleDateString()}`);
      }
    }

    return errors;
  }

  /**
   * Validate time fields
   */
  validateTime(value, label) {
    const errors = [];

    // Check if valid time format (HH:MM or HH:MM:SS)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    if (!timeRegex.test(value)) {
      errors.push(`${label} must be a valid time (HH:MM format)`);
    }

    return errors;
  }

  /**
   * Validate color fields
   */
  validateColor(value, label) {
    const errors = [];

    // Check if valid hex color (#RRGGBB or #RGB)
    const colorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    if (!colorRegex.test(value)) {
      errors.push(`${label} must be a valid hex color (#RRGGBB)`);
    }

    return errors;
  }

  /**
   * Validate file/image fields
   */
  validateFile(value, rules, label) {
    const errors = [];

    // Value should be an object with file metadata
    if (typeof value !== 'object' || value === null) {
      errors.push(`${label} must be a valid file object`);
      return errors;
    }

    const { url, size, type } = value;

    // Validate URL
    if (!url || typeof url !== 'string') {
      errors.push(`${label} must have a valid URL`);
    }

    // Validate file size (if provided in bytes)
    if (rules?.maxFileSize && size && size > rules.maxFileSize) {
      const maxSizeMB = (rules.maxFileSize / 1024 / 1024).toFixed(2);
      errors.push(`${label} file size must be less than ${maxSizeMB}MB`);
    }

    // Validate file type
    if (rules?.allowedTypes && Array.isArray(rules.allowedTypes) && type) {
      const isAllowed = rules.allowedTypes.some((allowedType) =>
        type.toLowerCase().includes(allowedType.toLowerCase())
      );
      if (!isAllowed) {
        errors.push(`${label} file type must be one of: ${rules.allowedTypes.join(', ')}`);
      }
    }

    return errors;
  }

  /**
   * Batch validate multiple field values
   * @param {Array} fieldDefinitions - Array of field definitions
   * @param {Object} values - Object mapping field IDs to values
   * @returns {Object} Object mapping field IDs to error arrays
   */
  batchValidate(fieldDefinitions, values) {
    const validationResults = {};

    for (const fieldDef of fieldDefinitions) {
      const value = values[fieldDef.id];
      const errors = this.validateFieldValue(fieldDef, value);

      if (errors.length > 0) {
        validationResults[fieldDef.id] = errors;
      }
    }

    return validationResults;
  }

  /**
   * Check if validation results contain any errors
   */
  hasErrors(validationResults) {
    return Object.keys(validationResults).length > 0;
  }

  /**
   * Format validation errors for API response
   */
  formatErrors(validationResults) {
    const formatted = [];

    for (const [fieldId, errors] of Object.entries(validationResults)) {
      formatted.push({
        field_id: Number(fieldId),
        errors,
      });
    }

    return formatted;
  }
}

export default new FieldValidationService();
