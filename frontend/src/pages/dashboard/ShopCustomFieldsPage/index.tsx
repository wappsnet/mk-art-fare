import { FC, useState, useMemo } from 'react';

import AddIcon from '@mui/icons-material/Add';
import { Button, Stack, Typography, Card, CardContent, Box } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import { useParams } from 'react-router';

import AppDrawer from '@/components/AppDrawer';
import {
  useGetFieldGroupsQuery,
  useCreateFieldGroupMutation,
  useUpdateFieldGroupMutation,
  useCreateFieldDefinitionMutation,
  useUpdateFieldDefinitionMutation,
  useDeleteFieldDefinitionMutation,
} from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { FieldGroup, FieldDefinition, FieldType, FieldFormValues } from '@/types/fields';
import { message } from '@/utils/notification';

import FieldDefinitionForm from './Addons/components/FieldDefinitionForm';
import FieldGroupCard from './Addons/components/FieldGroupCard';
import FieldGroupForm from './Addons/components/FieldGroupForm';

const getFieldTypeColor = (type: FieldType): string => {
  switch (type) {
    case FieldType.TEXT:
      return 'blue';
    case FieldType.NUMBER:
      return 'green';
    case FieldType.SELECT:
      return 'purple';
    case FieldType.RADIO:
      return 'magenta';
    case FieldType.CHECKBOX:
      return 'orange';
    case FieldType.TOGGLE:
      return 'cyan';
    case FieldType.DATE:
      return 'geekblue';
    case FieldType.TIME:
      return 'gold';
    case FieldType.COLOR:
      return 'volcano';
    case FieldType.IMAGE:
      return 'lime';
    case FieldType.FILE:
      return 'red';
    case FieldType.RICHTEXT:
      return 'purple';
    default:
      return 'default';
  }
};

const fieldTypeNeedsOptions = (fieldType?: FieldType): boolean => {
  if (!fieldType) return false;

  switch (fieldType) {
    case FieldType.SELECT:
    case FieldType.RADIO:
    case FieldType.CHECKBOX:
      return true;
    default:
      return false;
  }
};

const extractFieldFormValues = (field: FieldDefinition): Partial<FieldFormValues> => {
  const formValues: Partial<FieldFormValues> = {
    name: field.name,
    label: field.label,
    field_type: field.type,
    placeholder: field.placeholder,
    help_text: field.helpText,
    is_searchable: field.isSearchable,
    is_filterable: field.isFilterable,
    sort_order: field.sortOrder,
    default_value: field.defaultValue,
  };

  switch (field.type) {
    case FieldType.SELECT:
    case FieldType.RADIO:
    case FieldType.CHECKBOX:
      formValues.options = field.options;
      break;
  }

  return formValues;
};

const ShopCustomFieldsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);

  const [isGroupDrawerOpen, setIsGroupDrawerOpen] = useState(false);
  const [isFieldDrawerOpen, setIsFieldDrawerOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FieldGroup | null>(null);
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const groupFormMethods = useForm<{ name: string; description?: string }>({
    defaultValues: { name: '', description: '' },
  });

  const fieldFormMethods = useForm<FieldFormValues>({
    defaultValues: {
      name: '',
      label: '',
      field_type: undefined,
      placeholder: '',
      help_text: '',
      is_searchable: false,
      is_filterable: false,
      sort_order: 0,
      default_value: undefined,
      options: [],
    },
  });

  const { data: fieldGroupsData } = useGetFieldGroupsQuery({
    organizationId: orgId,
    includeFields: true,
  });

  const [createFieldGroup, { isLoading: isCreatingGroup }] = useCreateFieldGroupMutation();
  const [updateFieldGroup, { isLoading: isUpdatingGroup }] = useUpdateFieldGroupMutation();
  const [createFieldDefinition, { isLoading: isCreatingField }] =
    useCreateFieldDefinitionMutation();
  const [updateFieldDefinition, { isLoading: isUpdatingField }] =
    useUpdateFieldDefinitionMutation();
  const [deleteFieldDefinition] = useDeleteFieldDefinitionMutation();

  const fieldGroups = useMemo(() => fieldGroupsData?.data ?? [], [fieldGroupsData?.data]);

  const openGroupDrawer = (group?: FieldGroup) => {
    setEditingGroup(group || null);
    if (group) {
      groupFormMethods.reset({
        name: group.name,
        description: group.description,
      });
    } else {
      groupFormMethods.reset({ name: '', description: '' });
    }
    setIsGroupDrawerOpen(true);
  };

  const openFieldDrawer = (groupId: number, field?: FieldDefinition) => {
    setSelectedGroupId(groupId);
    setEditingField(field || null);

    if (field) {
      const formValues = extractFieldFormValues(field);
      fieldFormMethods.reset(formValues as FieldFormValues);
    } else {
      fieldFormMethods.reset({
        name: '',
        label: '',
        field_type: undefined,
        placeholder: '',
        help_text: '',
        is_searchable: false,
        is_filterable: false,
        sort_order: 0,
        default_value: undefined,
        options: [],
      });
    }
    setIsFieldDrawerOpen(true);
  };

  const handleGroupSubmit = async (values: { name: string; description?: string }) => {
    try {
      if (editingGroup) {
        await updateFieldGroup({
          id: editingGroup.id,
          data: values,
        }).unwrap();
        message.success('Field group updated successfully!');
      } else {
        await createFieldGroup({
          ...values,
          organizationId: orgId,
        }).unwrap();
        message.success('Field group created successfully!');
      }
      setIsGroupDrawerOpen(false);
      setEditingGroup(null);
      groupFormMethods.reset();
    } catch (error) {
      message.error(
        getErrorMessage(error) || `Failed to ${editingGroup ? 'update' : 'create'} field group`
      );
    }
  };

  const handleFieldSubmit = async (values: FieldFormValues) => {
    if (!selectedGroupId) {
      return;
    }

    try {
      const fieldData = {
        name: values.name,
        label: values.label,
        field_type: values.field_type,
        placeholder: values.placeholder ?? null,
        help_text: values.help_text ?? null,
        default_value: values.default_value ?? null,
        options: values.options ?? null,
        validation_rules: values.validation_rules ?? null,
        is_searchable: values.is_searchable ?? false,
        is_filterable: values.is_filterable ?? false,
        sort_order: values.sort_order ?? 0,
      };

      if (editingField) {
        await updateFieldDefinition({
          fieldGroupId: selectedGroupId,
          fieldId: editingField.id,
          data: fieldData,
        }).unwrap();
        message.success('Field definition updated successfully!');
      } else {
        await createFieldDefinition({
          fieldGroupId: selectedGroupId,
          data: fieldData,
        }).unwrap();
        message.success('Field definition created successfully!');
      }

      setIsFieldDrawerOpen(false);
      setEditingField(null);
      setSelectedGroupId(null);
      fieldFormMethods.reset();
    } catch (error) {
      message.error(
        getErrorMessage(error) || `Failed to ${editingField ? 'update' : 'create'} field definition`
      );
    }
  };

  const handleDeleteField = async (groupId: number, fieldId: number) => {
    try {
      await deleteFieldDefinition({ fieldGroupId: groupId, fieldId }).unwrap();
      message.success('Field definition deleted successfully!');
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to delete field definition');
    }
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Custom Fields
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create field groups to add custom fields to your products
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openGroupDrawer()}>
          Add Field Group
        </Button>
      </Box>

      {fieldGroups.length > 0 ? (
        <Stack spacing={3}>
          {fieldGroups.map((group) => (
            <FieldGroupCard
              key={group.id}
              group={group}
              onEditGroup={openGroupDrawer}
              onAddField={openFieldDrawer}
              onEditField={openFieldDrawer}
              onDeleteField={handleDeleteField}
              getFieldTypeColor={getFieldTypeColor}
            />
          ))}
        </Stack>
      ) : (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No field groups yet. Create your first field group to start adding custom fields to
              your products!
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Field Group Drawer */}
      <AppDrawer
        open={isGroupDrawerOpen}
        onClose={() => {
          setIsGroupDrawerOpen(false);
          setEditingGroup(null);
          groupFormMethods.reset();
        }}
        title={editingGroup ? 'Edit Field Group' : 'Create Field Group'}
        width={500}
        footer={
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={() => {
                setIsGroupDrawerOpen(false);
                setEditingGroup(null);
                groupFormMethods.reset();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={groupFormMethods.handleSubmit(handleGroupSubmit)}
              variant="contained"
              disabled={isCreatingGroup || isUpdatingGroup}
            >
              {editingGroup ? 'Update' : 'Create'}
            </Button>
          </Stack>
        }
      >
        <FormProvider {...groupFormMethods}>
          <Stack spacing={3}>
            <FieldGroupForm />
          </Stack>
        </FormProvider>
      </AppDrawer>

      {/* Field Definition Drawer */}
      <AppDrawer
        open={isFieldDrawerOpen}
        onClose={() => {
          setIsFieldDrawerOpen(false);
          setEditingField(null);
          setSelectedGroupId(null);
          fieldFormMethods.reset();
        }}
        title={editingField ? 'Edit Field Definition' : 'Create Field Definition'}
        width={600}
        footer={
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              onClick={() => {
                setIsFieldDrawerOpen(false);
                setEditingField(null);
                setSelectedGroupId(null);
                fieldFormMethods.reset();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={fieldFormMethods.handleSubmit(handleFieldSubmit)}
              variant="contained"
              disabled={isCreatingField || isUpdatingField}
            >
              {editingField ? 'Update' : 'Create'}
            </Button>
          </Stack>
        }
      >
        <FormProvider {...fieldFormMethods}>
          <Stack spacing={3}>
            <FieldDefinitionForm fieldTypeNeedsOptions={fieldTypeNeedsOptions} />
          </Stack>
        </FormProvider>
      </AppDrawer>
    </Stack>
  );
};

export default ShopCustomFieldsPage;
