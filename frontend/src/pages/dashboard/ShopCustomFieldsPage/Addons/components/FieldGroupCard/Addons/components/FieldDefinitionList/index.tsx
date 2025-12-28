import { FC } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { List, ListItem, Button, Stack, Chip, Typography, Box } from '@mui/material';

import { useConfirm } from '@/components/ConfirmDialog';
import { FieldDefinition, FieldType } from '@/types/fields';

interface FieldDefinitionListProps {
  fields: FieldDefinition[];
  groupId: number;
  onEditField: (groupId: number, field: FieldDefinition) => void;
  onDeleteField: (groupId: number, fieldId: number) => void;
  getFieldTypeColor: (type: FieldType) => string;
}

const FieldDefinitionList: FC<FieldDefinitionListProps> = ({
  fields,
  groupId,
  onEditField,
  onDeleteField,
  getFieldTypeColor,
}) => {
  const { confirm } = useConfirm();

  const confirmDelete = (field: FieldDefinition) => {
    confirm({
      title: 'Delete Field Definition',
      content: `Are you sure you want to delete "${field.label}"?`,
      onConfirm: () => onDeleteField(groupId, field.id),
    });
  };

  if (fields.length === 0) {
    return (
      <Typography color="text.secondary">
        No field definitions yet. Add your first field!
      </Typography>
    );
  }

  const getMuiColor = (
    antdColor: string
  ): 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'default' => {
    const colorMap: Record<
      string,
      'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | 'default'
    > = {
      blue: 'primary',
      green: 'success',
      purple: 'secondary',
      magenta: 'error',
      orange: 'warning',
      cyan: 'info',
      geekblue: 'primary',
      gold: 'warning',
      volcano: 'error',
      lime: 'success',
      red: 'error',
    };
    return colorMap[antdColor] || 'default';
  };

  return (
    <List>
      {fields.map((field) => (
        <ListItem
          key={field.id}
          sx={{
            flexDirection: 'column',
            alignItems: 'flex-start',
            borderBottom: '1px solid',
            borderColor: 'divider',
            '&:last-child': { borderBottom: 'none' },
          }}
        >
          <Stack direction="row" justifyContent="space-between" sx={{ width: '100%', mb: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="subtitle2">{field.label}</Typography>
              <Chip
                label={field.type}
                color={getMuiColor(getFieldTypeColor(field.type))}
                size="small"
              />
              {field.required && <Chip label="Required" color="error" size="small" />}
              {field.isSearchable && <Chip label="Searchable" color="primary" size="small" />}
              {field.isFilterable && <Chip label="Filterable" color="success" size="small" />}
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => onEditField(groupId, field)}
              >
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => confirmDelete(field)}
              >
                Delete
              </Button>
            </Stack>
          </Stack>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Name: {field.name}
            </Typography>
            {!!field.helpText && (
              <Typography variant="caption" color="text.secondary">
                {field.helpText}
              </Typography>
            )}
          </Box>
        </ListItem>
      ))}
    </List>
  );
};

export default FieldDefinitionList;
