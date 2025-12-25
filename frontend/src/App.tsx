import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';

import { theme } from './config/theme';
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
      <ConfigProvider theme={theme}>
        <AppContent />
      </ConfigProvider>
    </Provider>
  );
}

export default App;
