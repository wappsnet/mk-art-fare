import styled from '@emotion/styled';
import { Card, Space, Typography } from 'antd';

const { Text } = Typography;

export const FieldCard = styled(Card)`
  margin-bottom: 8px;
`;

export const FullWidthSpace = styled(Space)`
  width: 100%;
`;

export const FieldMeta = styled(Text)`
  font-size: 12px;
  color: #666;
`;

export const FieldHelp = styled(Text)`
  font-size: 12px;
  font-style: italic;
`;
