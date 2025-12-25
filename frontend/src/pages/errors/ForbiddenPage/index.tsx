import { Result, Button } from 'antd';
import { useNavigate } from 'react-router';

import AppLayout from '@/components/AppLayout';

import { ErrorPageContainerStyled } from './styles';

const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <ErrorPageContainerStyled>
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
      </ErrorPageContainerStyled>
    </AppLayout>
  );
};

export default ForbiddenPage;
