import { useParams } from 'react-router-dom';
import { Row, Col, Card, Typography, Space, Tag } from 'antd';
import { useGetOrganizationStatsQuery } from '@/services/apiSlice';

const { Title, Text } = Typography;

export const ShopAnalyticsPage = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = parseInt(id!);

  const { data: statsData } = useGetOrganizationStatsQuery(orgId, { skip: !orgId });
  const stats = statsData?.data;

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Title level={4}>{stats?.total?.total_orders || 0}</Title>
            <Text type="secondary">Total Orders</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Title level={4}>
              ${parseFloat(stats?.total?.total_revenue || '0').toFixed(2)}
            </Title>
            <Text type="secondary">Total Revenue</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Title level={4}>{stats?.total?.total_items_sold || 0}</Title>
            <Text type="secondary">Products Sold</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Title level={4}>{stats?.total?.total_tickets_sold || 0}</Title>
            <Text type="secondary">Tickets Sold</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Title level={4}>
              ${parseFloat(stats?.total?.product_revenue || '0').toFixed(2)}
            </Title>
            <Text type="secondary">Product Revenue</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Title level={4}>
              ${parseFloat(stats?.total?.event_revenue || '0').toFixed(2)}
            </Title>
            <Text type="secondary">Event Revenue</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Title level={4}>
              $
              {stats?.total?.total_orders > 0
                ? (
                    parseFloat(stats?.total?.total_revenue || '0') / stats?.total?.total_orders
                  ).toFixed(2)
                : '0.00'}
            </Title>
            <Text type="secondary">Avg Order Value</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Orders by Status">
            {stats?.byStatus && stats.byStatus.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {stats.byStatus.map((item: any) => (
                  <div
                    key={item.status}
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Tag
                      color={
                        item.status === 'completed'
                          ? 'green'
                          : item.status === 'pending'
                            ? 'gold'
                            : item.status === 'cancelled'
                              ? 'red'
                              : 'blue'
                      }
                    >
                      {item.status.toUpperCase()}
                    </Tag>
                    <Text>
                      {item.count} orders (${Number.parseFloat(item.revenue).toFixed(2)})
                    </Text>
                  </div>
                ))}
              </Space>
            ) : (
              <Text type="secondary">No data available</Text>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top Selling Products">
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {stats.topProducts.map((product: any) => (
                  <div
                    key={product.name}
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Text strong>{product.name}</Text>
                    <Text>
                      {product.total_sold} sold ($
                      {Number.parseFloat(product.revenue).toFixed(2)})
                    </Text>
                  </div>
                ))}
              </Space>
            ) : (
              <Text type="secondary">No data available</Text>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Top Selling Event Tickets">
            {stats?.topEvents && stats.topEvents.length > 0 ? (
              <Space direction="vertical" style={{ width: '100%' }}>
                {stats.topEvents.map((event: any) => (
                  <div
                    key={event.name}
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <Text strong>{event.name}</Text>
                    <Text>
                      {event.total_sold} tickets sold ($
                      {Number.parseFloat(event.revenue).toFixed(2)})
                    </Text>
                  </div>
                ))}
              </Space>
            ) : (
              <Text type="secondary">No event ticket sales yet</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
