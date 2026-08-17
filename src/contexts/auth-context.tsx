import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { apiClient } from '@/lib/api/client';
import { StaffRole } from '@/lib/types/common';
import type { Parent } from '@/lib/types/student';
import type { Staff } from '@/lib/types/staff';
import { logError } from '@/lib/error-logger';

export type AuthUser = Staff | Parent;
export type UserType = 'staff' | 'parent';

interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  userType: UserType | null;
  login: (email: string, password: string, userType: UserType) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasRole: (roles: StaffRole[]) => boolean;
}

interface StoredSession {
  user: AuthUser;
  userType: UserType;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function clearSession() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setUserType(null);
    window.location.assign('/');
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedSession = localStorage.getItem('user_data');
    if (storedToken && storedSession) {
      try {
        const session = JSON.parse(storedSession) as StoredSession;
        setUser(session.user);
        setUserType(session.userType);
      } catch {
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleExpired = () => void logout();
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string, type: UserType) => {
      setIsLoading(true);
      try {
        const endpoint =
          type === 'staff' ? '/api/staff/login' : '/api/parent/login';
        const response = await apiClient.post<LoginResponse>(endpoint, {
          email,
          password,
        });

        if (response.success && response.token && response.user) {
          localStorage.setItem('auth_token', response.token);
          if (response.refreshToken)
            localStorage.setItem('refresh_token', response.refreshToken);
          localStorage.setItem(
            'user_data',
            JSON.stringify({ user: response.user, userType: type }),
          );
          setUser(response.user);
          setUserType(type);
        } else {
          throw new Error('Login failed');
        }
      } catch (error: any) {
        clearSession();

        // Log authentication error
        logError(error instanceof Error ? error : new Error(String(error)), {
          type: 'auth_error',
          endpoint: type === 'staff' ? '/api/staff/login' : '/api/parent/login',
          email: email.substring(0, 3) + '***', // Partial email for privacy
        });

        // Enhance error messages for better user experience
        if (error.response?.status === 401) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (error.response?.status === 429) {
          throw new Error('Too many login attempts. Please try again later.');
        } else {
          throw error;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const refreshToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const currentType = localStorage.getItem('user_data')
      ? JSON.parse(localStorage.getItem('user_data') || '{}').userType
      : null;

    if (refreshToken) {
      try {
        // Use appropriate refresh endpoint based on user type
        const endpoint =
          currentType === 'parent'
            ? '/api/parent/refresh-token'
            : '/api/staff/refresh-token';
        const response = await apiClient.post<{
          token: string;
          refreshToken?: string;
        }>(endpoint, { refreshToken });
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          if (response.refreshToken)
            localStorage.setItem('refresh_token', response.refreshToken);
        }
      } catch (error) {
        logError(error instanceof Error ? error : new Error(String(error)), {
          type: 'token_refresh_error',
          endpoint:
            currentType === 'parent'
              ? '/api/parent/refresh-token'
              : '/api/staff/refresh-token',
        });
        logout();
      }
    }
  }, [logout]);

  const hasRole = useCallback(
    (roles: StaffRole[]) => {
      if (!user || !('role' in user)) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userType,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshToken,
      hasRole,
    }),
    [hasRole, isLoading, login, logout, refreshToken, user, userType],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider.');
  return context;
}
