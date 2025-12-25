import { CrownOutlined, StarOutlined } from '@ant-design/icons';

export const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    period: 'forever',
    icon: StarOutlined,
    description: 'Perfect for getting started',
    features: [
      '1 shop',
      'Up to 10 products',
      'Basic product management',
      'Image uploads',
      'Order management',
      'Customer support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: 'per month',
    icon: CrownOutlined,
    description: 'For serious artists and businesses',
    features: [
      'Unlimited shops',
      'Unlimited products',
      'Advanced product management',
      'Custom fields',
      'Priority support',
      'Analytics dashboard',
      'Category management',
      'Bulk operations',
    ],
  },
];
