import { FC } from 'react';
import { Card, Space, Button, Tag, Modal, Divider, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { FieldGroup, FieldDefinition, FieldType } from '@/types/fields';
import { useDeleteFieldGroupMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { FieldGroupCardStyled } from './styles';
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

  const handleDeleteGroup = async () => {
    try {
      await deleteFieldGroup(group.id).unwrap();
      message.success('Field group deleted successfully!');
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to delete field group');
    }
  };

  return (
    <FieldGroupCardStyled>
      <Card
        title={
          <Space>
            <SettingOutlined />
            {group.name}
            {!group.is_active && <Tag color="default">Inactive</Tag>}
          </Space>
        }
        extra={
          <Space>
            <Button size="small" icon={<PlusOutlined />} onClick={() => onAddField(group.id)}>
              Add Field
            </Button>
            <Button size="small" icon={<EditOutlined />} onClick={() => onEditGroup(group)} />
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Delete Field Group',
                  content: 'Are you sure? This will delete all field definitions in this group.',
                  onOk: handleDeleteGroup,
                });
              }}
            />
          </Space>
        }
      >
        {group.description && <Card.Meta description={group.description} />}
        <Divider />

        <FieldDefinitionList
          fields={group.fields || []}
          groupId={group.id}
          onEditField={onEditField}
          onDeleteField={onDeleteField}
          getFieldTypeColor={getFieldTypeColor}
        />
      </Card>
    </FieldGroupCardStyled>
  );
};

export default FieldGroupCard;
