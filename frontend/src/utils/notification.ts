import { enqueueSnackbar } from 'notistack';

export const message = {
  success: (msg: string) => enqueueSnackbar(msg, { variant: 'success' }),
  error: (msg: string) => enqueueSnackbar(msg, { variant: 'error' }),
  warning: (msg: string) => enqueueSnackbar(msg, { variant: 'warning' }),
  info: (msg: string) => enqueueSnackbar(msg, { variant: 'info' }),
};
