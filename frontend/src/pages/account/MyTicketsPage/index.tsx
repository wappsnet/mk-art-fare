import { Card, Empty, Typography, Space } from 'antd';
import { TagOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const MyTicketsPage = () => {
  return (
    <Card>
      <Empty
        image={<TagOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
        description={
          <Space direction="vertical">
            <Title level={4}>No tickets yet</Title>
            <Text type="secondary">Tickets you purchase will appear here</Text>
          </Space>
        }
      />
    </Card>
  );
};
