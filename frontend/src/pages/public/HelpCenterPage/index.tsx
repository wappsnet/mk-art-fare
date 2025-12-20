import { Typography, Collapse, Space, Flex } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Layout } from '@/components/Layout';
import { ContainerStyled, HeaderStyled } from './styles';
import { faqData } from './faqData';
import { ContactCards } from './ContactCards';
import { ContactForm } from './ContactForm';

const { Title, Paragraph } = Typography;

const HelpCenterPage = () => {
  return (
    <Layout>
      <ContainerStyled>
        <HeaderStyled>
          <Space direction="vertical" size={16}>
            <Title level={1}>Help Center</Title>
            <Paragraph>Find answers to common questions or get in touch with our team</Paragraph>
          </Space>
        </HeaderStyled>

        <Flex vertical gap={24}>
          <Title level={2}>
            <QuestionCircleOutlined /> Frequently Asked Questions
          </Title>

          {faqData.map((category) => (
            <Flex key={category.category} vertical gap={16}>
              <Title level={3}>{category.category}</Title>
              <Collapse
                items={category.questions.map((item, index) => ({
                  key: index.toString(),
                  label: item.question,
                  children: <Paragraph>{item.answer}</Paragraph>,
                }))}
                destroyOnHidden
                bordered
              />
            </Flex>
          ))}

          <Flex vertical gap={16}>
            <Title level={2}>Contact Us</Title>
            <Paragraph>
              Can not find what you are looking for? Get in touch with our support team.
            </Paragraph>

            <ContactCards />
          </Flex>

          <ContactForm />
        </Flex>
      </ContainerStyled>
    </Layout>
  );
};

export default HelpCenterPage;
