import React, { useState } from 'react';
import { Card, Button, Table, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import {
  useGetFieldGroupsQuery,
  useCreateFieldGroupMutation,
  useUpdateFieldGroupMutation,
  useDeleteFieldGroupMutation,
} from '@/services/apiSlice';
import { FieldGroup, FieldGroupFormData } from '@/types/customFields';
import FieldDefinitionBuilder from '../FieldDefinitionBuilder';

interface FieldGroupManagerProps {
  organizationId: number;
}

const FieldGroupManager: React.FC<FieldGroupManagerProps> = ({ organizationId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FieldGroup | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<FieldGroup | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useGetFieldGroupsQuery({
    organizationId,
    includeFields: false,
  });
  const [createFieldGroup, { isLoading: isCreating }] = useCreateFieldGroupMutation();
  const [updateFieldGroup, { isLoading: isUpdating }] = useUpdateFieldGroupMutation();
  const [deleteFieldGroup] = useDeleteFieldGroupMutation();

  const handleCreate = () => {
    setEditingGroup(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (group: FieldGroup) => {
    setEditingGroup(group);
    form.setFieldsValue({
      name: group.name,
      description: group.description,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFieldGroup(id).unwrap();
      message.success('Field group deleted successfully');
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to delete field group');
    }
  };

  const handleSubmit = async (values: { name: string; description?: string }) => {
    try {
      const formData: FieldGroupFormData = {
        name: values.name,
        description: values.description,
        organizationId,
      };

      if (editingGroup) {
        await updateFieldGroup({
          id: editingGroup.id,
          data: formData,
        }).unwrap();
        message.success('Field group updated successfully');
      } else {
        await createFieldGroup(formData).unwrap();
        message.success('Field group created successfully');
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to save field group');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: FieldGroup) => (
        <Space>
          <Button
            type="link"
            icon={<SettingOutlined />}
            onClick={() => setSelectedGroup(record)}
          >
            Manage Fields
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete field group"
            description="Are you sure? This will remove all associated fields and data."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Field Groups"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            New Field Group
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingGroup ? 'Edit Field Group' : 'Create Field Group'}
        open={isModalOpen}
        onOk={form.submit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={isCreating || isUpdating}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <Input placeholder="e.g., Artwork Details, Product Specifications" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              placeholder="Describe what this field group is for"
            />
          </Form.Item>
        </Form>
      </Modal>

      {selectedGroup && (
        <FieldDefinitionBuilder
          fieldGroup={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </>
  );
};

export default FieldGroupManager;
