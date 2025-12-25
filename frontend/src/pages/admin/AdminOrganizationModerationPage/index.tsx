import { useState } from 'react';

import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Card, Table, Tag, Button, Space, Typography, Modal, message, Input, Badge } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router';

import AppLayout from '@/components/AppLayout';
import {
  useGetOrganizationsQuery,
  useModerateOrganizationMutation,
  useDeleteOrganizationMutation,
} from '@/services/apiSlice';
import { Organization } from '@/types/common';
import { getErrorMessage } from '@/types/errors';

import { ContainerStyled, HeaderStyled } from './styles';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AdminOrganizationModerationPage = () => {
  const navigate = useNavigate();
  const [moderationModal, setModerationModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  const { data: orgsData, isLoading, refetch } = useGetOrganizationsQuery();
  const [moderateOrganization, { isLoading: isModerating }] = useModerateOrganizationMutation();
  const [deleteOrganization, { isLoading: isDeleting }] = useDeleteOrganizationMutation();

  const organizations = orgsData?.data || [];

  const handleModerate = async (orgId: number, status: 'approved' | 'declined') => {
    try {
      await moderateOrganization({
        id: orgId,
        status,
        note: moderationNote,
      }).unwrap();

      message.success(
        `Organization ${status === 'approved' ? 'approved' : 'declined'} successfully`
      );
      setModerationModal(false);
      setModerationNote('');
      setSelectedOrg(null);
      refetch();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to moderate organization');
    }
  };

  const openModerationModal = (org: Organization) => {
    setSelectedOrg(org);
    setModerationModal(true);
  };

  const handleDelete = (org: Organization) => {
    Modal.confirm({
      title: 'Delete Organization',
      icon: <DeleteOutlined />,
      content: (
        <Space direction="vertical" css={{ width: '100%' }}>
          <Text>
            Are you sure you want to delete <Text strong>{org.name}</Text>?
          </Text>
          <Text type="danger">
            This action cannot be undone. All shop data including products, custom fields, and
            themes will be permanently deleted.
          </Text>
        </Space>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteOrganization(org.id).unwrap();
          message.success('Organization deleted successfully');
          refetch();
        } catch (error) {
          message.error(getErrorMessage(error) || 'Failed to delete organization');
        }
      },
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Shop Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Organization) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Text strong>{name}</Text>
            {record.moderation_status === 'approved' && (
              <Badge
                count={<SafetyCertificateOutlined css={{ color: '#52c41a' }} />}
                title="Moderated"
              />
            )}
          </Space>
          <Text type="secondary" css={{ fontSize: 12 }}>
            /{record.slug}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Owner',
      key: 'owner',
      render: (record: Organization) => <Text>{record.owner_id}</Text>,
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
      onFilter: (value: unknown, record: Organization) =>
        (record.moderation_status || 'pending') === value,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a: Organization, b: Organization) =>
        dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Organization) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/shop/${record.slug}`)}
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
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            loading={isDeleting}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <ContainerStyled>
        <HeaderStyled>
          <Space direction="vertical" size={0}>
            <Title level={2}>
              <ShopOutlined /> Organization Moderation
            </Title>
            <Text type="secondary">Review and moderate shop listings</Text>
          </Space>
        </HeaderStyled>

        <Card>
          <Table
            dataSource={organizations}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 20, showSizeChanger: true }}
          />
        </Card>

        <Modal
          title="Moderate Organization"
          open={moderationModal}
          onCancel={() => {
            setModerationModal(false);
            setModerationNote('');
            setSelectedOrg(null);
          }}
          footer={
            selectedOrg
              ? [
                  <Button
                    key="decline"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleModerate(selectedOrg.id, 'declined')}
                    loading={isModerating}
                  >
                    Decline
                  </Button>,
                  <Button
                    key="approve"
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleModerate(selectedOrg.id, 'approved')}
                    loading={isModerating}
                  >
                    Approve
                  </Button>,
                ]
              : null
          }
          width={600}
        >
          {selectedOrg && (
            <Space direction="vertical" size="large" css={{ width: '100%' }}>
              <Space direction="vertical" size="small" css={{ width: '100%' }}>
                <Title level={4}>{selectedOrg.name}</Title>
                <Paragraph type="secondary">{selectedOrg.description}</Paragraph>
                <Text type="secondary">Slug: /{selectedOrg.slug}</Text>
              </Space>

              <Space direction="vertical" size="small" css={{ width: '100%' }}>
                <Text strong>Moderation Note (Optional):</Text>
                <TextArea
                  rows={4}
                  value={moderationNote}
                  onChange={(e) => setModerationNote(e.target.value)}
                  placeholder="Add a note about this moderation decision..."
                />
              </Space>
            </Space>
          )}
        </Modal>
      </ContainerStyled>
    </AppLayout>
  );
};

export default AdminOrganizationModerationPage;
