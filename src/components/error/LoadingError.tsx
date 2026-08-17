/**
 * Loading Error Component
 * Display for failed data fetches with retry functionality
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ERROR_CONFIG, getRetryDelay } from '@/lib/error-config';

interface LoadingErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => Promise<void> | void;
  showRetry?: boolean;
  showGoBack?: boolean;
  showHome?: boolean;
  customActions?: React.ReactNode;
}

export function LoadingError({
  title = 'Failed to Load',
  message = 'Unable to load the requested data. Please try again.',
  onRetry,
  showRetry = true,
  showGoBack = true,
  showHome = true,
  customActions,
}: LoadingErrorProps) {
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
      // Increment retry count
      setRetryCount(prev => prev + 1);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const canRetry = retryCount < ERROR_CONFIG.retry.maxRetries;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>

        <div className="flex flex-col sm:flex-row gap-3">
          {showRetry && onRetry && canRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="default"
              className="flex-1"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry {retryCount > 0 ? `(${retryCount}/${ERROR_CONFIG.retry.maxRetries})` : ''}
                </>
              )}
            </Button>
          )}

          {showRetry && onRetry && !canRetry && (
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload Page
            </Button>
          )}

          {showGoBack && (
            <Button onClick={handleGoBack} variant="outline" className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          )}

          {showHome && (
            <Button onClick={handleGoHome} variant="outline" className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          )}
        </div>

        {customActions && (
          <div className="mt-4 pt-4 border-t">
            {customActions}
          </div>
        )}

        {retryCount > 0 && !canRetry && (
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Maximum retry attempts reached. Please reload the page or try again later.
          </p>
        )}
      </CardContent>
    </Card>
  );
}