import styled from '@emotion/styled';
import { Card } from 'antd';

export const Container = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: calc(100vh - 64px - 200px);
`;

export const StatCard = styled(Card)`
  .ant-statistic-title {
    color: #666;
  }
`;

export const Header = styled.div`
  margin-bottom: 32px;
`;
