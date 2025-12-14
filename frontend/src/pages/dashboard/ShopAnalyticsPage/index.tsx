import { useParams } from 'react-router';
import { Row, Col, Card, Typography, Tag } from 'antd';
import { useGetOrganizationStatsQuery } from '@/services/apiSlice';
import type { AnalyticsData } from '@/types/common';
import { RowMarginTop16, RowMarginTop24, FullWidthSpace, FlexBetween } from './styles';

const { Title, Text } = Typography;

function isAnalyticsData(data: unknown): data is AnalyticsData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'total' in data &&
    'byStatus' in data &&
    'topProducts' in data
  );
}

export const ShopAnalyticsPage = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);

  const { data: statsData } = useGetOrganizationStatsQuery(orgId, { skip: !orgId });
  const stats = isAnalyticsData(statsData?.data) ? statsData.data : undefined;

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
              $
              {(typeof stats?.total?.total_revenue === 'number'
                ? stats.total.total_revenue
                : parseFloat(String(stats?.total?.total_revenue || '0'))
              ).toFixed(2)}
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

      <RowMarginTop16>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Title level={4}>
                $
                {(typeof stats?.total?.product_revenue === 'number'
                  ? stats.total.product_revenue
                  : parseFloat(String(stats?.total?.product_revenue || '0'))
                ).toFixed(2)}
              </Title>
              <Text type="secondary">Product Revenue</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Title level={4}>
                $
                {(typeof stats?.total?.event_revenue === 'number'
                  ? stats.total.event_revenue
                  : parseFloat(String(stats?.total?.event_revenue || '0'))
                ).toFixed(2)}
              </Title>
              <Text type="secondary">Event Revenue</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Title level={4}>
                $
                {(stats?.total?.total_orders || 0) > 0 && stats
                  ? (
                      (typeof stats.total?.total_revenue === 'number'
                        ? stats.total.total_revenue
                        : parseFloat(String(stats.total?.total_revenue || '0'))) /
                      (stats.total?.total_orders || 1)
                    ).toFixed(2)
                  : '0.00'}
              </Title>
              <Text type="secondary">Avg Order Value</Text>
            </Card>
          </Col>
        </Row>
      </RowMarginTop16>

      <RowMarginTop24>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Orders by Status">
              {stats?.byStatus && stats.byStatus.length > 0 ? (
                <FullWidthSpace direction="vertical">
                  {stats.byStatus.map((item) => (
                    <FlexBetween key={item.status}>
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
                        {item.count} orders ($
                        {(typeof item.revenue === 'number'
                          ? item.revenue
                          : Number.parseFloat(String(item.revenue))
                        ).toFixed(2)}
                        )
                      </Text>
                    </FlexBetween>
                  ))}
                </FullWidthSpace>
              ) : (
                <Text type="secondary">No data available</Text>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Top Selling Products">
              {stats?.topProducts && stats.topProducts.length > 0 ? (
                <FullWidthSpace direction="vertical">
                  {stats.topProducts.map((product) => (
                    <FlexBetween key={product.name}>
                      <Text strong>{product.name}</Text>
                      <Text>
                        {product.total_sold} sold ($
                        {(typeof product.revenue === 'number'
                          ? product.revenue
                          : Number.parseFloat(String(product.revenue))
                        ).toFixed(2)}
                        )
                      </Text>
                    </FlexBetween>
                  ))}
                </FullWidthSpace>
              ) : (
                <Text type="secondary">No data available</Text>
              )}
            </Card>
          </Col>
        </Row>
      </RowMarginTop24>

      <RowMarginTop16>
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="Top Selling Event Tickets">
              {stats?.topEvents && stats.topEvents.length > 0 ? (
                <FullWidthSpace direction="vertical">
                  {stats.topEvents.map((event) => (
                    <FlexBetween key={event.name}>
                      <Text strong>{event.name}</Text>
                      <Text>
                        {event.total_sold} tickets sold ($
                        {(typeof event.revenue === 'number'
                          ? event.revenue
                          : Number.parseFloat(String(event.revenue))
                        ).toFixed(2)}
                        )
                      </Text>
                    </FlexBetween>
                  ))}
                </FullWidthSpace>
              ) : (
                <Text type="secondary">No event ticket sales yet</Text>
              )}
            </Card>
          </Col>
        </Row>
      </RowMarginTop16>
    </div>
  );
};
