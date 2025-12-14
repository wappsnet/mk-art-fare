import styled from '@emotion/styled';
import { Space, Typography } from 'antd';

const { Text: AntText } = Typography;

export const TopSpace = styled(Space)`
  margin-bottom: 16px;
`;

export const EventTitle = styled.div`
  font-weight: 500;
`;

export const EventType = styled(AntText)`
  &.ant-typography {
    font-size: 12px;
  }
`;
