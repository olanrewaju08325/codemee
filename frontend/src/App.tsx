import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppRouter } from './router/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';

import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

function App() {
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

