import { FC, useMemo } from 'react';

import { Box } from '@mui/material';

import { FieldDefinition, FieldType, FieldValue } from '@/types/fields';

import { CheckboxField } from './Addons/components/CheckboxField';
import { NumberField } from './Addons/components/NumberField';
import { SelectField } from './Addons/components/SelectField';
import { TextField } from './Addons/components/TextField';
import { ToggleField } from './Addons/components/ToggleField';

export interface DynamicFieldRendererProps {
  field: FieldDefinition;
  onChange: (value: FieldValue) => void;
  disabled?: boolean;
}

export const DynamicFieldRenderer: FC<DynamicFieldRendererProps> = ({
  field,
  onChange,
  disabled,
}) => {
  const content = useMemo(() => {
    switch (field.type) {
      case FieldType.TEXT:
        return <TextField field={field} onChange={onChange} disabled={disabled} />;

      case FieldType.NUMBER:
        return <NumberField field={field} onChange={onChange} disabled={disabled} />;

      case FieldType.SELECT:
        return <SelectField field={field} onChange={onChange} disabled={disabled} />;

      case FieldType.CHECKBOX:
        return <CheckboxField field={field} onChange={onChange} disabled={disabled} />;

      case FieldType.TOGGLE:
        return <ToggleField field={field} onChange={onChange} disabled={disabled} />;

      default:
        return null;
    }
  }, [disabled, field, onChange]);

  return <Box sx={{ mb: 2 }}>{content}</Box>;
};
