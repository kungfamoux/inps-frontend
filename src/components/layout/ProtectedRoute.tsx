import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { StaffRole } from '@/lib/types/common';
import { getDashboardPath } from '@/lib/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: StaffRole[];
  userType?: 'staff' | 'parent';
}

export function ProtectedRoute({ children, allowedRoles, userType }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, userType: currentUserType } = useAuth();

  if (isLoading) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (userType && currentUserType !== userType) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && 'role' in user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role instead of home
    const dashboardPath = getDashboardPath(user, currentUserType || 'staff');
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
}
