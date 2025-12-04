import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Select,
  DatePicker,
  Spin,
  Empty,
  Tag,
  Space,
} from 'antd';
import { CalendarOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { Layout } from '../components/Layout';
import { useGetEventsQuery } from '@/services/apiSlice';
import { Event } from '../types';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-radius: 12px;
  margin-bottom: 40px;
`;

const FilterSection = styled.div`
  background: #fafafa;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 32px;
`;

const EventCard = styled(Card)`
  height: 100%;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  .ant-card-cover {
    height: 200px;
    overflow: hidden;
    background: #f5f5f5;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

const EventMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
  color: #666;
  font-size: 14px;
`;

export const EventsPage = () => {
  const [eventType, setEventType] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');

  const { data: eventsData, isLoading: loading } = useGetEventsQuery({
    type: eventType,
    city,
    startDate,
  });

  const events = eventsData?.data || [];

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (start.isSame(end, 'day')) {
      return start.format('MMM DD, YYYY • h:mm A');
    }
    return `${start.format('MMM DD')} - ${end.format('MMM DD, YYYY')}`;
  };

  return (
    <Layout>
      <Container>
        <HeroSection>
          <Title level={1} style={{ color: 'white', marginBottom: 16 }}>
            Art Events
          </Title>
          <Paragraph
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: 18,
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            Discover and attend amazing art exhibitions, workshops, and events
          </Paragraph>
        </HeroSection>

        <FilterSection>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Select
                placeholder="Event Type"
                allowClear
                style={{ width: '100%' }}
                size="large"
                onChange={setEventType}
              >
                <Option value="exhibition">Exhibition</Option>
                <Option value="workshop">Workshop</Option>
                <Option value="gallery">Gallery Opening</Option>
                <Option value="auction">Auction</Option>
                <Option value="talk">Artist Talk</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="City"
                allowClear
                style={{ width: '100%' }}
                size="large"
                onChange={setCity}
                showSearch
              >
                <Option value="New York">New York</Option>
                <Option value="Los Angeles">Los Angeles</Option>
                <Option value="Chicago">Chicago</Option>
                <Option value="San Francisco">San Francisco</Option>
                <Option value="Boston">Boston</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <DatePicker
                placeholder="Start Date"
                style={{ width: '100%' }}
                size="large"
                onChange={(date) => setStartDate(date ? date.format('YYYY-MM-DD') : '')}
              />
            </Col>
          </Row>
        </FilterSection>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        ) : events.length === 0 ? (
          <Empty description="No events found" />
        ) : (
          <Row gutter={[24, 24]}>
            {events.map((event) => (
              <Col xs={24} sm={12} lg={8} key={event.id}>
                <Link to={`/events/${event.slug}`}>
                  <EventCard
                    cover={
                      event.featured_image_url ? (
                        <img alt={event.title} src={event.featured_image_url} />
                      ) : (
                        <div
                          style={{
                            height: 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text type="secondary">No Image</Text>
                        </div>
                      )
                    }
                  >
                    {event.event_type && (
                      <Tag color="blue" style={{ marginBottom: 8 }}>
                        {event.event_type}
                      </Tag>
                    )}

                    <Title level={4} ellipsis={{ rows: 2 }}>
                      {event.title}
                    </Title>

                    {event.description && (
                      <Paragraph ellipsis={{ rows: 2 }} type="secondary">
                        {event.description}
                      </Paragraph>
                    )}

                    <EventMeta>
                      <Space>
                        <CalendarOutlined />
                        <Text>{formatEventDate(event.start_date, event.end_date)}</Text>
                      </Space>

                      {event.city && (
                        <Space>
                          <EnvironmentOutlined />
                          <Text>
                            {event.city}, {event.state || event.country}
                          </Text>
                        </Space>
                      )}

                      {event.organization_name && (
                        <Space>
                          <UserOutlined />
                          <Text>by {event.organization_name}</Text>
                        </Space>
                      )}
                    </EventMeta>

                    <Button type="primary" block style={{ marginTop: 16 }}>
                      View Details
                    </Button>
                  </EventCard>
                </Link>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </Layout>
  );
};
