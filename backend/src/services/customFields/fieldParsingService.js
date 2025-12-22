/**
 * Field Parsing Service
 * Handles JSON parsing for field definitions and values
 */

/**
 * Parse JSON fields in field definition
 */
export function parseFieldDefinition(field) {
  if (field.options && typeof field.options === 'string') {
    field.options = JSON.parse(field.options);
  }
  if (field.validation_rules && typeof field.validation_rules === 'string') {
    field.validation_rules = JSON.parse(field.validation_rules);
  }
  if (field.conditional_logic && typeof field.conditional_logic === 'string') {
    field.conditional_logic = JSON.parse(field.conditional_logic);
  }
  return field;
}

/**
 * Parse field value based on type
 */
export function parseFieldValue(value) {
  // Determine the actual value based on field type
  const fieldType = value.field_type;
  let actualValue;

  if (fieldType === 'number') {
    actualValue = value.value_number;
  } else if (fieldType === 'toggle') {
    actualValue = value.value_boolean;
  } else if (fieldType === 'date') {
    actualValue = value.value_date;
  } else if (fieldType === 'time') {
    actualValue = value.value_time;
  } else if (['checkbox', 'image', 'file'].includes(fieldType)) {
    if (value.value_json) {
      // Check if it's already parsed (MySQL JSON column returns objects/arrays directly)
      if (typeof value.value_json === 'object') {
        actualValue = value.value_json;
      } else if (typeof value.value_json === 'string') {
        try {
          actualValue = JSON.parse(value.value_json);
        } catch (error) {
          console.error('Failed to parse JSON field value:', {
            fieldType,
            fieldId: value.field_definition_id,
            productId: value.product_id,
            rawValue: value.value_json,
            error: error.message,
          });
          actualValue = null;
        }
      } else {
        actualValue = null;
      }
    } else {
      actualValue = null;
    }
  } else if (fieldType === 'richtext') {
    actualValue = value.value_longtext;
  } else {
    actualValue = value.value_text;
  }

  return {
    ...value,
    value: actualValue,
  };
}

/**
 * Get column name for field type
 */
export function getColumnForFieldType(fieldType) {
  const columnMap = {
    text: 'value_text',
    select: 'value_text',
    radio: 'value_text',
    color: 'value_text',
    number: 'value_number',
    toggle: 'value_boolean',
    date: 'value_date',
    time: 'value_time',
    checkbox: 'value_json',
    image: 'value_json',
    file: 'value_json',
    richtext: 'value_longtext',
  };

  return columnMap[fieldType] || null;
}

/**
 * Process value for storage based on type
 */
export function processValueForStorage(value, fieldType) {
  if (['checkbox', 'image', 'file'].includes(fieldType) && typeof value !== 'string') {
    return JSON.stringify(value);
  }
  return value;
}
