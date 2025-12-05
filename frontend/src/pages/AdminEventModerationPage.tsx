import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Typography,
  Input,
  Tabs,
  Descriptions,
  Timeline,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { Layout } from '@/components/Layout';
import { eventService } from '@/services/eventService';
import { Event, EventModerationStatus, EventModerationLog } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const Container = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  margin-bottom: 24px;
`;

const getStatusTag = (status: EventModerationStatus) => {
  const statusConfig = {
    [EventModerationStatus.PENDING]: { color: 'orange', text: 'Pending Review' },
    [EventModerationStatus.APPROVED]: { color: 'green', text: 'Approved' },
    [EventModerationStatus.DECLINED]: { color: 'red', text: 'Declined' },
    [EventModerationStatus.REMOVED]: { color: 'volcano', text: 'Removed' },
  };

  const config = statusConfig[status];
  return <Tag color={config.color}>{config.text}</Tag>;
};

export const AdminEventModerationPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [moderationModalVisible, setModerationModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [moderationAction, setModerationAction] = useState<EventModerationStatus | null>(null);
  const [moderationComment, setModerationComment] = useState('');
  const [moderationHistory, setModerationHistory] = useState<EventModerationLog[]>([]);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadEvents = async (status?: EventModerationStatus, page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await eventService.getEventsForModeration({ page, limit: pageSize, status });
      if (response.success && response.data) {
        setEvents(response.data);
        if (response.pagination) {
          setPagination({
            current: response.pagination.page,
            pageSize: response.pagination.limit,
            total: response.pagination.total,
          });
        }
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const statusMap: Record<string, EventModerationStatus | undefined> = {
      pending: EventModerationStatus.PENDING,
      approved: EventModerationStatus.APPROVED,
      declined: EventModerationStatus.DECLINED,
      removed: EventModerationStatus.REMOVED,
      all: undefined,
    };
    loadEvents(statusMap[activeTab]);
  }, [activeTab]);

  const handleModerate = (event: Event, action: EventModerationStatus) => {
    setSelectedEvent(event);
    setModerationAction(action);
    setModerationComment('');
    setModerationModalVisible(true);
  };

  const confirmModeration = async () => {
    if (!selectedEvent || !moderationAction) return;

    try {
      await eventService.moderateEvent(selectedEvent.id, moderationAction, moderationComment);
      message.success(`Event ${moderationAction} successfully`);
      setModerationModalVisible(false);
      loadEvents(activeTab === 'all' ? undefined : (activeTab as EventModerationStatus));
    } catch (error: any) {
      message.error(error.message || 'Failed to moderate event');
    }
  };

  const viewHistory = async (event: Event) => {
    setSelectedEvent(event);
    try {
      const response = await eventService.getModerationHistory(event.id);
      if (response.success && response.data) {
        setModerationHistory(response.data);
        setHistoryModalVisible(true);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load moderation history');
    }
  };

  const columns = [
    {
      title: 'Event',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Event) => (
        <div>
          <div style={{ fontWeight: 500 }}>{title}</div>
          {record.event_type && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.event_type}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Creator',
      key: 'creator',
      render: (record: Event) => (
        <div>
          <div>
            {record.creator_first_name} {record.creator_last_name}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.creator_email}
          </Text>
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Location',
      dataIndex: 'city',
      key: 'city',
      render: (city: string, record: Event) => city && `${city}, ${record.state || record.country}`,
    },
    {
      title: 'Status',
      dataIndex: 'moderation_status',
      key: 'moderation_status',
      render: (status: EventModerationStatus) => getStatusTag(status),
    },
    {
      title: 'Submitted',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).fromNow(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Event) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/events/${record.slug}`)}
          />
          {record.moderation_status === EventModerationStatus.PENDING && (
            <>
              <Button
                type="text"
                style={{ color: '#52c41a' }}
                icon={<CheckOutlined />}
                onClick={() => handleModerate(record, EventModerationStatus.APPROVED)}
              />
              <Button
                type="text"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleModerate(record, EventModerationStatus.DECLINED)}
              />
            </>
          )}
          {record.moderation_status === EventModerationStatus.APPROVED && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleModerate(record, EventModerationStatus.REMOVED)}
            />
          )}
          <Button type="text" icon={<HistoryOutlined />} onClick={() => viewHistory(record)} />
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'pending', label: 'Pending', count: 0 },
    { key: 'approved', label: 'Approved', count: 0 },
    { key: 'declined', label: 'Declined', count: 0 },
    { key: 'removed', label: 'Removed', count: 0 },
    { key: 'all', label: 'All Events', count: 0 },
  ];

  return (
    <Layout>
      <Container>
        <Header>
          <Title level={2}>Event Moderation</Title>
          <Paragraph type="secondary">
            Review and moderate events submitted by organization owners
          </Paragraph>
        </Header>

        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

          <Table
            columns={columns}
            dataSource={events}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => {
                const status =
                  activeTab === 'all' ? undefined : (activeTab as EventModerationStatus);
                loadEvents(status, page, pageSize);
              },
            }}
          />
        </Card>

        {/* Moderation Modal */}
        <Modal
          title={`${moderationAction?.toUpperCase()} Event`}
          open={moderationModalVisible}
          onOk={confirmModeration}
          onCancel={() => setModerationModalVisible(false)}
          okText="Confirm"
          okButtonProps={{
            danger:
              moderationAction === EventModerationStatus.DECLINED ||
              moderationAction === EventModerationStatus.REMOVED,
          }}
        >
          {selectedEvent && (
            <>
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="Event">{selectedEvent.title}</Descriptions.Item>
                <Descriptions.Item label="Type">{selectedEvent.event_type}</Descriptions.Item>
                <Descriptions.Item label="Date">
                  {dayjs(selectedEvent.start_date).format('MMM DD, YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Creator">
                  {selectedEvent.creator_first_name} {selectedEvent.creator_last_name}
                  <br />
                  <Text type="secondary">{selectedEvent.creator_email}</Text>
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: 16 }}>
                <Text strong>
                  Comment {moderationAction === EventModerationStatus.DECLINED && '(Required)'}:
                </Text>
                <TextArea
                  rows={4}
                  placeholder="Add a comment explaining your decision..."
                  value={moderationComment}
                  onChange={(e) => setModerationComment(e.target.value)}
                  style={{ marginTop: 8 }}
                />
              </div>
            </>
          )}
        </Modal>

        {/* History Modal */}
        <Modal
          title="Moderation History"
          open={historyModalVisible}
          onCancel={() => setHistoryModalVisible(false)}
          footer={null}
          width={700}
        >
          {selectedEvent && (
            <>
              <Title level={5}>{selectedEvent.title}</Title>
              <Divider />
              <Timeline
                items={moderationHistory.map((log) => ({
                  color: log.action === EventModerationStatus.APPROVED ? 'green' : 'red',
                  children: (
                    <div>
                      <div>
                        <Tag
                          color={log.action === EventModerationStatus.APPROVED ? 'green' : 'red'}
                        >
                          {log.action.toUpperCase()}
                        </Tag>
                        <Text type="secondary">
                          by {log.first_name} {log.last_name}
                        </Text>
                      </div>
                      {log.comment && <Paragraph style={{ marginTop: 8 }}>{log.comment}</Paragraph>}
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(log.created_at).format('MMM DD, YYYY h:mm A')}
                      </Text>
                    </div>
                  ),
                }))}
              />
            </>
          )}
        </Modal>
      </Container>
    </Layout>
  );
};
