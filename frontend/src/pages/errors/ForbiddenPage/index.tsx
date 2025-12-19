import { Result, Button } from 'antd';
import { useNavigate } from 'react-router';
import { Layout } from '@/components/Layout';
import { ErrorPageContainer } from './styles';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <ErrorPageContainer>
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              Back Home
            </Button>
          }
        />
      </ErrorPageContainer>
    </Layout>
  );
};

export default ForbiddenPage;
