/**
 * Comparison Operators Utility
 * Provides reusable comparison functions for conditional logic and filtering
 * Used by conditionalLogicService and fieldSearchService
 */

/**
 * Check if a value is empty
 *
 * @param {any} value - Value to check
 * @returns {boolean} True if value is considered empty
 */
export function isEmpty(value) {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  );
}

/**
 * Comparison: equals
 * Handles arrays (for checkbox/multi-select fields) and scalar values
 *
 * @param {any} fieldValue - The field value
 * @param {any} compareValue - Value to compare against
 * @returns {boolean} True if values are equal
 */
export function compareEquals(fieldValue, compareValue) {
  // Handle arrays (for checkbox fields)
  if (Array.isArray(fieldValue) && Array.isArray(compareValue)) {
    return (
      fieldValue.length === compareValue.length &&
      fieldValue.every((val) => compareValue.includes(val))
    );
  }

  // Loose equality for flexibility
  return fieldValue === compareValue;
}

/**
 * Comparison: not equals
 *
 * @param {any} fieldValue - The field value
 * @param {any} compareValue - Value to compare against
 * @returns {boolean} True if values are not equal
 */
export function compareNotEquals(fieldValue, compareValue) {
  return !compareEquals(fieldValue, compareValue);
}

/**
 * Comparison: contains
 * For arrays: checks if array includes the value
 * For strings: checks if string contains substring (case-insensitive)
 *
 * @param {any} fieldValue - The field value
 * @param {any} compareValue - Value to check for
 * @returns {boolean} True if field value contains compare value
 */
export function compareContains(fieldValue, compareValue) {
  if (isEmpty(fieldValue)) {
    return false;
  }

  // For arrays
  if (Array.isArray(fieldValue)) {
    return fieldValue.includes(compareValue);
  }

  // For strings (case-insensitive)
  return String(fieldValue).toLowerCase().includes(String(compareValue).toLowerCase());
}

/**
 * Comparison: not contains
 *
 * @param {any} fieldValue - The field value
 * @param {any} compareValue - Value to check for
 * @returns {boolean} True if field value does not contain compare value
 */
export function compareNotContains(fieldValue, compareValue) {
  return !compareContains(fieldValue, compareValue);
}

/**
 * Comparison: greater than
 *
 * @param {any} fieldValue - The field value
 * @param {any} compareValue - Value to compare against
 * @returns {boolean} True if field value is greater than compare value
 */
export function compareGreaterThan(fieldValue, compareValue) {
  if (isEmpty(fieldValue)) {
    return false;
  }

  return Number(fieldValue) > Number(compareValue);
}

/**
 * Comparison: less than
 *
 * @param {any} fieldValue - The field value
 * @param {any} compareValue - Value to compare against
 * @returns {boolean} True if field value is less than compare value
 */
export function compareLessThan(fieldValue, compareValue) {
  if (isEmpty(fieldValue)) {
    return false;
  }

  return Number(fieldValue) < Number(compareValue);
}

/**
 * Comparison: greater than or equal
 *
 * @param {any} fieldValue - The field value
 * @param {any} compareValue - Value to compare against
 * @returns {boolean} True if field value is >= compare value
 */
export function compareGreaterThanOrEqual(fieldValue, compareValue) {
  return compareGreaterThan(fieldValue, compareValue) || compareEquals(fieldValue, compareValue);
}

/**
 * Comparison: less than or equal
 *
 * @param {any} fieldValue - The field value
 * @param {any} compareValue - Value to compare against
 * @returns {boolean} True if field value is <= compare value
 */
export function compareLessThanOrEqual(fieldValue, compareValue) {
  return compareLessThan(fieldValue, compareValue) || compareEquals(fieldValue, compareValue);
}

/**
 * Comparison: starts with (case-insensitive)
 *
 * @param {any} fieldValue - The field value
 * @param {any} compareValue - Value to check for
 * @returns {boolean} True if field value starts with compare value
 */
