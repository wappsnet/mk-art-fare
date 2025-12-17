import { useParams } from 'react-router';
import { Row, Col, Card, Typography, Tag } from 'antd';
import { useGetOrganizationStatsQuery } from '@/services/apiSlice';
import type { AnalyticsData } from '@/types/common';
import { RowMarginTop16Styled, RowMarginTop24Styled, FullWidthSpaceStyled, FlexBetweenStyled } from './styles';
import { getStatusTheme } from '@/utils/themeHelpers.ts';

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
              ${Number.parseFloat(String(stats?.total?.total_revenue || '0')).toFixed(2)}
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
      </Row>

      <RowMarginTop16Styled>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Title level={4}>
                ${Number.parseFloat(String(stats?.total?.product_revenue || 0)).toFixed(2)}
              </Title>
              <Text type="secondary">Product Revenue</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Title level={4}>
                $
                {(
                  Number.parseFloat(String(stats?.total?.total_revenue || 0)) /
                  (stats?.total?.total_orders || 1)
                ).toFixed(2)}
              </Title>
              <Text type="secondary">Avg Order Value</Text>
            </Card>
          </Col>
        </Row>
      </RowMarginTop16Styled>

      <RowMarginTop24Styled>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Orders by Status">
              {stats?.byStatus && stats.byStatus.length > 0 ? (
                <FullWidthSpaceStyled direction="vertical">
                  {stats.byStatus.map((item) => (
                    <FlexBetweenStyled key={item.status}>
                      <Tag color={getStatusTheme(item.status)}>{item.status.toUpperCase()}</Tag>
                      <Text>
                        {item.count} orders ($
                        {Number.parseFloat(String(item.revenue)).toFixed(2)})
                      </Text>
                    </FlexBetweenStyled>
                  ))}
                </FullWidthSpaceStyled>
              ) : (
                <Text type="secondary">No data available</Text>
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Top Selling Products">
              {stats?.topProducts && stats.topProducts.length > 0 ? (
                <FullWidthSpaceStyled direction="vertical">
                  {stats.topProducts.map((product) => (
                    <FlexBetweenStyled key={product.name}>
                      <Text strong>{product.name}</Text>
                      <Text>
                        {product.total_sold} sold ($
                        {(typeof product.revenue === 'number'
                          ? product.revenue
                          : Number.parseFloat(String(product.revenue))
                        ).toFixed(2)}
                        )
                      </Text>
                    </FlexBetweenStyled>
                  ))}
                </FullWidthSpaceStyled>
              ) : (
                <Text type="secondary">No data available</Text>
              )}
            </Card>
          </Col>
        </Row>
      </RowMarginTop24Styled>
    </div>
  );
};
