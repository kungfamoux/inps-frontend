/**
 * Global Error Handler Hook
 * Sets up global error handlers for unhandled errors and promise rejections
 */

import { useEffect, useCallback } from 'react';
import { logError, logWarning } from '@/lib/error-logger';
import { ERROR_CONFIG, getRetryDelay, isRetryableError } from '@/lib/error-config';
import { toast } from 'sonner';

interface UseGlobalErrorHandlerOptions {
  onError?: (error: Error) => void;
  enableAutoRetry?: boolean;
}

export function useGlobalErrorHandler(options: UseGlobalErrorHandlerOptions = {}) {
  const { onError, enableAutoRetry = ERROR_CONFIG.recovery.autoRetry } = options;

  const handleError = useCallback((error: Error, context?: Record<string, unknown>) => {
    // Log the error
    logError(error, {}, context);

    // Call custom error handler if provided
    if (onError) {
      onError(error);
    }

    // Show user-friendly toast notification
    if (ERROR_CONFIG.display.userFriendlyMessages) {
      const userMessage = getUserFriendlyMessage(error);
      toast.error(userMessage, {
        description: ERROR_CONFIG.display.showDetailedErrors ? error.message : undefined,
        action: ERROR_CONFIG.recovery.showRetryButton && isRetryableError(error) ? {
          label: 'Retry',
          onClick: () => window.location.reload(),
        } : undefined,
      });
    }
  }, [onError]);

  const handleUnhandledRejection = useCallback((event: PromiseRejectionEvent) => {
    // Prevent default browser error logging
    event.preventDefault();

    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));

    handleError(error, {
      type: 'unhandled_promise_rejection',
      promise: 'true',
    });
  }, [handleError]);

  const handleWindowError = useCallback((event: ErrorEvent) => {
    const error = event.error instanceof Error 
      ? event.error 
      : new Error(event.message || 'Unknown error');

    handleError(error, {
      type: 'window_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  }, [handleError]);

  useEffect(() => {
    // Set up global error handlers
    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Clean up on unmount
    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleWindowError, handleUnhandledRejection]);

  // Provide manual error reporting function
  const reportError = useCallback((error: Error, context?: Record<string, unknown>) => {
    handleError(error, context);
  }, [handleError]);

  // Provide retry function
  const retry = useCallback(async (fn: () => Promise<void> | void, attempt = 1) => {
    try {
      await fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < ERROR_CONFIG.retry.maxRetries && isRetryableError(err)) {
        const delay = getRetryDelay(attempt);
        logWarning(`Retrying after ${delay}ms (attempt ${attempt}/${ERROR_CONFIG.retry.maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, attempt + 1);
      } else {
        handleError(err, { retryAttempts: attempt });
        throw err;
      }
    }
  }, [handleError]);

  return {
    reportError,
    retry,
  };
}

/**
 * Get user-friendly error message based on error type
 */
function getUserFriendlyMessage(error: Error): string {
  const message = error.message.toLowerCase();

  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    return ERROR_CONFIG.errorTypes.network.userMessage;
  }

  // Timeout errors
  if (message.includes('timeout')) {
    return ERROR_CONFIG.errorTypes.timeout.userMessage;
  }

  // Authentication errors
  if (message.includes('unauthorized') || message.includes('401')) {
    return ERROR_CONFIG.errorTypes.authentication.userMessage;
  }

  // Authorization errors
  if (message.includes('forbidden') || message.includes('403')) {
    return ERROR_CONFIG.errorTypes.authorization.userMessage;
  }

  // Not found errors
  if (message.includes('not found') || message.includes('404')) {
    return ERROR_CONFIG.errorTypes.notFound.userMessage;
  }

  // Server errors
  if (message.includes('500') || message.includes('502') || message.includes('503')) {
    return ERROR_CONFIG.errorTypes.server.userMessage;
  }

  // Default message
  return 'An unexpected error occurred. Please try again.';
}