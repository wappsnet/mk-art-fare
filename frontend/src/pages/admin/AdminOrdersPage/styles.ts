import styled from '@emotion/styled';
import { Card } from 'antd';

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
`;

export const Header = styled.div`
  margin-bottom: 24px;

  h2 {
    margin: 0 0 8px 0;
  }
`;

export const StatCard = styled(Card)`
  .ant-statistic-title {
    font-size: 14px;
    margin-bottom: 8px;
  }

  .ant-statistic-content {
    font-size: 24px;
  }
`;
