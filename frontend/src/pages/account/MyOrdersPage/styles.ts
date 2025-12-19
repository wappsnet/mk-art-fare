import styled from '@emotion/styled';
import { Typography } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const OrdersContainerStyled = styled.div`
  padding: 24px 0;
`;

export const PriceTextStyled = styled(Text)`
  color: #52c41a;
`;

export const EmptyIcon = styled(ShoppingOutlined)`
  font-size: 64px;
  color: #bfbfbf;
`;
