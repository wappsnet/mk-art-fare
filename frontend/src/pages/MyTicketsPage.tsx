import { useState, useEffect } from 'react';
import { Card, Empty, Spin, Typography, Row, Col, Tag, Divider, Button, QRCode } from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  MailOutlined,
  CarOutlined,
  ShopOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { Layout } from '@/components/Layout';
import { eventService } from '@/services/eventService';
import { EventBooking, TicketDeliveryMethod, EventBookingStatus } from '../types';
import { message } from 'antd';

const { Title, Text, Paragraph } = Typography;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const TicketCard = styled(Card)`
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;

  .ant-card-body {
    padding: 0;
  }
`;

const TicketHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
`;

const TicketBody = styled.div`
  padding: 24px;
`;

const TicketCode = styled.div`
  background: #f5f5f5;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  margin: 16px 0;

  .code {
    font-family: 'Courier New', monospace;
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 4px;
    color: #1890ff;
  }
`;

const DeliveryInfo = styled.div<{ color: string }>`
  background: ${(props) => props.color};
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
`;

const getDeliveryIcon = (method: TicketDeliveryMethod) => {
  switch (method) {
    case TicketDeliveryMethod.VIRTUAL:
      return <MailOutlined />;
    case TicketDeliveryMethod.PHYSICAL_DELIVERY:
      return <CarOutlined />;
    case TicketDeliveryMethod.PICKUP:
      return <ShopOutlined />;
    default:
      return <MailOutlined />;
  }
};

const getDeliveryColor = (method: TicketDeliveryMethod) => {
  switch (method) {
    case TicketDeliveryMethod.VIRTUAL:
      return '#e6f7ff';
    case TicketDeliveryMethod.PHYSICAL_DELIVERY:
      return '#fff3cd';
    case TicketDeliveryMethod.PICKUP:
      return '#d1ecf1';
    default:
      return '#f0f0f0';
  }
};

const getStatusTag = (status: EventBookingStatus) => {
  const config = {
    [EventBookingStatus.PENDING]: { color: 'orange', text: 'Pending' },
    [EventBookingStatus.CONFIRMED]: { color: 'green', text: 'Confirmed' },
    [EventBookingStatus.CANCELLED]: { color: 'red', text: 'Cancelled' },
  };
  return <Tag color={config[status].color}>{config[status].text}</Tag>;
};

export const MyTicketsPage = () => {
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await eventService.getMyBookings();
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const renderDeliveryInfo = (booking: EventBooking) => {
    const color = getDeliveryColor(booking.delivery_method);
    const icon = getDeliveryIcon(booking.delivery_method);

    switch (booking.delivery_method) {
      case TicketDeliveryMethod.VIRTUAL:
        return (
          <DeliveryInfo color={color}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              {icon}
              <Text strong>Virtual Ticket</Text>
            </div>
            {booking.virtual_ticket_code && (
              <TicketCode>
                <div className="code">{booking.virtual_ticket_code}</div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Present this code at the event entrance
                </Text>
              </TicketCode>
            )}
            {booking.qr_code_url && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <QRCode value={booking.virtual_ticket_code || booking.booking_number} />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Scan this QR code at the entrance
                  </Text>
                </div>
              </div>
            )}
            {booking.email_sent && (
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                ✓ Ticket emailed to {booking.attendee_email} on{' '}
                {booking.email_sent_at
                  ? dayjs(booking.email_sent_at).format('MMM DD, YYYY')
                  : 'N/A'}
              </Text>
            )}
          </DeliveryInfo>
        );

      case TicketDeliveryMethod.PICKUP:
        return (
          <DeliveryInfo color={color}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              {icon}
              <Text strong>Self Pickup</Text>
            </div>
            <Paragraph>
              <strong>Pickup Location:</strong> {booking.pickup_location || 'Event venue'}
            </Paragraph>
            <Paragraph style={{ marginBottom: 0 }}>
              <strong>Booking Number:</strong> {booking.booking_number}
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Please bring a valid ID and quote your booking number
              </Text>
            </Paragraph>
          </DeliveryInfo>
        );

      case TicketDeliveryMethod.PHYSICAL_DELIVERY:
        return (
          <DeliveryInfo color={color}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              {icon}
              <Text strong>Physical Delivery</Text>
            </div>
            <Paragraph>
              <strong>Delivery Address:</strong>
              <br />
              {booking.delivery_address_line1}
              {booking.delivery_address_line2 && <br />}
              {booking.delivery_address_line2}
              <br />
              {booking.delivery_city}, {booking.delivery_state} {booking.delivery_postal_code}
            </Paragraph>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Your tickets will be delivered within 5-7 business days
            </Text>
          </DeliveryInfo>
        );

      default:
        return null;
    }
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

  return (
    <Layout>
      <Container>
        <Title level={2}>My Tickets</Title>
        <Paragraph type="secondary">View and manage your event tickets</Paragraph>

        {bookings.length === 0 ? (
          <Card>
            <Empty description="No tickets found" />
          </Card>
        ) : (
          bookings.map((booking) => (
            <TicketCard key={booking.id}>
              <TicketHeader>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Title level={4} style={{ color: 'white', margin: 0 }}>
                      {booking.event_title}
                    </Title>
                  </Col>
                  <Col>{getStatusTag(booking.status)}</Col>
                </Row>
              </TicketHeader>

              <TicketBody>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <CalendarOutlined style={{ marginRight: 8 }} />
                        <Text strong>Date:</Text>{' '}
                        {booking.start_date
                          ? dayjs(booking.start_date).format('MMMM DD, YYYY h:mm A')
                          : 'TBA'}
                      </div>
                      {booking.venue_name && (
                        <div>
                          <EnvironmentOutlined style={{ marginRight: 8 }} />
                          <Text strong>Venue:</Text> {booking.venue_name}
                        </div>
                      )}
                    </Space>
                  </Col>
                </Row>

                <Divider />

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">Booking Number</Text>
                      <div>
                        <Text strong style={{ fontSize: 16 }}>
                          {booking.booking_number}
                        </Text>
                      </div>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">Ticket Type</Text>
                      <div>
                        <Text>{booking.ticket_type}</Text>
                      </div>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">Quantity</Text>
                      <div>
                        <Text>{booking.quantity} ticket(s)</Text>
                      </div>
                    </div>
                    <div>
                      <Text type="secondary">Total Price</Text>
                      <div>
                        <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                          ${parseFloat(booking.total_price.toString()).toFixed(2)}
                        </Text>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} md={12}>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">Attendee Name</Text>
                      <div>
                        <Text>{booking.attendee_name}</Text>
                      </div>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">Email</Text>
                      <div>
                        <Text>{booking.attendee_email}</Text>
                      </div>
                    </div>
                    {booking.attendee_phone && (
                      <div>
                        <Text type="secondary">Phone</Text>
                        <div>
                          <Text>{booking.attendee_phone}</Text>
                        </div>
                      </div>
                    )}
                  </Col>
                </Row>

                {renderDeliveryInfo(booking)}

                <Divider />

                <Text type="secondary" style={{ fontSize: 12 }}>
                  Booked on {dayjs(booking.created_at).format('MMMM DD, YYYY h:mm A')}
                </Text>
              </TicketBody>
            </TicketCard>
          ))
        )}
      </Container>
    </Layout>
  );
};
