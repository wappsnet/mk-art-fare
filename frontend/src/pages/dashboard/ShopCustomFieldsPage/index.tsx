import { useState, useMemo } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Card, Button, Space, Typography, Drawer, Form, message } from 'antd';
import { useParams } from 'react-router';

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

import FieldDefinitionForm from './Addons/components/FieldDefinitionForm';
import FieldGroupCard from './Addons/components/FieldGroupCard';
import FieldGroupForm from './Addons/components/FieldGroupForm';
import { TopSpaceStyled } from './styles';

const { Title, Text } = Typography;

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
  // With proper JSON types, we can use values directly without conversion
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

  // Only add options for field types that support them
  switch (field.type) {
    case FieldType.SELECT:
    case FieldType.RADIO:
    case FieldType.CHECKBOX:
      formValues.options = field.options;
      break;
  }

  return formValues;
};

const ShopCustomFieldsPage = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);

  const [isGroupDrawerOpen, setIsGroupDrawerOpen] = useState(false);
  const [isFieldDrawerOpen, setIsFieldDrawerOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FieldGroup | null>(null);
  const [editingField, setEditingField] = useState<FieldDefinition | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [groupForm] = Form.useForm();
  const [fieldForm] = Form.useForm();

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
      groupForm.setFieldsValue({
        name: group.name,
        description: group.description,
      });
    } else {
      groupForm.resetFields();
    }
    setIsGroupDrawerOpen(true);
  };

  const openFieldDrawer = (groupId: number, field?: FieldDefinition) => {
    setSelectedGroupId(groupId);
    setEditingField(field || null);

    if (field) {
      const formValues = extractFieldFormValues(field);
      fieldForm.setFieldsValue(formValues);
    } else {
      fieldForm.resetFields();
      fieldForm.setFieldValue('is_searchable', false);
      fieldForm.setFieldValue('is_filterable', false);
      fieldForm.setFieldValue('sort_order', 0);
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
      groupForm.resetFields();
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
      // Convert default_value based on field type before sending to backend
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
      fieldForm.resetFields();
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

  const selectedFieldType = Form.useWatch('field_type', fieldForm);

  return (
    <div>
      <TopSpaceStyled>
        <Title level={2}>Custom Fields</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openGroupDrawer()}>
          Add Field Group
        </Button>
      </TopSpaceStyled>

      {fieldGroups.length > 0 ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
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
        </Space>
      ) : (
        <Card>
          <Text type="secondary">
            No field groups yet. Create your first field group to start adding custom fields to your
            products!
          </Text>
        </Card>
      )}

      {/* Field Group Drawer */}
      <Drawer
        title={editingGroup ? 'Edit Field Group' : 'Create Field Group'}
        open={isGroupDrawerOpen}
        onClose={() => {
          setIsGroupDrawerOpen(false);
          setEditingGroup(null);
          groupForm.resetFields();
        }}
        width={500}
        footer={
          <Space>
            <Button
              onClick={() => {
                setIsGroupDrawerOpen(false);
                setEditingGroup(null);
                groupForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => groupForm.submit()}
              loading={isCreatingGroup || isUpdatingGroup}
            >
              {editingGroup ? 'Update' : 'Create'}
            </Button>
          </Space>
        }
      >
        <FieldGroupForm form={groupForm} onFinish={handleGroupSubmit} />
      </Drawer>

      {/* Field Definition Drawer */}
      <Drawer
        title={editingField ? 'Edit Field Definition' : 'Create Field Definition'}
        open={isFieldDrawerOpen}
        onClose={() => {
          setIsFieldDrawerOpen(false);
          setEditingField(null);
          setSelectedGroupId(null);
          fieldForm.resetFields();
        }}
        width={600}
        footer={
          <Space>
            <Button
              onClick={() => {
                setIsFieldDrawerOpen(false);
                setEditingField(null);
                setSelectedGroupId(null);
                fieldForm.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={() => fieldForm.submit()}
              loading={isCreatingField || isUpdatingField}
            >
              {editingField ? 'Update' : 'Create'}
            </Button>
          </Space>
        }
      >
        <FieldDefinitionForm
          form={fieldForm}
          selectedFieldType={selectedFieldType}
          fieldTypeNeedsOptions={fieldTypeNeedsOptions}
          onFinish={handleFieldSubmit}
        />
      </Drawer>
    </div>
  );
};

export default ShopCustomFieldsPage;
