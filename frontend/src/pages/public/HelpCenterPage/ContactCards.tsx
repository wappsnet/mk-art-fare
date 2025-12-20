import { Typography, Row, Col } from 'antd';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { ContactCardStyled, IconWrapperStyled } from './styles';

const { Title, Text } = Typography;

export const ContactCards = () => {
  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} sm={8}>
        <ContactCardStyled>
          <IconWrapperStyled>
            <MailOutlined />
          </IconWrapperStyled>
          <Title level={4}>Email Us</Title>
          <Text>support@artfare.com</Text>
        </ContactCardStyled>
      </Col>
      <Col xs={24} sm={8}>
        <ContactCardStyled>
          <IconWrapperStyled>
            <PhoneOutlined />
          </IconWrapperStyled>
          <Title level={4}>Call Us</Title>
          <Text>+1 (555) 123-4567</Text>
        </ContactCardStyled>
      </Col>
      <Col xs={24} sm={8}>
        <ContactCardStyled>
          <IconWrapperStyled>
            <EnvironmentOutlined />
          </IconWrapperStyled>
          <Title level={4}>Visit Us</Title>
          <Text>123 Art Street, NY 10001</Text>
        </ContactCardStyled>
      </Col>
    </Row>
  );
};
