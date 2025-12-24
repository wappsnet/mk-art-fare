export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  TOGGLE = 'toggle',
  DATE = 'date',
  TIME = 'time',
  COLOR = 'color',
  IMAGE = 'image',
  FILE = 'file',
  RICHTEXT = 'richtext',
}

export interface FieldOption {
  label: string;
  value: string;
}

export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number;
  pattern?: string;
  minDate?: string;
  maxDate?: string;
  minSelect?: number;
  maxSelect?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
}

export interface FileMetadata {
  url: string;
  name?: string;
  size?: number;
  type?: string;
}

export interface ImageMetadata extends FileMetadata {
  alt_text?: string;
  width?: number;
  height?: number;
}

// interface BaseFieldValue {
//   id: number;
//   field_definition_id: number;
//   name: string;
//   label: string;
//   created_at?: string;
//   updated_at?: string;
// }

export interface TextFieldValue {
  type: FieldType.TEXT;
  value: string;
}

export interface NumberFieldValue {
  type: FieldType.NUMBER;
  value: number;
}

export interface SelectFieldValue {
  type: FieldType.SELECT;
  value: string;
}

export interface RadioFieldValue {
  type: FieldType.RADIO;
  value: string;
}

export interface CheckboxFieldValue {
  type: FieldType.CHECKBOX;
  value: string[];
}

export interface ToggleFieldValue {
  type: FieldType.TOGGLE;
  value: boolean;
}

export interface DateFieldValue {
  type: FieldType.DATE;
  value: string;
}

export interface TimeFieldValue {
  type: FieldType.TIME;
  value: string;
}

export interface ColorFieldValue {
  type: FieldType.COLOR;
  value: string;
}

export interface ImageFieldValue {
  type: FieldType.IMAGE;
  value: ImageMetadata[];
}

export interface FileFieldValue {
  type: FieldType.FILE;
  value: FileMetadata[];
}

export interface RichTextFieldValue {
  type: FieldType.RICHTEXT;
  value: string;
}

export type FieldValue =
  | TextFieldValue
  | NumberFieldValue
  | SelectFieldValue
  | RadioFieldValue
  | CheckboxFieldValue
  | ToggleFieldValue
  | DateFieldValue
  | TimeFieldValue
  | ColorFieldValue
  | ImageFieldValue
  | FileFieldValue
  | RichTextFieldValue;

interface BaseFieldDefinition {
  id: number;
  name: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  sortOrder: number;
}

export interface TextFieldDefinition extends BaseFieldDefinition {
  type: FieldType.TEXT;
  value?: string;
  defaultValue?: string;
  validation?: Pick<ValidationRules, 'minLength' | 'maxLength' | 'pattern'>;
}

export interface NumberFieldDefinition extends BaseFieldDefinition {
  type: FieldType.NUMBER;
  value?: number;
  defaultValue?: number;
  validation?: Pick<ValidationRules, 'min' | 'max' | 'step'>;
}

export interface SelectFieldDefinition extends BaseFieldDefinition {
  type: FieldType.SELECT;
  value?: string;
  defaultValue?: string;
  options: FieldOption[];
}

export interface RadioFieldDefinition extends BaseFieldDefinition {
  type: FieldType.RADIO;
  value?: string;
  defaultValue?: string;
  options: FieldOption[];
}

export interface CheckboxFieldDefinition extends BaseFieldDefinition {
  type: FieldType.CHECKBOX;
  value?: string[];
  defaultValue?: string[];
  options: FieldOption[];
  validation?: Pick<ValidationRules, 'minSelect' | 'maxSelect'>;
}

export interface ToggleFieldDefinition extends BaseFieldDefinition {
  type: FieldType.TOGGLE;
  value?: boolean;
  defaultValue?: boolean;
}

export interface DateFieldDefinition extends BaseFieldDefinition {
  type: FieldType.DATE;
  value?: string;
  defaultValue?: string;
  validation?: Pick<ValidationRules, 'minDate' | 'maxDate'>;
}

export interface TimeFieldDefinition extends BaseFieldDefinition {
  type: FieldType.TIME;
  value?: string;
  defaultValue?: string;
}

export interface ColorFieldDefinition extends BaseFieldDefinition {
  type: FieldType.COLOR;
  value?: string;
  defaultValue?: string;
}

export interface ImageFieldDefinition extends BaseFieldDefinition {
  type: FieldType.IMAGE;
  value?: ImageMetadata[];
  defaultValue?: ImageMetadata[];
  validation?: Pick<ValidationRules, 'maxFileSize' | 'allowedTypes' | 'minSelect' | 'maxSelect'>;
}

export interface FileFieldDefinition extends BaseFieldDefinition {
  type: FieldType.FILE;
  value?: FileMetadata[];
  defaultValue?: FileMetadata[];
  validation?: Pick<ValidationRules, 'maxFileSize' | 'allowedTypes' | 'minSelect' | 'maxSelect'>;
}

export interface RichTextFieldDefinition extends BaseFieldDefinition {
  type: FieldType.RICHTEXT;
  value?: string;
  defaultValue?: string;
  validation?: Pick<ValidationRules, 'minLength' | 'maxLength'>;
}

export type FieldDefinition =
  | TextFieldDefinition
  | NumberFieldDefinition
  | SelectFieldDefinition
  | RadioFieldDefinition
  | CheckboxFieldDefinition
  | ToggleFieldDefinition
  | DateFieldDefinition
  | TimeFieldDefinition
  | ColorFieldDefinition
  | ImageFieldDefinition
  | FileFieldDefinition
  | RichTextFieldDefinition;

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

export interface FieldDefinitionFormData {
  name: string;
  label: string;
  field_type: FieldType;
  placeholder?: string;
  help_text?: string;
  default_value?: string;
  options?: FieldOption[] | string;
  validation_rules?: Partial<ValidationRules>;
  is_searchable?: boolean;
  is_filterable?: boolean;
  sort_order?: number;
}

export interface ProductFieldValues {
  [fieldDefinitionId: number]: FieldValue['value'];
}
