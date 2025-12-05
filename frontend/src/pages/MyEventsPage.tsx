import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Popconfirm,
  Tooltip,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { Layout } from '@/components/Layout';
import { eventService } from '@/services/eventService';
import { Event, EventModerationStatus } from '../types';
import { CreateEventModal } from '@/components/events/CreateEventModal';

const { Title, Text } = Typography;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
    } catch (error: any) {
      message.error(error.message || 'Failed to load events');
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
    } catch (error: any) {
      message.error(error.message || 'Failed to delete event');
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
      render: (tickets: any[]) => tickets?.length || 0,
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
      render: (_: any, record: Event) => (
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
