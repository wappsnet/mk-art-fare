import styled from '@emotion/styled';
import { Card, Form, Button, Space } from 'antd';

export const Container = styled.div`
  min-height: calc(100vh - 64px - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

export const StyledCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
`;

export const FullWidthSpace = styled(Space)`
  width: 100%;
`;

export const HeaderSection = styled.div`
  text-align: center;
`;

export const StyledForm = styled(Form)`
  margin-top: 24px;
`;

export const FormActionsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const GoogleButton = styled(Button)`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FooterSection = styled.div`
  text-align: center;
`;
