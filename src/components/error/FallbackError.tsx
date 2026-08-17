/**
 * Fallback Error Component
 * User-friendly error display with recovery options
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Bug } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ERROR_CONFIG } from '@/lib/error-config';
import { toast } from 'sonner';

interface FallbackErrorProps {
  errorType?: '404' | '500' | 'network' | 'generic';
  title?: string;
  message?: string;
  showRetry?: boolean;
  showReload?: boolean;
  showHome?: boolean;
  showGoBack?: boolean;
  showReport?: boolean;
  onRetry?: () => void;
  customActions?: React.ReactNode;
}

export function FallbackError({
  errorType = 'generic',
  title,
  message,
  showRetry = ERROR_CONFIG.recovery.showRetryButton,
  showReload = ERROR_CONFIG.recovery.showReloadButton,
  showHome = ERROR_CONFIG.recovery.showHomeButton,
  showGoBack = true,
  showReport = ERROR_CONFIG.recovery.showReportButton,
  onRetry,
  customActions,
}: FallbackErrorProps) {
  const navigate = useNavigate();

  const getErrorConfig = () => {
    switch (errorType) {
      case '404':
        return {
          title: title || 'Page Not Found',
          message: message || ERROR_CONFIG.errorTypes.notFound.userMessage,
          icon: AlertTriangle,
        };
      case '500':
        return {
          title: title || 'Server Error',
          message: message || ERROR_CONFIG.errorTypes.server.userMessage,
          icon: AlertTriangle,
        };
      case 'network':
        return {
          title: title || 'Network Error',
          message: message || ERROR_CONFIG.errorTypes.network.userMessage,
          icon: AlertTriangle,
        };
      default:
        return {
          title: title || 'Something Went Wrong',
          message: message || 'An unexpected error occurred. Please try again.',
          icon: AlertTriangle,
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleReport = () => {
    // Future: Open error reporting dialog
    console.log('Report error:', errorType);
    toast.info('Error reporting is not yet available');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8 text-destructive" />
            <CardTitle className="text-2xl">{config.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{config.message}</AlertDescription>
          </Alert>

          {ERROR_CONFIG.display.showDetailedErrors && (
            <div className="bg-muted p-4 rounded-md">
              <p className="text-sm font-medium mb-2">
                Error Type: {errorType}
              </p>
              <p className="text-xs text-muted-foreground">
                Additional error details would be shown here in development
                mode.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            {showRetry && (
              <Button
                onClick={handleRetry}
                variant="default"
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}

            {showReload && (
              <Button
                onClick={handleReload}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
            )}

            {showGoBack && (
              <Button
                onClick={handleGoBack}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            )}

            {showHome && (
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="flex-1"
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            )}

            {showReport && (
              <Button
                onClick={handleReport}
                variant="outline"
                className="flex-1"
              >
                <Bug className="mr-2 h-4 w-4" />
                Report Error
              </Button>
            )}
          </div>

          {customActions && (
            <div className="pt-4 border-t">{customActions}</div>
          )}

          {!ERROR_CONFIG.display.showDetailedErrors && (
            <p className="text-xs text-muted-foreground text-center pt-2">
              If this problem persists, please contact support with the error
              details.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
