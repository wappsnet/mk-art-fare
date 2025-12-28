import { FieldDefinition, FieldType, FieldValue } from '@/types/fields.ts';

export const generateFieldDefinition = ({
  field,
  fieldValue,
}: {
  field: FieldDefinition;
  fieldValue?: FieldValue;
}): FieldDefinition => {
  if (!fieldValue) {
    return field;
  }

  switch (field.type) {
    case FieldType.TEXT:
      if (fieldValue.type === FieldType.TEXT) {
        return { ...field, fieldValue };
      }
      return field;

    case FieldType.NUMBER:
      if (fieldValue.type === FieldType.NUMBER) {
        return { ...field, fieldValue };
      }
      return field;

    case FieldType.SELECT:
      if (fieldValue.type === FieldType.SELECT) {
        return { ...field, fieldValue };
      }
      return field;

    case FieldType.RADIO:
      if (fieldValue.type === FieldType.RADIO) {
        return { ...field, fieldValue };
      }
      return field;

    case FieldType.CHECKBOX:
      if (fieldValue.type === FieldType.CHECKBOX) {
        return { ...field, fieldValue };
      }
      return field;

    case FieldType.TOGGLE:
      if (fieldValue.type === FieldType.TOGGLE) {
        return { ...field, fieldValue };
      }
      return field;

    default:
      return field;
  }
};
