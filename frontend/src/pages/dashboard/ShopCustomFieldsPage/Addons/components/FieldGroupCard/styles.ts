import styled from '@emotion/styled';

export const FieldGroupCardStyled = styled.div`
  .ant-card {
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }

  .ant-card-head {
    border-bottom: 2px solid #f0f0f0;
  }
`;
