import { FC } from 'react';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import { Card, CardHeader, CardContent, Button, Chip, Stack, Divider, Box } from '@mui/material';

import { useConfirm } from '@/components/ConfirmDialog';
import { useDeleteFieldGroupMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { FieldGroup, FieldDefinition, FieldType } from '@/types/fields';
import { message } from '@/utils/notification';

import FieldDefinitionList from './Addons/components/FieldDefinitionList';

interface FieldGroupCardProps {
  group: FieldGroup;
  onEditGroup: (group: FieldGroup) => void;
  onAddField: (groupId: number) => void;
  onEditField: (groupId: number, field: FieldDefinition) => void;
  onDeleteField: (groupId: number, fieldId: number) => void;
  getFieldTypeColor: (type: FieldType) => string;
}

const FieldGroupCard: FC<FieldGroupCardProps> = ({
  group,
  onEditGroup,
  onAddField,
  onEditField,
  onDeleteField,
  getFieldTypeColor,
}) => {
  const [deleteFieldGroup] = useDeleteFieldGroupMutation();
  const { confirm } = useConfirm();

  const handleDeleteGroup = async () => {
    try {
      await deleteFieldGroup(group.id).unwrap();
      message.success('Field group deleted successfully!');
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to delete field group');
    }
  };

  const confirmDeleteGroup = () => {
    confirm({
      title: 'Delete Field Group',
      content: 'Are you sure? This will delete all field definitions in this group.',
      onConfirm: handleDeleteGroup,
    });
  };

  return (
    <Card>
      <CardHeader
        avatar={<SettingsIcon />}
        title={
          <Stack direction="row" spacing={1} alignItems="center">
            <span>{group.name}</span>
            {!group.is_active && <Chip label="Inactive" size="small" />}
          </Stack>
        }
        action={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={() => onAddField(group.id)}
            >
              Add Field
            </Button>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => onEditGroup(group)}
            />
            <Button
              size="small"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={confirmDeleteGroup}
            />
          </Stack>
        }
      />
      <CardContent>
        {group.description && (
          <Box sx={{ mb: 2, color: 'text.secondary' }}>
            {group.description}
          </Box>
        )}
        <Divider sx={{ mb: 2 }} />
        <FieldDefinitionList
          fields={group.fields || []}
          groupId={group.id}
          onEditField={onEditField}
          onDeleteField={onDeleteField}
          getFieldTypeColor={getFieldTypeColor}
        />
      </CardContent>
    </Card>
  );
};

export default FieldGroupCard;
