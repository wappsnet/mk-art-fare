import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Modal,
  message,
  Input,
  Image,
  Badge,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ShoppingOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Layout } from '@/components/Layout';
import { useGetProductsQuery, useModerateProductMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { Product } from '@/types/common';
import { Container, Header } from './styles';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const AdminProductModerationPage = () => {
  const navigate = useNavigate();
  const [moderationModal, setModerationModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  const { data: productsData, isLoading, refetch } = useGetProductsQuery({});
  const [moderateProduct, { isLoading: isModerating }] = useModerateProductMutation();

  const products = productsData?.data?.products || [];

  const handleModerate = async (productId: number, status: 'approved' | 'declined') => {
    try {
      await moderateProduct({
        id: productId,
        status,
        note: moderationNote,
      }).unwrap();

      message.success(`Product ${status === 'approved' ? 'approved' : 'declined'} successfully`);
      setModerationModal(false);
      setModerationNote('');
      setSelectedProduct(null);
      refetch();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to moderate product');
    }
  };

  const openModerationModal = (product: Product) => {
    setSelectedProduct(product);
    setModerationModal(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Image',
      dataIndex: 'primary_image_url',
      key: 'primary_image_url',
      width: 100,
      render: (url: string) => (
        <Image
          src={url || 'https://via.placeholder.com/80'}
          alt="Product"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      ),
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Product) => (
        <div>
          <Space>
            <Text strong>{name}</Text>
            {record.moderation_status === 'approved' && (
              <Badge
                count={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
                title="Moderated"
              />
            )}
          </Space>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.sku}
          </Text>
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price?.toFixed(2) || '0.00'}`,
      sorter: (a: Product, b: Product) =>
        Number.parseFloat(a.price || '0') - Number.parseFloat(b.price || '0'),
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock: number) => (
        <Tag color={stock > 0 ? 'success' : 'error'}>
          {stock > 0 ? `${stock} in stock` : 'Out of stock'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'moderation_status',
      key: 'moderation_status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: 'warning',
          approved: 'success',
          declined: 'error',
        };
        return (
          <Tag color={colorMap[status] || 'default'}>{(status || 'pending').toUpperCase()}</Tag>
        );
      },
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Declined', value: 'declined' },
      ],
      onFilter: (value: unknown, record: Product) =>
        (record.moderation_status || 'pending') === value,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: Product, b: Product) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Product) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/products/${record.slug}`)}
          >
            View
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => openModerationModal(record)}
            disabled={record.moderation_status === 'approved'}
          >
            Moderate
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Container>
        <Header>
          <div>
            <Title level={2}>
              <ShoppingOutlined /> Product Moderation
            </Title>
            <Text type="secondary">Review and moderate product listings</Text>
          </div>
        </Header>

        <Card>
          <Table
            dataSource={products}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 20, showSizeChanger: true }}
          />
        </Card>

        <Modal
          title="Moderate Product"
          open={moderationModal}
          onCancel={() => {
            setModerationModal(false);
            setModerationNote('');
            setSelectedProduct(null);
          }}
          footer={null}
          width={600}
        >
          {selectedProduct && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                {selectedProduct.primary_image_url && (
                  <Image
                    src={selectedProduct.primary_image_url}
                    alt={selectedProduct.name}
                    width="100%"
                    height={200}
                    style={{ objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
                  />
                )}
                <Title level={4}>{selectedProduct.name}</Title>
                <Paragraph type="secondary">{selectedProduct.description}</Paragraph>
                <Space>
                  <Text strong>Price:</Text>
                  <Text>${Number.parseFloat(selectedProduct.price || '0').toFixed(2)}</Text>
                </Space>
                <br />
                <Space>
                  <Text strong>SKU:</Text>
                  <Text>{selectedProduct.sku}</Text>
                </Space>
              </div>

              <div>
                <Text strong>Moderation Note (Optional):</Text>
                <TextArea
                  rows={4}
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  placeholder="Add a note about this moderation decision..."
                />
              </div>

              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleModerate(selectedProduct.id, 'declined')}
                  loading={isModerating}
                >
                  Decline
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleModerate(selectedProduct.id, 'approved')}
                  loading={isModerating}
                >
                  Approve
                </Button>
              </Space>
            </Space>
          )}
        </Modal>
      </Container>
    </Layout>
  );
};
