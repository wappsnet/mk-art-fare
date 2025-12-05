import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, Space, Modal, Form, Input, message, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  useGetOrganizationCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '@/services/apiSlice';

const { Text } = Typography;

export const ShopCategoriesPage = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = parseInt(id!);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm] = Form.useForm();

  const { data: categoriesData } = useGetOrganizationCategoriesQuery(orgId);
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const allCategories = categoriesData?.data || [];

  const openCategoryModal = (category?: any) => {
    setEditingCategory(category || null);
    if (category) {
      categoryForm.setFieldsValue({
        name: category.name,
        description: category.description,
      });
    } else {
      categoryForm.resetFields();
    }
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (values: any) => {
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, ...values }).unwrap();
        message.success('Category updated successfully!');
      } else {
        await createCategory({ organizationId: orgId, ...values }).unwrap();
        message.success('Category created successfully!');
      }
      setIsCategoryModalOpen(false);
      categoryForm.resetFields();
    } catch (error: any) {
      message.error(error?.data?.message || `Failed to ${editingCategory ? 'update' : 'create'} category`);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      await deleteCategory(categoryId).unwrap();
      message.success('Category deleted successfully!');
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to delete category');
    }
  };

  const categoryColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <Space>
          {name}
          <Tag color={record.organization_id ? 'green' : 'blue'}>
            {record.organization_id ? 'Custom' : 'Global'}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => {
        if (!record.organization_id) {
          return <Text type="secondary">Global category</Text>;
        }
        return (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openCategoryModal(record)}
            >
              Edit
            </Button>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: 'Delete Category',
                  content: 'Are you sure you want to delete this category?',
                  onOk: () => handleDeleteCategory(record.id),
                });
              }}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%' }} direction="vertical">
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openCategoryModal()}>
          Create Custom Category
        </Button>
        <Text type="secondary">
          You can use global categories (blue tags) or create shop-specific categories (green tags)
        </Text>
      </Space>

      <Table
        columns={categoryColumns}
        dataSource={allCategories}
        rowKey="id"
        pagination={false}
      />

      {/* Category Modal */}
      <Modal
        title={editingCategory ? 'Edit Category' : 'Create Category'}
        open={isCategoryModalOpen}
        onCancel={() => {
          setIsCategoryModalOpen(false);
          categoryForm.resetFields();
        }}
        footer={null}
      >
        <Form form={categoryForm} layout="vertical" onFinish={handleCategorySubmit}>
          <Form.Item name="name" label="Category Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
                {editingCategory ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
