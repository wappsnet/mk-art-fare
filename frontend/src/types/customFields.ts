/**
 * Custom Fields Type Definitions
 * TypeScript interfaces for the product custom fields system
 */

// ==================== ENUMS ====================

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  TOGGLE = 'toggle',
  DATE = 'date',
  TIME = 'time',
  COLOR = 'color',
  IMAGE = 'image',
  FILE = 'file',
  RICHTEXT = 'richtext',
}

// ==================== FIELD OPTIONS ====================

export interface FieldOption {
  label: string;
  value: string;
}

// ==================== VALIDATION ====================

export interface ValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  step?: number;
  pattern?: string;
  minDate?: string;
  maxDate?: string;
  minSelect?: number;
  maxSelect?: number;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[]; // e.g., ['image/jpeg', 'image/png']
}

// ==================== CONDITIONAL LOGIC ====================

export type ConditionalOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in';

export type LogicType = 'AND' | 'OR';

/**
 * Discriminated union for conditional rules based on operator
 * Provides type safety for rule values
 */
export type ConditionalRule =
  | { field_id: number; operator: 'is_empty' | 'is_not_empty' } // No value needed
  | { field_id: number; operator: 'equals' | 'not_equals'; value: string | number | boolean }
  | {
      field_id: number;
      operator: 'contains' | 'not_contains' | 'starts_with' | 'ends_with';
      value: string;
    }
  | {
      field_id: number;
      operator: 'greater_than' | 'less_than' | 'greater_than_or_equal' | 'less_than_or_equal';
      value: number | string;
    }
  | { field_id: number; operator: 'in' | 'not_in'; value: (string | number)[] };

export interface ConditionalRuleGroup {
  rules: ConditionalRule[];
  group_logic: LogicType;
}

export interface ConditionalLogic {
  enabled: boolean;
  logic_type: LogicType;
  rule_groups: ConditionalRuleGroup[];
}

// ==================== FIELD DEFINITION ====================

