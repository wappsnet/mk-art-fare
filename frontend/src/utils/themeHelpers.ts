export const getStatusTheme = (status: string) => {
  switch (status) {
    case 'completed':
      return 'green';
    case 'pending':
      return 'gold';
    case 'cancelled':
      return 'red';
    default:
      return 'blue';
  }
};
