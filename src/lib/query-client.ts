import { QueryClient } from '@tanstack/react-query';
import { logError } from './error-logger';
import { ERROR_CONFIG, getRetryDelay, isRetryableError } from './error-config';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error) => {
        const err = error as Error;

        // Check if error is retryable
        if (!isRetryableError(err)) {
          return false;
        }

        // Check max retries
        if (failureCount >= ERROR_CONFIG.retry.maxRetries) {
          return false;
        }

        // Log retry attempt
        console.log(
          `Retrying query (attempt ${failureCount + 1}/${ERROR_CONFIG.retry.maxRetries})`,
        );

        return true;
      },
      retryDelay: (attemptIndex) => {
        return getRetryDelay(attemptIndex + 1);
      },
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      onError: (error) => {
        const err = error as Error;
        logError(err, {
          type: 'query_error',
          query: 'unknown',
        });
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        const err = error as Error;

        // Check if error is retryable
        if (!isRetryableError(err)) {
          return false;
        }

        // Check max retries
        if (failureCount >= ERROR_CONFIG.retry.maxRetries) {
          return false;
        }

        // Log retry attempt
        console.log(
          `Retrying mutation (attempt ${failureCount + 1}/${ERROR_CONFIG.retry.maxRetries})`,
        );

        return true;
      },
      retryDelay: (attemptIndex) => {
        return getRetryDelay(attemptIndex + 1);
      },
      onError: (error) => {
        const err = error as Error;
        logError(err, {
          type: 'mutation_error',
          mutation: 'unknown',
        });
      },
    },
  },
});
