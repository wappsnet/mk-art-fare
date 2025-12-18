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

export interface ConditionalRule {
  field_id: number;
  operator: ConditionalOperator;
  value: any;
}

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
  options?: FieldOption[];
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

export interface FieldValue {
  id?: number;
  product_id: number;
  field_definition_id: number;
  value: any; // Can be string, number, boolean, array, object depending on field type
  field_definition?: FieldDefinition;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFieldValues {
  [fieldDefinitionId: number]: any;
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

export interface CustomFieldFilter {
  field_id: number;
  field_type: FieldType;
  operator: FilterOperator;
  value: any;
}

export interface FilterOption {
  value: any;
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
  : any;
