/**
 * SessionTermSelector Component
 * Reusable component for selecting academic session and term with cascade selection
 */

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

interface SessionTermSelectorProps {
  sessionId?: string;
  termId?: string;
  onSessionChange: (sessionId: string, sessionName: string) => void;
  onTermChange: (termId: string, term: string) => void;
  showBoth?: boolean; // Show both session and term selectors
  showSessionOnly?: boolean; // Show only session selector
  showTermOnly?: boolean; // Show only term selector
  allowCurrentOnly?: boolean; // Only allow selection of current session/term
  required?: boolean;
  disabled?: boolean;
  sessionLabel?: string;
  termLabel?: string;
  error?: string;
}

export function SessionTermSelector({
  sessionId,
  termId,
  onSessionChange,
  onTermChange,
  showBoth = true,
  showSessionOnly = false,
  showTermOnly = false,
  allowCurrentOnly = false,
  required = false,
  disabled = false,
  sessionLabel = 'Academic Session',
  termLabel = 'Term',
  error,
}: SessionTermSelectorProps) {
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => adminApi.getAllSessions(),
  });

  const { data: currentSession } = useQuery({
    queryKey: ['currentSession'],
    queryFn: () => adminApi.getCurrentSession(),
  });

  const { data: currentTerm } = useQuery({
    queryKey: ['currentTerm'],
    queryFn: () => adminApi.getCurrentTerm(),
  });

  const { data: terms, isLoading: termsLoading } = useQuery({
    queryKey: ['terms', sessionId],
    queryFn: () => (sessionId ? adminApi.getTermsBySession(sessionId) : adminApi.getAllTerms()),
    enabled: !!sessionId || showTermOnly,
  });

  // Auto-select current session/term when available
  const shouldAutoSelect = !allowCurrentOnly && currentSession?.data && currentTerm?.data;
  
  if (shouldAutoSelect && !sessionId && showBoth) {
    onSessionChange(currentSession.data.id, currentSession.data.session);
  }
  
  if (shouldAutoSelect && !termId && showBoth) {
    onTermChange(currentTerm.data.id, currentTerm.data.term);
  }

  const showSessionSelector = showBoth || showSessionOnly;
  const showTermSelector = showBoth || showTermOnly;

  // Filter sessions based on allowCurrentOnly
  const availableSessions = allowCurrentOnly && currentSession?.data
    ? [currentSession.data]
    : sessions?.data || [];

  // Filter terms based on allowCurrentOnly
  const availableTerms = allowCurrentOnly && currentTerm?.data
    ? [currentTerm.data]
    : terms?.data || [];

  return (
    <div className="space-y-4">
      {showSessionSelector && (
        <div className="space-y-2">
          <Label htmlFor="session-select">
            {sessionLabel} {required && '*'}
          </Label>
          {sessionsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              id="session-select"
              value={sessionId}
              onValueChange={(value) => {
                const session = availableSessions.find(s => s.id === value);
                onSessionChange(value, session?.session || '');
                // Reset term when session changes
                if (showBoth) {
                  onTermChange('', '');
                }
              }}
              disabled={disabled || availableSessions.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select academic session" />
              </SelectTrigger>
              <SelectContent>
                {availableSessions.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No sessions available
                  </div>
                ) : (
                  availableSessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.session} {session.status === 'CURRENT' && '(Current)'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {showTermSelector && (
        <div className="space-y-2">
          <Label htmlFor="term-select">
            {termLabel} {required && '*'}
          </Label>
          {termsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              id="term-select"
              value={termId}
              onValueChange={(value) => {
                const term = availableTerms.find(t => t.id === value);
                onTermChange(value, term?.term || '');
              }}
              disabled={disabled || !sessionId || availableTerms.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={showSessionOnly ? "Select session first" : "Select term"} />
              </SelectTrigger>
              <SelectContent>
                {availableTerms.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    {showSessionOnly && !sessionId ? "Select a session first" : "No terms available"}
                  </div>
                ) : (
                  availableTerms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.term.replace('_', ' ')} {term.status === 'CURRENT' && '(Current)'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}