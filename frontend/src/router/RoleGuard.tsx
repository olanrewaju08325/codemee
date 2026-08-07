import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingLayout } from '../components/layout/LoadingLayout';

interface RoleGuardProps {
  allowedRoles: ('student' | 'teacher' | 'admin')[];
}

export const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingLayout message="Checking permissions..." />;
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};