export interface FieldDefinition {
  id: number;
  field_group_id: number;
  name: string;
  label: string;
  field_type: FieldType;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: FieldOption[];
  validation_rules?: ValidationRules;
  conditional_logic?: ConditionalLogic;
  is_searchable: boolean;
  is_filterable: boolean;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FieldDefinitionFormData {
  name: string;
  label: string;
  field_type: FieldType;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: FieldOption[] | string;
  validation_rules?: ValidationRules;
  conditional_logic?: ConditionalLogic;
  is_searchable?: boolean;
  is_filterable?: boolean;
  sort_order?: number;
}

// ==================== FIELD GROUP ====================

export interface FieldGroup {
  id: number;
  organization_id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  fields?: FieldDefinition[];
}

export interface FieldGroupFormData {
  name: string;
  description?: string;
  organizationId: number;
}

// ==================== FIELD VALUES ====================

/**
 * Base properties shared by all field value types
 */
interface BaseFieldValue {
  id?: number;
  product_id: number;
  field_definition_id: number;
  field_definition?: FieldDefinition;
  // Additional properties from JOIN with field_definitions
  name?: string;
  label?: string;
  options?: FieldOption[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Discriminated union for field values based on field_type
 * Provides type safety for the value property
 */
export type FieldValue =
  | (BaseFieldValue & { field_type: FieldType.TEXT; value: string })
  | (BaseFieldValue & { field_type: FieldType.NUMBER; value: number })
  | (BaseFieldValue & { field_type: FieldType.SELECT; value: string })
  | (BaseFieldValue & { field_type: FieldType.RADIO; value: string })
  | (BaseFieldValue & { field_type: FieldType.CHECKBOX; value: string[] })
  | (BaseFieldValue & { field_type: FieldType.TOGGLE; value: boolean })
  | (BaseFieldValue & { field_type: FieldType.DATE; value: string })
  | (BaseFieldValue & { field_type: FieldType.TIME; value: string })
  | (BaseFieldValue & { field_type: FieldType.COLOR; value: string })
  | (BaseFieldValue & { field_type: FieldType.IMAGE; value: ImageMetadata[] })
  | (BaseFieldValue & { field_type: FieldType.FILE; value: FileMetadata[] })
  | (BaseFieldValue & { field_type: FieldType.RICHTEXT; value: string })
  | (BaseFieldValue & { field_type: never; value: unknown }); // Fallback for when field_type is not set

/**
 * Map of field values keyed by field definition ID
 * Uses unknown for flexibility when field types are not known at compile time
 */
export interface ProductFieldValues {
  [fieldDefinitionId: number]: unknown;
}

// ==================== FILE/IMAGE METADATA ====================

export interface FileMetadata {
  url: string;
  name?: string;
  size?: number; // in bytes
  type?: string; // MIME type
}

export interface ImageMetadata extends FileMetadata {
  alt_text?: string;
  width?: number;
  height?: number;
}

// ==================== SEARCH/FILTER ====================

export type FilterOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'between'
  | 'in'
  | 'not_in'
  | 'is_empty'
  | 'is_not_empty'
  | 'json_contains';

/**
 * Discriminated union for custom field filters
 * Provides type safety based on field_type and operator
 */
export type CustomFieldFilter =
  | {
      field_id: number;
      field_type: FieldType.TEXT | FieldType.RICHTEXT;
      operator:
        | 'equals'
        | 'not_equals'
        | 'contains'
        | 'not_contains'
        | 'starts_with'
        | 'ends_with'
        | 'is_empty'
        | 'is_not_empty';
      value?: string;
    }
  | {
      field_id: number;
      field_type: FieldType.NUMBER;
      operator:
        | 'equals'
        | 'not_equals'
        | 'greater_than'
        | 'less_than'
        | 'greater_than_or_equal'
        | 'less_than_or_equal'
        | 'between';
      value?: number | [number, number];
    }
  | {
      field_id: number;
      field_type: FieldType.SELECT | FieldType.RADIO;
      operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'is_empty' | 'is_not_empty';
      value?: string | string[];
    }
  | {
      field_id: number;
      field_type: FieldType.CHECKBOX;
      operator: 'contains' | 'not_contains' | 'in' | 'not_in' | 'is_empty' | 'is_not_empty';
      value?: string | string[];
    }
  | {
      field_id: number;
      field_type: FieldType.TOGGLE;
      operator: 'equals' | 'not_equals';
      value?: boolean;
    }
  | {
      field_id: number;
      field_type: FieldType.DATE | FieldType.TIME;
      operator:
        | 'equals'
        | 'not_equals'
        | 'greater_than'
        | 'less_than'
        | 'greater_than_or_equal'
        | 'less_than_or_equal'
        | 'between'
        | 'is_empty'
        | 'is_not_empty';
      value?: string | [string, string];
    }
  | {
      field_id: number;
      field_type: FieldType.COLOR;
      operator: 'equals' | 'not_equals' | 'is_empty' | 'is_not_empty';
      value?: string;
    }
  | {
      field_id: number;
      field_type: FieldType.IMAGE | FieldType.FILE;
      operator: 'is_empty' | 'is_not_empty' | 'json_contains';
      value?: string;
    };

export interface FilterOption {
  value: unknown;
  count: number;
}

// ==================== API RESPONSES ====================

export interface ValidationError {
  field_id: number;
  errors: string[];
}

export interface BatchUpdateResponse {
  success: boolean;
  message?: string;
  errors?: ValidationError[];
}

// ==================== UI STATE ====================

export interface FieldVisibilityMap {
  [fieldDefinitionId: number]: boolean;
}

export interface FieldErrorsMap {
  [fieldDefinitionId: number]: string[];
}

// ==================== FORM DATA ====================

export interface ConditionalLogicFormData {
  enabled: boolean;
  logic_type: LogicType;
  rule_groups: ConditionalRuleGroup[];
}

// ==================== UTILITY TYPES ====================

export type FieldValueByType<T extends FieldType> = T extends FieldType.TEXT
  ? string
  : T extends FieldType.NUMBER
    ? number
    : T extends FieldType.SELECT
      ? string
      : T extends FieldType.RADIO
        ? string
        : T extends FieldType.CHECKBOX
          ? string[]
          : T extends FieldType.TOGGLE
            ? boolean
            : T extends FieldType.DATE
              ? string
              : T extends FieldType.TIME
                ? string
                : T extends FieldType.COLOR
                  ? string
                  : T extends FieldType.IMAGE
                    ? ImageMetadata
                    : T extends FieldType.FILE
                      ? FileMetadata
                      : T extends FieldType.RICHTEXT
                        ? string
                        : unknown;
