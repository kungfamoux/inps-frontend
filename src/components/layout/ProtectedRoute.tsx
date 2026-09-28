import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { StaffRole } from '@/lib/types/common';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: StaffRole[];
  userType?: 'staff' | 'parent';
}

export function ProtectedRoute({ children, allowedRoles, userType }: ProtectedRouteProps) {
  const { user, isAuthenticated, userType: currentUserType } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (userType && currentUserType !== userType) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && user && 'role' in user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role instead of home
    if (user.role === StaffRole.BURSARY) {
      return <Navigate to="/bursary/dashboard" replace />;
    } else if (user.role === StaffRole.ADMIN || user.role === StaffRole.HEAD_TEACHER) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
