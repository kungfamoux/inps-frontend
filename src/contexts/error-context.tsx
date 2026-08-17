/**
 * Error Context Provider
 * Global error state and reporting functionality across the app
 */

import { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { logError, getSessionErrors, clearSessionErrors, getErrorStats } from '@/lib/error-logger';
import { ERROR_CONFIG } from '@/lib/error-config';

interface ErrorContextValue {
  reportError: (error: Error, context?: Record<string, unknown>) => void;
  getSessionErrors: () => ReturnType<typeof getSessionErrors>;
  clearSessionErrors: () => void;
  getErrorStats: () => ReturnType<typeof getErrorStats>;
  errorCount: number;
  hasErrors: boolean;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const [errorCount, setErrorCount] = useState(0);

  const reportError = useCallback((error: Error, context?: Record<string, unknown>) => {
    logError(error, {}, context);
    setErrorCount(prev => prev + 1);
  }, []);

  const clearErrors = useCallback(() => {
    clearSessionErrors();
    setErrorCount(0);
  }, []);

  const value: ErrorContextValue = {
    reportError,
    getSessionErrors,
    clearSessionErrors: clearErrors,
    getErrorStats,
    errorCount,
    hasErrors: errorCount > 0,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useErrorContext() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
}

// Convenience hook for reporting errors
export function useReportError() {
  const { reportError } = useErrorContext();
  return reportError;
}