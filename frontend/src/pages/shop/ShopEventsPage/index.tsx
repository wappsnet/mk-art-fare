import { useState, useEffect, useCallback, type ComponentType } from 'react';
import { useParams } from 'react-router';
import { Table, Button, Space, Modal, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { eventService } from '@/services/eventService';
import { Event } from '@/types';
import { getErrorMessage } from '@/types/errors.ts';
import { TopSpace, EventTitle, EventType } from './styles';

export const ShopEventsPage = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  type CreateEventModalProps = {
    visible: boolean;
    event?: Event | null;
    organizationId?: number;
    onSuccess: () => void;
    onCancel: () => void;
  };

  const [CreateEventModal, setCreateEventModal] =
    useState<ComponentType<CreateEventModalProps> | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Lazy load CreateEventModal
  useEffect(() => {
    import('@/components/events/CreateEventModal').then((module) => {
      setCreateEventModal(() => module.CreateEventModal as ComponentType<CreateEventModalProps>);
    });
  }, []);

  const loadEvents = useCallback(
    ({ page = 1, pageSize = 10 }) => {
      setLoading(true);
      eventService
        .getOrganizationEvents(orgId, { page, limit: pageSize })
        .then((response) => {
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
        })
        .catch((error) => {
          message.error(getErrorMessage(error) || 'Failed to load events');
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [orgId]
  );

  useEffect(() => {
    loadEvents({
      page: 1,
      pageSize: 10,
    });
  }, [loadEvents]);

  const handleDelete = async (eventId: number) => {
    try {
      await eventService.deleteEvent(eventId);
      message.success('Event deleted successfully');
      loadEvents({ page: pagination.current, pageSize: pagination.pageSize });
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
    loadEvents({
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: 'Pending Review' },
      approved: { color: 'green', text: 'Approved' },
      declined: { color: 'red', text: 'Declined' },
      removed: { color: 'volcano', text: 'Removed' },
    };

    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Event',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Event) => (
        <div>
          <EventTitle>{title}</EventTitle>
          {record.event_type && (
            <EventType type="secondary">{record.event_type}</EventType>
          )}
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'moderation_status',
      key: 'moderation_status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Tickets',
      dataIndex: 'tickets',
      key: 'tickets',
      render: (tickets: unknown[]) => tickets?.length || 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Event) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Delete Event',
                content: 'Are you sure you want to delete this event?',
                onOk: () => handleDelete(record.id),
              });
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <TopSpace>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingEvent(null);
            setCreateModalVisible(true);
          }}
        >
          Create Event
        </Button>
      </TopSpace>

      <Table
        columns={columns}
        dataSource={events}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => loadEvents({ page, pageSize }),
        }}
      />

      {!!CreateEventModal && createModalVisible && (
        <CreateEventModal
          visible={createModalVisible}
          event={editingEvent}
          organizationId={orgId}
          onSuccess={handleCreateSuccess}
          onCancel={() => {
            setCreateModalVisible(false);
            setEditingEvent(null);
          }}
        />
      )}
    </div>
  );
};
