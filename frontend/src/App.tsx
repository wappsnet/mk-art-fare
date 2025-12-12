import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { store } from './store';
import { useGetProfileQuery, useGetCartQuery } from './services/apiSlice';
import { AppRouter } from './routes';
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
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 4,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          },
        }}
      >
        <AppContent />
      </ConfigProvider>
    </Provider>
  );
}

export default App;
