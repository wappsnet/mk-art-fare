import styled from '@emotion/styled';
import { Card, Form, Button, Space } from 'antd';

export const ContainerStyled = styled.div`
  min-height: calc(100vh - 64px - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

export const CardStyled = styled(Card)`
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
`;

export const FullWidthSpaceStyled = styled(Space)`
  width: 100%;
`;

export const HeaderSectionStyled = styled.div`
  text-align: center;
`;

export const FormStyled = styled(Form)`
  margin-top: 24px;
`;

export const FormActionsRowStyled = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const GoogleButtonStyled = styled(Button)`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const FooterSectionStyled = styled.div`
  text-align: center;
`;
