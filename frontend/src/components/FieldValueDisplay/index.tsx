import React from 'react';
import { Tag, Space } from 'antd';
import type { FieldValue } from '@/types/customFields';
import { ColorSwatch } from './styles';
import { withKeys } from '@/utils/arrayHelpers.ts';

interface FieldValueDisplayProps {
  field: FieldValue;
}

export const FieldValueDisplay: React.FC<FieldValueDisplayProps> = ({ field }) => {
  switch (field.field_type) {
    case 'toggle':
      return <Tag color={field.value ? 'success' : 'default'}>{field.value ? 'Yes' : 'No'}</Tag>;

    case 'checkbox':
      if (Array.isArray(field.value)) {
        return (
          <Space wrap>
            {withKeys(field.value).map((item, _idx) => (
              <Tag key={item._key}>{item.value}</Tag>
            ))}
          </Space>
        );
      }
      return <span>{String(field.value)}</span>;

    case 'date':
      return <span>{new Date(field.value).toLocaleDateString()}</span>;

    case 'time':
      return <span>{field.value}</span>;

    case 'color':
      return (
        <Space>
          <ColorSwatch $color={field.value} />
          <span>{field.value}</span>
        </Space>
      );

    case 'image':
    case 'file':
      return (
        <Space direction="vertical" size="small">
          {field.value.map((file: { url: string; name?: string }) => (
            <a key={file.url} href={file.url} target="_blank" rel="noopener noreferrer">
              {file.name || 'View file'}
            </a>
          ))}
        </Space>
      );

    case 'richtext':
      return <div dangerouslySetInnerHTML={{ __html: field.value }} />;

    case 'number':
      return <span>{Number(field.value).toLocaleString()}</span>;

    case 'select':
    case 'radio':
      return <Tag>{field.value}</Tag>;

    default:
      return <span>{String(field.value)}</span>;
  }
};
