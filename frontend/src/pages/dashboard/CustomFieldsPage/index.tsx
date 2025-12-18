import React from 'react';
import { useParams } from 'react-router';
import { Typography } from 'antd';
import FieldGroupManager from '@/components/FieldGroupManager';

const { Title, Paragraph } = Typography;

const CustomFieldsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orgId = Number.parseInt(id!);

  return (
    <div>
      <Title level={2}>Custom Fields Management</Title>
      <Paragraph>
        Create reusable field groups and define custom fields for your products. Field groups can
        be assigned to products to collect additional information specific to your product types.
      </Paragraph>

      <FieldGroupManager organizationId={orgId} />
    </div>
  );
};

export default CustomFieldsPage;
