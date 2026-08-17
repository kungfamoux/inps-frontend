/**
 * Error Configuration
 * Centralized error handling configuration for the application
 */

export const ERROR_CONFIG = {
  // Environment settings
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // Logging configuration
  logging: {
    enabled: true,
    level: import.meta.env.DEV ? 'debug' : 'error',
    includeStackTraces: import.meta.env.DEV,
    includeComponentStack: import.meta.env.DEV,
    consoleEnabled: true,
    // Future: external service configuration
    // service: 'sentry', // 'sentry', 'custom', 'none'
    // serviceConfig: {
    //   dsn: process.env.SENTRY_DSN,
    //   environment: import.meta.env.MODE,
    // },
  },

  // Error display preferences
  display: {
    showDetailedErrors: import.meta.env.DEV,
    showStackTraces: import.meta.env.DEV,
    showComponentStack: import.meta.env.DEV,
    userFriendlyMessages: !import.meta.env.DEV,
  },

  // Retry configuration
  retry: {
    maxRetries: 3,
    retryDelay: 1000, // Initial delay in ms
    retryDelayMultiplier: 2, // Exponential backoff
    retryableErrors: [
      'Network Error',
      'Timeout',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
    ],
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  },

  // Error recovery options
  recovery: {
    autoRetry: true,
    showRetryButton: true,
    showReloadButton: true,
    showHomeButton: true,
    showReportButton: import.meta.env.DEV, // Only in development for now
    safeNavigationRoutes: ['/admin/dashboard', '/parent/dashboard', '/'],
  },

  // Error reporting
  reporting: {
    enabled: import.meta.env.DEV, // Only in development for now
    reportUrl: '', // Future: error reporting endpoint
    includeUserContext: true,
    includeRouteContext: true,
    includeBrowserInfo: true,
  },

  // Error types that should be handled differently
  errorTypes: {
    network: {
      retryable: true,
      userMessage: 'Network error occurred. Please check your connection and try again.',
      showRetry: true,
    },
    authentication: {
      retryable: false,
      userMessage: 'Authentication error. Please log in again.',
      showLogin: true,
    },
    authorization: {
      retryable: false,
      userMessage: 'You do not have permission to perform this action.',
      showContactSupport: true,
    },
    validation: {
      retryable: false,
      userMessage: 'Please check your input and try again.',
      showFieldErrors: true,
    },
    notFound: {
      retryable: false,
      userMessage: 'The requested resource was not found.',
      showGoBack: true,
    },
    server: {
      retryable: true,
      userMessage: 'Server error occurred. Please try again later.',
      showRetry: true,
    },
    timeout: {
      retryable: true,
      userMessage: 'Request timed out. Please try again.',
      showRetry: true,
    },
  },
} as const;

export type ErrorType = keyof typeof ERROR_CONFIG.errorTypes;

export function getErrorConfig(errorType: ErrorType) {
  return ERROR_CONFIG.errorTypes[errorType];
}

export function isRetryableError(error: Error): boolean {
  const errorMessage = error.message.toLowerCase();
  return ERROR_CONFIG.retry.retryableErrors.some(retryableError =>
    errorMessage.includes(retryableError.toLowerCase())
  );
}

export function shouldShowDetailedError(): boolean {
  return ERROR_CONFIG.display.showDetailedErrors;
}

export function getRetryDelay(attempt: number): number {
  return ERROR_CONFIG.retry.retryDelay * 
    Math.pow(ERROR_CONFIG.retry.retryDelayMultiplier, attempt - 1);
}