import { Card, Empty, Typography, Space } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const MyEventsPage = () => {
  return (
    <Card>
      <Empty
        image={<CalendarOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
        description={
          <Space direction="vertical">
            <Title level={4}>No events yet</Title>
            <Text type="secondary">Events you create will appear here</Text>
          </Space>
        }
      />
    </Card>
  );
};
