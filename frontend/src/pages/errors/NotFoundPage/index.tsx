import { Result, Button } from 'antd';
import { useNavigate } from 'react-router';
import AppLayout from '@/components/AppLayout';
import { ErrorPageContainer } from './styles';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <ErrorPageContainer>
        <Result
          status="404"
          title="404"
          subTitle="Sorry, the page you visited does not exist."
          extra={
            <Button type="primary" onClick={() => navigate('/')}>
              Back Home
            </Button>
          }
        />
      </ErrorPageContainer>
    </AppLayout>
  );
};

export default NotFoundPage;
