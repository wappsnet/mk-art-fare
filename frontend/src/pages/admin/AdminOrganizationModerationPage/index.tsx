import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, Table, Tag, Button, Space, Typography, Modal, message, Input, Badge } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ShopOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Layout } from '@/components/Layout';
import { useGetOrganizationsQuery, useModerateOrganizationMutation } from '@/services/apiSlice';
import { getErrorMessage } from '@/types/errors';
import { Organization } from '@/types/common';
import { ContainerStyled, HeaderStyled } from './styles';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export const AdminOrganizationModerationPage = () => {
  const navigate = useNavigate();
  const [moderationModal, setModerationModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [moderationNote, setModerationNote] = useState('');

  const { data: orgsData, isLoading, refetch } = useGetOrganizationsQuery();
  const [moderateOrganization, { isLoading: isModerating }] = useModerateOrganizationMutation();

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
            /{record.slug}
          </Text>
        </div>
      ),
    },
    {
      title: 'Owner',
      key: 'owner',
      render: (record: Organization) => (
        <div>
          <Text>{record.owner_id}</Text>
        </div>
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
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <ContainerStyled>
        <HeaderStyled>
          <div>
            <Title level={2}>
              <ShopOutlined /> Organization Moderation
            </Title>
            <Text type="secondary">Review and moderate shop listings</Text>
          </div>
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
          footer={null}
          width={600}
        >
          {selectedOrg && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>{selectedOrg.name}</Title>
                <Paragraph type="secondary">{selectedOrg.description}</Paragraph>
                <Text type="secondary">Slug: /{selectedOrg.slug}</Text>
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
                  onClick={() => handleModerate(selectedOrg.id, 'declined')}
                  loading={isModerating}
                >
                  Decline
                </Button>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => handleModerate(selectedOrg.id, 'approved')}
                  loading={isModerating}
                >
                  Approve
                </Button>
              </Space>
            </Space>
          )}
        </Modal>
      </ContainerStyled>
    </Layout>
  );
};
