import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
  Row,
  Col,
  Typography,
  Button,
  Divider,
  Tag,
  Spin,
  message,
  Space,
  Modal,
  Form,
} from 'antd';
import {
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Layout } from '@/components/Layout';
import { useGetEventQuery, useBookEventMutation } from '@/services/apiSlice';
import { EventTicket, BookingAttendeeInfo } from '@/types';
import { useAppSelector } from '@/hooks/useRedux';
import { getErrorMessage } from '@/types/errors';
import {
  Container,
  EventImage,
  InfoCard,
  TicketCard,
  LoadingContainer,
  StyledBreadcrumb,
  PlaceholderImage,
  EventTypeTag,
  HostSpace,
  EventInfoSpace,
  IconLarge,
  TicketHeader,
  PriceText,
  TicketDescription,
  TicketAvailability,
  QuantitySection,
  QuantityInput,
  SubtotalRow,
  TotalText,
  BookingSummary,
} from './styles';

const { Title, Paragraph, Text } = Typography;

export const EventDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState<EventTicket | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    data: eventData,
    isLoading: loading,
    refetch,
  } = useGetEventQuery(slug || '', {
    skip: !slug,
  });
  const [bookEvent, { isLoading: booking }] = useBookEventMutation();

  const event = eventData?.data;

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

  const handleConfirmBooking = async (values: unknown) => {
    if (!event || !selectedTicket) return;

    const attendeeInfo = values as BookingAttendeeInfo;

    try {
      await bookEvent({
        eventId: event.id,
        ticketId: selectedTicket.id,
        quantity,
        attendeeInfo,
      }).unwrap();

      message.success('Booking confirmed!');
      setModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error(getErrorMessage(error) || 'Failed to book ticket');
    }
  };

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (start.isSame(end, 'day')) {
      return {
        date: start.format('MMMM DD, YYYY'),
        time: `${start.format('h:mm A')} - ${end.format('h:mm A')}`,
      };
    }
    return {
      date: `${start.format('MMM DD')} - ${end.format('MMM DD, YYYY')}`,
      time: 'Multiple days',
    };
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
  const totalPrice = selectedTicket ? Number.parseFloat(selectedTicket.price) * quantity : 0;

  return (
    <Layout>
      <Container>
        <StyledBreadcrumb
          items={[
            { title: <Link to="/">Home</Link> },
            { title: <Link to="/events">Events</Link> },
            { title: event.title },
          ]}
        />

        <Row gutter={[48, 48]}>
          <Col xs={24} md={14}>
            {event.featured_image_url ? (
              <EventImage>
                <img src={event.featured_image_url} alt={event.title} />
              </EventImage>
            ) : (
              <PlaceholderImage>
                <Text type="secondary">No Image Available</Text>
              </PlaceholderImage>
            )}

            {event.event_type && <EventTypeTag color="blue">{event.event_type}</EventTypeTag>}

            <Title level={2}>{event.title}</Title>

            {event.organization_name && (
              <HostSpace>
                <UserOutlined />
                <Text>Hosted by {event.organization_name}</Text>
              </HostSpace>
            )}

            <Divider />

            <EventInfoSpace direction="vertical" size="middle">
              <Space>
                <IconLarge>
                  <CalendarOutlined />
                </IconLarge>
                <div>
                  <Text strong>Date</Text>
                  <br />
                  <Text>{date}</Text>
                </div>
              </Space>

              <Space>
                <IconLarge>
                  <ClockCircleOutlined />
                </IconLarge>
                <div>
                  <Text strong>Time</Text>
                  <br />
                  <Text>{time}</Text>
                </div>
              </Space>

              {event.venue_name && (
                <Space>
                  <IconLarge>
                    <EnvironmentOutlined />
                  </IconLarge>
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
            </EventInfoSpace>

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
                        <TicketHeader>
                          <Text strong>{ticket.ticket_type}</Text>
                          <PriceText strong>
                            ${Number.parseFloat(ticket.price).toFixed(2)}
                          </PriceText>
                        </TicketHeader>
                        {ticket.description && (
                          <TicketDescription type="secondary">
                            {ticket.description}
                          </TicketDescription>
                        )}
                        <TicketAvailability>
                          {available > 0 ? (
                            <Tag color="success">{available} available</Tag>
                          ) : (
                            <Tag color="error">Sold Out</Tag>
                          )}
                        </TicketAvailability>
                      </TicketCard>
                    );
                  })}

                  {selectedTicket && (
                    <>
                      <Divider />
                      <QuantitySection>
                        <Text strong>Quantity:</Text>
                        <QuantityInput
                          min={1}
                          max={selectedTicket.quantity_available - selectedTicket.quantity_sold}
                          value={quantity}
                          onChange={(value) => setQuantity(typeof value === 'number' ? value : 1)}
                        />
                      </QuantitySection>

                      <SubtotalRow>
                        <Text>Subtotal:</Text>
                        <TotalText strong>${totalPrice.toFixed(2)}</TotalText>
                      </SubtotalRow>

                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={handleBookTicket}
                        disabled={
                          selectedTicket.quantity_available - selectedTicket.quantity_sold === 0
                        }
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
          <Form form={form} layout="vertical" onFinish={handleConfirmBooking}>
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
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <input placeholder="john@example.com" />
            </Form.Item>

            <Form.Item name="phone" label="Phone Number">
              <input placeholder="+1 234 567 8900" />
            </Form.Item>

            <Divider />

            <BookingSummary>
              <Text>Ticket: {selectedTicket?.ticket_type}</Text>
              <br />
              <Text>Quantity: {quantity}</Text>
              <br />
              <TotalText strong>Total: ${totalPrice.toFixed(2)}</TotalText>
            </BookingSummary>

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
