import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import theme from './theme';
import { router } from './router';
import { useAuthStore } from './store/authStore';
import { useCurrencyStore } from './store/currencyStore';

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const initializeCurrency = useCurrencyStore((state) => state.initializeCurrency);

  useEffect(() => {
    // Initialize auth from localStorage on app start
    initializeAuth();
    // Initialize currency exchange rate
    initializeCurrency();
  }, [initializeAuth, initializeCurrency]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4caf50',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#f44336',
              secondary: '#fff',
            },
          },
        }}
      />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
