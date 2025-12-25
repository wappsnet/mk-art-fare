import { FC } from 'react';

import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { List, Button, Space, Tag, Typography, Modal } from 'antd';

import { FieldDefinition, FieldType } from '@/types/fields';

import { FieldDefinitionItemStyled, FieldTypeTagStyled } from './styles';

const { Text } = Typography;

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
  if (fields.length === 0) {
    return <Text type="secondary">No field definitions yet. Add your first field!</Text>;
  }

  return (
    <List
      dataSource={fields}
      renderItem={(field) => (
        <FieldDefinitionItemStyled>
          <List.Item
            actions={[
              <Button
                key="edit"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEditField(groupId, field)}
              >
                Edit
              </Button>,
              <Button
                key="delete"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Delete Field Definition',
                    content: `Are you sure you want to delete "${field.label}"?`,
                    onOk: () => onDeleteField(groupId, field.id),
                  });
                }}
              >
                Delete
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  {field.label}
                  <FieldTypeTagStyled color={getFieldTypeColor(field.type)}>
                    {field.type}
                  </FieldTypeTagStyled>
                  {field.required && <Tag color="red">Required</Tag>}
                  {field.isSearchable && <Tag color="blue">Searchable</Tag>}
                  {field.isFilterable && <Tag color="green">Filterable</Tag>}
                </Space>
              }
              description={
                <Space direction="vertical" size="small">
                  <Text type="secondary">Name: {field.name}</Text>
                  {field.helpText && <Text type="secondary">{field.helpText}</Text>}
                </Space>
              }
            />
          </List.Item>
        </FieldDefinitionItemStyled>
      )}
    />
  );
};

export default FieldDefinitionList;
