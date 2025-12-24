import { FieldType, FieldOption, ValidationRules, ImageMetadata, FileMetadata } from '@/types/fields';

export interface FieldFormValues {
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
