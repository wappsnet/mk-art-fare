import { useState, useEffect } from 'react';
import { Card, Empty, Spin, Typography, Row, Col, Tag, Divider, Space, QRCode, message } from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  MailOutlined,
  CarOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Layout } from '@/components/Layout';
import { eventService } from '@/services/eventService';
import { EventBooking, TicketDeliveryMethod, EventBookingStatus } from '@/types';
import { getErrorMessage } from '@/types/errors';
import {
  Container,
  LoadingContainer,
  TicketCard,
  TicketHeader,
  HeaderTitle,
  TicketBody,
  FullWidthSpace,
  IconWithMargin,
  TicketCode,
  SmallText,
  DeliveryInfo,
  DeliveryHeader,
  QRWrapper,
  QRTextWrapper,
  EmailConfirmation,
  NoPaddingParagraph,
  InfoField,
  BookingNumber,
  TotalPrice,
  BookedText,
} from './styles';

const { Title, Text, Paragraph } = Typography;

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
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to load tickets');
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
            <DeliveryHeader>
              {icon}
              <Text strong>Virtual Ticket</Text>
            </DeliveryHeader>
            {booking.virtual_ticket_code && (
              <TicketCode>
                <div className="code">{booking.virtual_ticket_code}</div>
                <SmallText type="secondary">Present this code at the event entrance</SmallText>
              </TicketCode>
            )}
            {booking.qr_code_url && (
              <QRWrapper>
                <QRCode value={booking.virtual_ticket_code || booking.booking_number} />
                <QRTextWrapper>
                  <SmallText type="secondary">Scan this QR code at the entrance</SmallText>
                </QRTextWrapper>
              </QRWrapper>
            )}
            {booking.email_sent && (
              <EmailConfirmation type="secondary">
                ✓ Ticket emailed to {booking.attendee_email} on{' '}
                {booking.email_sent_at
                  ? dayjs(booking.email_sent_at).format('MMM DD, YYYY')
                  : 'N/A'}
              </EmailConfirmation>
            )}
          </DeliveryInfo>
        );

      case TicketDeliveryMethod.PICKUP:
        return (
          <DeliveryInfo color={color}>
            <DeliveryHeader>
              {icon}
              <Text strong>Self Pickup</Text>
            </DeliveryHeader>
            <Paragraph>
              <strong>Pickup Location:</strong> {booking.pickup_location || 'Event venue'}
            </Paragraph>
            <NoPaddingParagraph>
              <strong>Booking Number:</strong> {booking.booking_number}
              <br />
              <SmallText type="secondary">
                Please bring a valid ID and quote your booking number
              </SmallText>
            </NoPaddingParagraph>
          </DeliveryInfo>
        );

      case TicketDeliveryMethod.PHYSICAL_DELIVERY:
        return (
          <DeliveryInfo color={color}>
            <DeliveryHeader>
              {icon}
              <Text strong>Physical Delivery</Text>
            </DeliveryHeader>
            <Paragraph>
              <strong>Delivery Address:</strong>
              <br />
              {booking.delivery_address_line1}
              {booking.delivery_address_line2 && <br />}
              {booking.delivery_address_line2}
              <br />
              {booking.delivery_city}, {booking.delivery_state} {booking.delivery_postal_code}
            </Paragraph>
            <SmallText type="secondary">
              Your tickets will be delivered within 5-7 business days
            </SmallText>
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
          <LoadingContainer>
            <Spin size="large" />
          </LoadingContainer>
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
                    <HeaderTitle level={4}>{booking.event_title}</HeaderTitle>
                  </Col>
                  <Col>{getStatusTag(booking.status)}</Col>
                </Row>
              </TicketHeader>

              <TicketBody>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <FullWidthSpace>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <IconWithMargin>
                            <CalendarOutlined />
                          </IconWithMargin>
                          <Text strong>Date:</Text>{' '}
                          {booking.start_date
                            ? dayjs(booking.start_date).format('MMMM DD, YYYY h:mm A')
                            : 'TBA'}
                        </div>
                        {booking.venue_name && (
                          <div>
                            <IconWithMargin>
                              <EnvironmentOutlined />
                            </IconWithMargin>
                            <Text strong>Venue:</Text> {booking.venue_name}
                          </div>
                        )}
                      </Space>
                    </FullWidthSpace>
                  </Col>
                </Row>

                <Divider />

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <InfoField>
                      <Text type="secondary">Booking Number</Text>
                      <div>
                        <BookingNumber strong>{booking.booking_number}</BookingNumber>
                      </div>
                    </InfoField>
                    <InfoField>
                      <Text type="secondary">Ticket Type</Text>
                      <div>
                        <Text>{booking.ticket_type}</Text>
                      </div>
                    </InfoField>
                    <InfoField>
                      <Text type="secondary">Quantity</Text>
                      <div>
                        <Text>{booking.quantity} ticket(s)</Text>
                      </div>
                    </InfoField>
                    <div>
                      <Text type="secondary">Total Price</Text>
                      <div>
                        <TotalPrice strong>
                          ${parseFloat(booking.total_price.toString()).toFixed(2)}
                        </TotalPrice>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} md={12}>
                    <InfoField>
                      <Text type="secondary">Attendee Name</Text>
                      <div>
                        <Text>{booking.attendee_name}</Text>
                      </div>
                    </InfoField>
                    <InfoField>
                      <Text type="secondary">Email</Text>
                      <div>
                        <Text>{booking.attendee_email}</Text>
                      </div>
                    </InfoField>
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

                <BookedText type="secondary">
                  Booked on {dayjs(booking.created_at).format('MMMM DD, YYYY h:mm A')}
                </BookedText>
              </TicketBody>
            </TicketCard>
          ))
        )}
      </Container>
    </Layout>
  );
};
