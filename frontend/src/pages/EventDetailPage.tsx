import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Typography, Card, Button, InputNumber, Divider, Tag, Spin, message, Breadcrumb, Space, Modal, Form } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { Layout } from '../components/Layout';
import { apiService } from '../services/api';
import { Event, EventTicket, ApiResponse } from '../types';
import { useAppSelector } from '../hooks/useRedux';

const { Title, Paragraph, Text } = Typography;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const EventImage = styled.div`
  width: 100%;
  height: 400px;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 32px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const InfoCard = styled(Card)`
  position: sticky;
  top: 80px;
`;

const TicketCard = styled.div`
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
  }

  &.selected {
    border-color: #1890ff;
    background: #e6f7ff;
  }
`;

export const EventDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<EventTicket | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (slug) {
      fetchEvent();
    }
  }, [slug]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const response = await apiService.get<ApiResponse<Event>>(`/events/${slug}`);
      if (response.success && response.data) {
        setEvent(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch event:', error);
      message.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleBookTicket = () => {
    if (!isAuthenticated) {
      message.info('Please login to book tickets');
      navigate('/login');
      return;
    }

    if (!selectedTicket) {
      message.warning('Please select a ticket type');
      return;
    }

    setModalVisible(true);
  };

  const handleConfirmBooking = async (values: any) => {
    if (!event || !selectedTicket) return;

    setBooking(true);
    try {
      await apiService.post(`/events/${event.id}/book`, {
        ticketId: selectedTicket.id,
        quantity,
        attendeeInfo: values
      });

      message.success('Booking confirmed!');
      setModalVisible(false);
      form.resetFields();
      fetchEvent();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to book ticket');
    } finally {
      setBooking(false);
    }
  };

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (start.isSame(end, 'day')) {
      return {
        date: start.format('MMMM DD, YYYY'),
        time: `${start.format('h:mm A')} - ${end.format('h:mm A')}`
      };
    }
    return {
      date: `${start.format('MMM DD')} - ${end.format('MMM DD, YYYY')}`,
      time: 'Multiple days'
    };
  };

  if (loading) {
    return (
      <Layout>
        <Container>
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        </Container>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <Container>
          <Title level={3}>Event not found</Title>
        </Container>
      </Layout>
    );
  }

  const { date, time } = formatEventDate(event.start_date, event.end_date);
  const totalPrice = selectedTicket ? selectedTicket.price * quantity : 0;

  return (
    <Layout>
      <Container>
        <Breadcrumb
          items={[
            { title: <Link to="/">Home</Link> },
            { title: <Link to="/events">Events</Link> },
            { title: event.title }
          ]}
          style={{ marginBottom: 24 }}
        />

        <Row gutter={[48, 48]}>
          <Col xs={24} md={14}>
            {event.featured_image_url ? (
              <EventImage>
                <img src={event.featured_image_url} alt={event.title} />
              </EventImage>
            ) : (
              <EventImage style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Text type="secondary">No Image Available</Text>
              </EventImage>
            )}

            {event.event_type && (
              <Tag color="blue" style={{ marginBottom: 16 }}>
                {event.event_type}
              </Tag>
            )}

            <Title level={2}>{event.title}</Title>

            {event.organization_name && (
              <Space style={{ marginBottom: 16 }}>
                <UserOutlined />
                <Text>Hosted by {event.organization_name}</Text>
              </Space>
            )}

            <Divider />

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space>
                <CalendarOutlined style={{ fontSize: 20 }} />
                <div>
                  <Text strong>Date</Text>
                  <br />
                  <Text>{date}</Text>
                </div>
              </Space>

              <Space>
                <ClockCircleOutlined style={{ fontSize: 20 }} />
                <div>
                  <Text strong>Time</Text>
                  <br />
                  <Text>{time}</Text>
                </div>
              </Space>

              {event.venue_name && (
                <Space>
                  <EnvironmentOutlined style={{ fontSize: 20 }} />
                  <div>
                    <Text strong>Venue</Text>
                    <br />
                    <Text>{event.venue_name}</Text>
                    {event.city && (
                      <>
                        <br />
                        <Text type="secondary">
                          {event.address_line1}, {event.city}, {event.state} {event.postal_code}
                        </Text>
                      </>
                    )}
                  </div>
                </Space>
              )}
            </Space>

            <Divider />

            {event.description && (
              <>
                <Title level={4}>About This Event</Title>
                <Paragraph>{event.description}</Paragraph>
              </>
            )}
          </Col>

          <Col xs={24} md={10}>
            <InfoCard title="Tickets">
              {event.tickets && event.tickets.length > 0 ? (
                <>
                  {event.tickets.map((ticket) => {
                    const available = ticket.quantity_available - ticket.quantity_sold;
                    const isSelected = selectedTicket?.id === ticket.id;

                    return (
                      <TicketCard
                        key={ticket.id}
                        className={isSelected ? 'selected' : ''}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text strong>{ticket.ticket_type}</Text>
                          <Text strong style={{ color: '#1890ff' }}>
                            ${ticket.price.toFixed(2)}
                          </Text>
                        </div>
                        {ticket.description && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {ticket.description}
                          </Text>
                        )}
                        <div style={{ marginTop: 8 }}>
                          {available > 0 ? (
                            <Tag color="success">{available} available</Tag>
                          ) : (
                            <Tag color="error">Sold Out</Tag>
                          )}
                        </div>
                      </TicketCard>
                    );
                  })}

                  {selectedTicket && (
                    <>
                      <Divider />
                      <div style={{ marginBottom: 16 }}>
                        <Text strong>Quantity:</Text>
                        <InputNumber
                          min={1}
                          max={selectedTicket.quantity_available - selectedTicket.quantity_sold}
                          value={quantity}
                          onChange={(value) => setQuantity(value || 1)}
                          style={{ marginLeft: 16, width: 80 }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <Text>Subtotal:</Text>
                        <Text strong style={{ fontSize: 18 }}>
                          ${totalPrice.toFixed(2)}
                        </Text>
                      </div>

                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={handleBookTicket}
                        disabled={selectedTicket.quantity_available - selectedTicket.quantity_sold === 0}
                      >
                        Book Now
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <Text type="secondary">No tickets available for this event</Text>
              )}
            </InfoCard>
          </Col>
        </Row>

        <Modal
          title="Confirm Booking"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleConfirmBooking}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <input placeholder="John Doe" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <input placeholder="john@example.com" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
            >
              <input placeholder="+1 234 567 8900" />
            </Form.Item>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <Text>Ticket: {selectedTicket?.ticket_type}</Text>
              <br />
              <Text>Quantity: {quantity}</Text>
              <br />
              <Text strong style={{ fontSize: 18 }}>
                Total: ${totalPrice.toFixed(2)}
              </Text>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={booking} block size="large">
                Confirm Booking
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Container>
    </Layout>
  );
};
