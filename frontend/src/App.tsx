import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';

import { ConfirmDialogProvider } from './components/ConfirmDialog';
import { muiTheme } from './config/muiTheme';
import { AppRouter } from './routes';
import { useGetProfileQuery, useGetCartQuery } from './services/apiSlice';
import { store } from './store';
import './styles/global.scss';

function AppContent() {
  const token = localStorage.getItem('accessToken');

  // Fetch profile if token exists
  useGetProfileQuery(undefined, { skip: !token });

  // Always fetch cart
  useGetCartQuery();

  return <AppRouter />;
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={muiTheme}>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <ConfirmDialogProvider>
            <AppContent />
          </ConfirmDialogProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
