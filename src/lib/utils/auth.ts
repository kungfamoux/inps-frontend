import { StaffRole } from '@/lib/types/common';
import type { AuthUser, UserType } from '@/contexts/auth-context';

/**
 * Returns the appropriate dashboard path for a given user and user type.
 * This centralizes the role-to-dashboard mapping logic.
 */
export function getDashboardPath(user: AuthUser, userType: UserType): string {
  if (userType === 'parent') {
    return '/parent/dashboard';
  }

  if (userType === 'staff' && 'role' in user) {
    const role = user.role;

    switch (role) {
      case StaffRole.BURSARY:
        return '/bursary/dashboard';
      case StaffRole.NURSE:
        return '/health/dashboard';
      case StaffRole.TEACHER:
        return '/teacher/dashboard';
      case StaffRole.PROPRIETOR:
        return '/proprietor/dashboard';
      case StaffRole.ADMIN:
      case StaffRole.HEAD_TEACHER:
      default:
        return '/admin/dashboard';
    }
  }

  // Fallback for unexpected cases
  return '/admin/dashboard';
}
