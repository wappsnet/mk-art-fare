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

interface BaseFieldValue {
  id: number;
  field_definition_id: number;
  name: string;
  label: string;
  created_at?: string;
  updated_at?: string;
}

export interface TextFieldValue extends BaseFieldValue {
  type: FieldType.TEXT;
  value: string;
}

export interface NumberFieldValue extends BaseFieldValue {
  type: FieldType.NUMBER;
  value: number;
}

export interface SelectFieldValue extends BaseFieldValue {
  type: FieldType.SELECT;
  value: string;
}

export interface RadioFieldValue extends BaseFieldValue {
  type: FieldType.RADIO;
  value: string;
}

export interface CheckboxFieldValue extends BaseFieldValue {
  type: FieldType.CHECKBOX;
  value: string[];
}

export interface ToggleFieldValue extends BaseFieldValue {
  type: FieldType.TOGGLE;
  value: boolean;
}

export interface DateFieldValue extends BaseFieldValue {
  type: FieldType.DATE;
  value: string;
}

export interface TimeFieldValue extends BaseFieldValue {
  type: FieldType.TIME;
  value: string;
}

export interface ColorFieldValue extends BaseFieldValue {
  type: FieldType.COLOR;
  value: string;
}

export interface ImageFieldValue extends BaseFieldValue {
  type: FieldType.IMAGE;
  value: ImageMetadata[];
}

export interface FileFieldValue extends BaseFieldValue {
  type: FieldType.FILE;
  value: FileMetadata[];
}

export interface RichTextFieldValue extends BaseFieldValue {
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
  fieldValue?: TextFieldValue;
  defaultValue?: string;
  validation?: Pick<ValidationRules, 'minLength' | 'maxLength' | 'pattern'>;
}

export interface NumberFieldDefinition extends BaseFieldDefinition {
  type: FieldType.NUMBER;
  fieldValue?: NumberFieldValue;
  defaultValue?: number;
  validation?: Pick<ValidationRules, 'min' | 'max' | 'step'>;
}

export interface SelectFieldDefinition extends BaseFieldDefinition {
  type: FieldType.SELECT;
  fieldValue?: SelectFieldValue;
  defaultValue?: string;
  options: FieldOption[];
}

export interface RadioFieldDefinition extends BaseFieldDefinition {
  type: FieldType.RADIO;
  fieldValue?: RadioFieldValue;
  defaultValue?: string;
  options: FieldOption[];
}

export interface CheckboxFieldDefinition extends BaseFieldDefinition {
  type: FieldType.CHECKBOX;
  fieldValue?: CheckboxFieldValue;
  defaultValue?: string[];
  options: FieldOption[];
  validation?: Pick<ValidationRules, 'minSelect' | 'maxSelect'>;
}

export interface ToggleFieldDefinition extends BaseFieldDefinition {
  type: FieldType.TOGGLE;
  fieldValue?: ToggleFieldValue;
  defaultValue?: boolean;
}

export interface DateFieldDefinition extends BaseFieldDefinition {
  type: FieldType.DATE;
  fieldValue?: DateFieldValue;
  defaultValue?: string;
  validation?: Pick<ValidationRules, 'minDate' | 'maxDate'>;
}

export interface TimeFieldDefinition extends BaseFieldDefinition {
  type: FieldType.TIME;
  fieldValue?: TimeFieldValue;
  defaultValue?: string;
}

export interface ColorFieldDefinition extends BaseFieldDefinition {
  type: FieldType.COLOR;
  fieldValue?: ColorFieldValue;
  defaultValue?: string;
}

export interface ImageFieldDefinition extends BaseFieldDefinition {
  type: FieldType.IMAGE;
  fieldValue?: ImageFieldValue;
  defaultValue?: ImageMetadata[];
  validation?: Pick<ValidationRules, 'maxFileSize' | 'allowedTypes' | 'minSelect' | 'maxSelect'>;
}

export interface FileFieldDefinition extends BaseFieldDefinition {
  type: FieldType.FILE;
  fieldValue?: FileFieldValue;
  defaultValue?: FileMetadata[];
  validation?: Pick<ValidationRules, 'maxFileSize' | 'allowedTypes' | 'minSelect' | 'maxSelect'>;
}

export interface RichTextFieldDefinition extends BaseFieldDefinition {
  type: FieldType.RICHTEXT;
  fieldValue?: RichTextFieldValue;
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
  default_value?: string | number | boolean | string[] | ImageMetadata[] | FileMetadata[];
  options?: FieldOption[];
  validation_rules?: Partial<ValidationRules>;
  is_searchable?: boolean;
  is_filterable?: boolean;
  sort_order?: number;
}

export interface ProductFieldValues {
  [fieldDefinitionId: number]: FieldValue['value'];
}
