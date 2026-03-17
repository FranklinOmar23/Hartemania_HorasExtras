import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastProvider } from './components/feedback/Toast';
import { AppRouter } from './routes';
import ErrorBoundary from './components/feedback/ErrorBoundary';

// ============================================
// CONFIGURACIÓN DE REACT QUERY
// ============================================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    },
  },
});

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </BrowserRouter>
        
        {/* React Query Devtools (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;