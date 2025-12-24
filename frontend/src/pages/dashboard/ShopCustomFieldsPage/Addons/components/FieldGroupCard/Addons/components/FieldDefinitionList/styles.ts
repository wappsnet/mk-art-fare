import styled from '@emotion/styled';
import { Tag } from 'antd';

export const FieldDefinitionItemStyled = styled.div`
  .ant-list-item {
    padding: 16px;
    border-radius: 6px;
    margin-bottom: 8px;
    background: #fafafa;
    transition: background 0.2s ease;

    &:hover {
      background: #f0f0f0;
    }
  }
`;

export const FieldTypeTagStyled = styled(Tag)`
  font-weight: 500;
  text-transform: uppercase;
  font-size: 11px;
`;
