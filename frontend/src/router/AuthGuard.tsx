import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingLayout } from '../components/layout/LoadingLayout';

export const AuthGuard = () => {
  const { session, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingLayout message="Verifying session..." />;
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!session.user.email_confirmed_at) {
    return <Navigate to="/unverified" replace />;
  }

  if (!profile?.full_name) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};
