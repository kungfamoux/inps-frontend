/**
 * Error Logging Service
 * Console-based error logging with detailed context capture
 * Prepared for future external service integration
 */

import { ERROR_CONFIG } from './error-config';

interface ErrorContext {
  timestamp: string;
  userId?: string;
  userType?: string;
  route?: string;
  userAgent?: string;
  url?: string;
  additionalContext?: Record<string, unknown>;
}

interface LogEntry {
  level: 'error' | 'warning' | 'info';
  message: string;
  error?: Error;
  context?: ErrorContext;
  stack?: string;
  componentStack?: string;
}

class ErrorLogger {
  private errorHistory: Map<string, LogEntry[]> = new Map();
  private maxHistorySize = 50;
  private sessionErrors: LogEntry[] = [];

  /**
   * Log an error with context
   */
  logError(error: Error, context?: Partial<ErrorContext>, additionalInfo?: Record<string, unknown>) {
    const errorContext: ErrorContext = {
      timestamp: new Date().toISOString(),
      route: window.location.pathname,
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context,
    };

    // Add user context if available
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        errorContext.userId = user.user?.id;
        errorContext.userType = user.userType;
      } catch (e) {
        // Ignore parse errors
      }
    }

    const logEntry: LogEntry = {
      level: 'error',
      message: error.message,
      error,
      context: errorContext,
      stack: error.stack,
      additionalContext: additionalInfo,
    };

    this.addToHistory(logEntry);
    this.sessionErrors.push(logEntry);

    // Console logging
    if (ERROR_CONFIG.logging.consoleEnabled) {
      this.logToConsole(logEntry);
    }

    // Future: Send to external service
    // if (ERROR_CONFIG.logging.service && ERROR_CONFIG.logging.service !== 'none') {
    //   this.sendToExternalService(logEntry);
    // }
  }

  /**
   * Log a warning
   */
  logWarning(message: string, context?: Partial<ErrorContext>) {
    const logEntry: LogEntry = {
      level: 'warning',
      message,
      context: {
        timestamp: new Date().toISOString(),
        route: window.location.pathname,
        url: window.location.href,
        ...context,
      },
    };

    this.addToHistory(logEntry);

    if (ERROR_CONFIG.logging.consoleEnabled) {
      console.warn('⚠️ [Error Logger]', message, logEntry.context);
    }
  }

  /**
   * Log info
   */
  logInfo(message: string, context?: Partial<ErrorContext>) {
    const logEntry: LogEntry = {
      level: 'info',
      message,
      context: {
        timestamp: new Date().toISOString(),
        route: window.location.pathname,
        url: window.location.href,
        ...context,
      },
    };

    this.addToHistory(logEntry);

    if (ERROR_CONFIG.logging.consoleEnabled && ERROR_CONFIG.logging.level === 'debug') {
      console.info('ℹ️ [Error Logger]', message, logEntry.context);
    }
  }

  /**
   * Log to console with appropriate formatting
   */
  private logToConsole(entry: LogEntry) {
    const emoji = entry.level === 'error' ? '❌' : '⚠️';
    
    console.group(`${emoji} [Error Logger] ${entry.message}`);
    
    if (entry.context) {
      console.log('Context:', entry.context);
    }
    
    if (entry.error && ERROR_CONFIG.logging.includeStackTraces) {
      console.error('Error:', entry.error);
      if (entry.error.stack) {
        console.log('Stack Trace:', entry.error.stack);
      }
    }
    
    if (entry.componentStack && ERROR_CONFIG.logging.includeComponentStack) {
      console.log('Component Stack:', entry.componentStack);
    }
    
    if (entry.additionalContext) {
      console.log('Additional Context:', entry.additionalContext);
    }
    
    console.groupEnd();
  }

  /**
   * Add to error history for deduplication
   */
  private addToHistory(entry: LogEntry) {
    const key = this.getEntryKey(entry);
    
    if (!this.errorHistory.has(key)) {
      this.errorHistory.set(key, []);
    }
    
    const history = this.errorHistory.get(key)!;
    history.push(entry);
    
    // Limit history size
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  /**
   * Generate a key for error deduplication
   */
  private getEntryKey(entry: LogEntry): string {
    if (entry.error) {
      return `${entry.error.name}:${entry.error.message}`;
    }
    return `${entry.level}:${entry.message}`;
  }

  /**
   * Get error history for a specific error
   */
  getErrorHistory(error: Error): LogEntry[] {
    const key = `${error.name}:${error.message}`;
    return this.errorHistory.get(key) || [];
  }

  /**
   * Get all session errors
   */
  getSessionErrors(): LogEntry[] {
    return [...this.sessionErrors];
  }

  /**
   * Clear session errors
   */
  clearSessionErrors() {
    this.sessionErrors = [];
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.sessionErrors.length,
      byLevel: {} as Record<string, number>,
      byType: {} as Record<string, number>,
    };

    this.sessionErrors.forEach(entry => {
      stats.byLevel[entry.level] = (stats.byLevel[entry.level] || 0) + 1;
      
      if (entry.error) {
        stats.byType[entry.error.name] = (stats.byType[entry.error.name] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Future: Send to external service
   */
  private async sendToExternalService(entry: LogEntry) {
    // Future implementation for Sentry or custom error service
    // Example:
    // if (ERROR_CONFIG.logging.service === 'sentry') {
    //   Sentry.captureException(entry.error, {
    //     extra: entry.context,
    //     tags: {
    //       level: entry.level,
    //       route: entry.context?.route,
    //     },
    //   });
    // }
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();

// Convenience functions
export const logError = (error: Error, context?: Partial<ErrorContext>, additionalInfo?: Record<string, unknown>) => {
  errorLogger.logError(error, context, additionalInfo);
};

export const logWarning = (message: string, context?: Partial<ErrorContext>) => {
  errorLogger.logWarning(message, context);
};

export const logInfo = (message: string, context?: Partial<ErrorContext>) => {
  errorLogger.logInfo(message, context);
};

export const getSessionErrors = () => errorLogger.getSessionErrors();
export const clearSessionErrors = () => errorLogger.clearSessionErrors();
export const getErrorStats = () => errorLogger.getErrorStats();