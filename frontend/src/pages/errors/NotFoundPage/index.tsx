import { Result, Button } from 'antd';
import { useNavigate } from 'react-router';

import AppLayout from '@/components/AppLayout';

import { ErrorPageContainerStyled } from './styles';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <ErrorPageContainerStyled>
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
      </ErrorPageContainerStyled>
    </AppLayout>
  );
};

export default NotFoundPage;
