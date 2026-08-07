import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppRouter } from './router/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <HashRouter>
          <AppRouter />
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

