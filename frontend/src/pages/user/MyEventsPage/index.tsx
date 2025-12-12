import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, Table, Button, Space, Tag, message, Popconfirm, Tooltip, Typography } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Layout } from '@/components/Layout';
import { eventService } from '@/services/eventService';
import { Event, EventModerationStatus } from '@/types';
import { CreateEventModal } from '@/components/events/CreateEventModal';
import { getErrorMessage } from '@/types/errors';
import { Container, Header, EventTitleWrapper } from './styles';

const { Title, Text } = Typography;

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

export const MyEventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadEvents = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await eventService.getMyEvents({ page, limit: pageSize });
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
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await eventService.deleteEvent(id);
      message.success('Event deleted successfully');
      loadEvents(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to delete event');
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setCreateModalVisible(true);
  };

  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    setEditingEvent(null);
    loadEvents(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: 'Event',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Event) => (
        <div>
          <EventTitleWrapper>{title}</EventTitleWrapper>
          {record.event_type && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.event_type}
            </Text>
          )}
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
      render: (status: EventModerationStatus, record: Event) => (
        <div>
          {getStatusTag(status)}
          {record.moderation_comment && status === EventModerationStatus.DECLINED && (
            <Tooltip title={record.moderation_comment}>
              <ClockCircleOutlined style={{ marginLeft: 8, color: '#ff4d4f', cursor: 'help' }} />
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: 'Tickets',
      dataIndex: 'tickets',
      key: 'tickets',
      render: (tickets: unknown[]) => tickets?.length || 0,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Event) => (
        <Space>
          <Tooltip title="View Event">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/events/${record.slug}`)}
            />
          </Tooltip>
          <Tooltip title="Edit Event">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={record.moderation_status === EventModerationStatus.REMOVED}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this event?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Event">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Container>
        <Header>
          <Title level={2}>My Events</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => {
              setEditingEvent(null);
              setCreateModalVisible(true);
            }}
          >
            Create Event
          </Button>
        </Header>

        <Card>
          <Table
            columns={columns}
            dataSource={events}
            rowKey="id"
            loading={loading}
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => loadEvents(page, pageSize),
            }}
          />
        </Card>

        <CreateEventModal
          visible={createModalVisible}
          event={editingEvent}
          onSuccess={handleCreateSuccess}
          onCancel={() => {
            setCreateModalVisible(false);
            setEditingEvent(null);
          }}
        />
      </Container>
    </Layout>
  );
};