export function compareStartsWith(fieldValue, compareValue) {
  if (isEmpty(fieldValue)) {
    return false;
  }

  return String(fieldValue).toLowerCase().startsWith(String(compareValue).toLowerCase());
}

/**
 * Comparison: ends with (case-insensitive)
 *
 * @param {any} fieldValue - The field value
 * @param {any} compareValue - Value to check for
 * @returns {boolean} True if field value ends with compare value
 */
export function compareEndsWith(fieldValue, compareValue) {
  if (isEmpty(fieldValue)) {
    return false;
  }

  return String(fieldValue).toLowerCase().endsWith(String(compareValue).toLowerCase());
}

/**
 * Comparison: in (check if value is in an array)
 *
 * @param {any} fieldValue - The field value to check
 * @param {Array} compareValue - Array to check against
 * @returns {boolean} True if field value is in the compare array
 */
export function compareIn(fieldValue, compareValue) {
  if (!Array.isArray(compareValue)) {
    return false;
  }

  return compareValue.includes(fieldValue);
}

/**
 * Comparison: not in
 *
 * @param {any} fieldValue - The field value to check
 * @param {Array} compareValue - Array to check against
 * @returns {boolean} True if field value is not in the compare array
 */
export function compareNotIn(fieldValue, compareValue) {
  return !compareIn(fieldValue, compareValue);
}

/**
 * Comparison: between (inclusive)
 *
 * @param {any} fieldValue - The field value
 * @param {Array} range - [min, max] range array
 * @returns {boolean} True if field value is between min and max (inclusive)
 */
export function compareBetween(fieldValue, range) {
  if (isEmpty(fieldValue) || !Array.isArray(range) || range.length !== 2) {
    return false;
  }

  const num = Number(fieldValue);
  const [min, max] = range.map(Number);

  return num >= min && num <= max;
}

/**
 * Comparison strategy map
 * Maps operator strings to comparison functions
 *
 * @type {Object<string, Function>}
 *
 * @example
 * const operator = 'equals';
 * const result = COMPARISON_OPERATORS[operator](fieldValue, compareValue);
 */
export const COMPARISON_OPERATORS = {
  equals: compareEquals,
  not_equals: compareNotEquals,
  contains: compareContains,
  not_contains: compareNotContains,
  greater_than: compareGreaterThan,
  less_than: compareLessThan,
  greater_than_or_equal: compareGreaterThanOrEqual,
  less_than_or_equal: compareLessThanOrEqual,
  is_empty: (value) => isEmpty(value),
  is_not_empty: (value) => !isEmpty(value),
  starts_with: compareStartsWith,
  ends_with: compareEndsWith,
  in: compareIn,
  not_in: compareNotIn,
  between: compareBetween,
};

/**
 * Apply a comparison operator by name
 * Uses strategy pattern to eliminate large switch statements
 *
 * @param {string} operator - The operator name
 * @param {any} fieldValue - The field value
 * @param {any} compareValue - Value to compare against
 * @returns {boolean} Comparison result, defaults to true if operator unknown
 *
 * @example
 * applyOperator('equals', 'hello', 'hello') // true
 * applyOperator('contains', 'hello world', 'world') // true
 * applyOperator('greater_than', 10, 5) // true
 */
export function applyOperator(operator, fieldValue, compareValue) {
  const comparisonFn = COMPARISON_OPERATORS[operator];

  if (!comparisonFn) {
    console.warn(`Unknown comparison operator: ${operator}`);
    return true; // Default to true for unknown operators
  }

  return comparisonFn(fieldValue, compareValue);
}

/**
 * Get list of all supported operators
 *
 * @returns {Array<string>} Array of operator names
 */
export function getSupportedOperators() {
  return Object.keys(COMPARISON_OPERATORS);
}

/**
 * Validate operator name
 *
 * @param {string} operator - Operator name to validate
 * @returns {boolean} True if operator is supported
 */
export function isValidOperator(operator) {
  return operator in COMPARISON_OPERATORS;
}
