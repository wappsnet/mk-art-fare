import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    primary: { main: '#1890ff' },
    success: { main: '#52c41a' },
    warning: { main: '#faad14' },
    error: { main: '#ff4d4f' },
    background: { default: '#f0f2f5', paper: '#ffffff' },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    h1: { fontSize: '38px' },
    h2: { fontSize: '30px' },
    h3: { fontSize: '24px' },
    h4: { fontSize: '20px' },
    h5: { fontSize: '16px' },
  },
  shape: { borderRadius: 4 },
  breakpoints: {
    values: { xs: 0, sm: 768, md: 992, lg: 1200, xl: 1600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
        sizeMedium: { height: 32 },
        sizeLarge: { height: 40 },
        sizeSmall: { height: 24 },
      },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
  },
});
