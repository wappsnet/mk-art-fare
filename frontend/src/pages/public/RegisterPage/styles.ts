import styled from '@emotion/styled';
import { Card, Form, Button } from 'antd';

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
  max-width: 500px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
`;

export const StyledForm = styled(Form)`
  margin-top: 24px;
`;

export const GoogleButton = styled(Button)`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CenterText = styled.div`
  text-align: center;
`;
