import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppRouter } from './router/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { warmBackend } from './apiClient';

import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  // Wake the Render backend as soon as the app loads so the user's first
  // action doesn't hit a cold, sleeping server.
  useEffect(() => {
    warmBackend();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <HashRouter><AppRouter /></HashRouter>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

