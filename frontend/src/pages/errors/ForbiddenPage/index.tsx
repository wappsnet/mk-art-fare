import { Result, Button } from 'antd';
import { useNavigate } from 'react-router';
import AppLayout from '@/components/AppLayout';
import { ErrorPageContainer } from './styles';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
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
    </AppLayout>
  );
};

export default ForbiddenPage;
