import { FC } from 'react';

import {
  TextField,
  Switch,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormGroup,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { FieldType, FieldFormValues } from '@/types/fields';

interface DefaultValueFieldProps {
  selectedFieldType: FieldType;
}

const DefaultValueField: FC<DefaultValueFieldProps> = ({ selectedFieldType }) => {
  const { control } = useFormContext<FieldFormValues>();

  // Watch options to get valid options for select/radio/checkbox
  const options = useWatch({ control, name: 'options' }) || [];
  const validOptions = options.filter((opt) => opt?.label && opt?.value);

  switch (selectedFieldType) {
    case FieldType.NUMBER:
      return (
        <Controller
          name="default_value"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Default Value"
              type="number"
              placeholder="Default number value"
              fullWidth
            />
          )}
        />
      );

    case FieldType.TOGGLE:
      return (
        <Controller
          name="default_value"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label="Default Value"
            />
          )}
        />
      );

    case FieldType.TEXT:
      return (
        <Controller
          name="default_value"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Default Value" placeholder="Default value" fullWidth />
          )}
        />
      );

    case FieldType.DATE:
      return (
        <Controller
          name="default_value"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Default Value"
              type="date"
              placeholder="Select default date"
              fullWidth
            />
          )}
        />
      );

    case FieldType.TIME:
      return (
        <Controller
          name="default_value"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Default Value"
              type="time"
              placeholder="Select default time"
              fullWidth
            />
          )}
        />
      );

    case FieldType.COLOR:
      return (
        <Controller
          name="default_value"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Default Value" type="color" fullWidth />
          )}
        />
      );

    case FieldType.SELECT:
      return (
        <Controller
          name="default_value"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth disabled={!validOptions.length}>
              <InputLabel>Default Value</InputLabel>
              <Select {...field} label="Default Value" value={field.value || ''}>
                {validOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        />
      );

    case FieldType.RADIO:
      return (
        <Controller
          name="default_value"
          control={control}
          render={({ field }) => (
            <FormControl component="fieldset" disabled={!validOptions.length}>
              <InputLabel shrink>Default Value</InputLabel>
              <RadioGroup {...field} value={field.value || ''} sx={{ mt: 3 }}>
                {validOptions.map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    control={<Radio />}
                    label={opt.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        />
      );

    case FieldType.CHECKBOX:
      return (
        <Controller
          name="default_value"
          control={control}
          render={({ field }) => {
            const currentValues = Array.isArray(field.value) ? (field.value as string[]) : [];

            const handleChangeField = (opt: string) => {
              if (opt) {
                field.onChange([...currentValues, opt]);
              } else {
                field.onChange(currentValues.filter((v) => v !== opt));
              }
            };

            return (
              <FormControl component="fieldset" disabled={!validOptions.length}>
                <InputLabel shrink>Default Values</InputLabel>
                <FormGroup sx={{ mt: 3 }}>
                  {validOptions.map((opt) => (
                    <FormControlLabel
                      key={opt.value}
                      control={
                        <Checkbox
                          value={opt.value}
                          checked={currentValues.includes(opt.value)}
                          onChange={(e) => {
                            handleChangeField(e.target.value);
                          }}
                        />
                      }
                      label={opt.label}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            );
          }}
        />
      );

    case FieldType.RICHTEXT:
      return (
        <Controller
          name="default_value"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Default Value"
              multiline
              rows={3}
              placeholder="Default rich text content"
              fullWidth
            />
          )}
        />
      );

    case FieldType.IMAGE:
    case FieldType.FILE:
      return (
        <Controller
          name="default_value"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Default Value (JSON)"
              multiline
              rows={2}
              placeholder='[{"url": "...", "name": "..."}]'
              helperText="Enter as JSON array"
              fullWidth
            />
          )}
        />
      );

    default:
      return null;
  }
};

export default DefaultValueField;
