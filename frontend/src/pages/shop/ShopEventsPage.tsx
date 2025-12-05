import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Table, Button, Space, Modal, message, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { eventService } from '@/services/eventService';

const { Text } = Typography;

export const ShopEventsPage = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = parseInt(id!);

  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [CreateEventModal, setCreateEventModal] = useState<any>(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Lazy load CreateEventModal
  useEffect(() => {
    import('@/components/events/CreateEventModal').then((module) => {
      setCreateEventModal(() => module.CreateEventModal);
    });
  }, []);

  const loadEvents = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await eventService.getOrganizationEvents(orgId, { page, limit: pageSize });
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
  }, [orgId]);

  const handleDelete = async (eventId: number) => {
    try {
      await eventService.deleteEvent(eventId);
      message.success('Event deleted successfully');
      loadEvents(pagination.current, pagination.pageSize);
    } catch (error: any) {
      message.error(error.message || 'Failed to delete event');
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setCreateModalVisible(true);
  };

  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    setEditingEvent(null);
    loadEvents(pagination.current, pagination.pageSize);
  };

  const getStatusTag = (status: string) => {
    const statusConfig: any = {
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
      render: (title: string, record: any) => (
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
      render: (tickets: any[]) => tickets?.length || 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
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
      <Space style={{ marginBottom: 16 }}>
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
      </Space>

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

      {CreateEventModal && createModalVisible && (
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
