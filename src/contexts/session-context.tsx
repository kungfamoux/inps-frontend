import { createContext, useContext, useState, useEffect } from "react";
import { AcademicSession, AcademicTerm, Term, StaffRole } from "@/lib/types/common";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "./auth-context";

interface SessionContextType {
  currentSession: AcademicSession | null;
  currentTerm: AcademicTerm | null;
  selectedSession: AcademicSession | null;
  selectedTerm: AcademicTerm | null;
  isHistoricalView: boolean;
  allSessions: AcademicSession[];
  isLoading: boolean;
  error: string | null;
  setHistoricalView: (session: AcademicSession, term: AcademicTerm) => void;
  returnToCurrent: () => void;
  switchSession: (sessionId: string) => Promise<void>;
  switchTerm: (termId: string) => Promise<void>;
  refreshCurrent: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, userType, user } = useAuth();
  const isParent = userType === "parent";
  const isBursary = userType === "staff" && user && "role" in user && user.role === "BURSARY";
  const isTeacher = userType === "staff" && user && "role" in user && user.role === StaffRole.TEACHER;

  const [currentSession, setCurrentSession] = useState<AcademicSession | null>(null);
  const [currentTerm, setCurrentTerm] = useState<AcademicTerm | null>(null);
  const [selectedSession, setSelectedSession] = useState<AcademicSession | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm | null>(null);
  const [isHistoricalView, setIsHistoricalView] = useState(false);
  const [allSessions, setAllSessions] = useState<AcademicSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load current session/term from backend on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated && !isParent && !isBursary && !isTeacher) {
      loadCurrentSessionAndTerm();
      loadAllSessions();
    } else if (isAuthenticated && isParent) {
      // For parents, don't load session data to avoid 401 errors
      // They use their own parent-specific API calls
      setIsLoading(false);
    } else if (isAuthenticated && isBursary) {
      // For bursary users, don't load admin session data to avoid 403 errors
      // Backend doesn't provide session endpoints for bursary role
      setIsLoading(false);
    } else if (isAuthenticated && isTeacher) {
      // For teachers, don't load admin session data to avoid 403 errors
      // Teachers don't have access to admin config endpoints
      setIsLoading(false);
    } else {
      // Clear session data when not authenticated
      setCurrentSession(null);
      setCurrentTerm(null);
      setAllSessions([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, isParent, isBursary, isTeacher]);

  // Check URL parameters for historical view
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionParam = urlParams.get("session");
    const termParam = urlParams.get("term");

    if (sessionParam && termParam) {
      // Find matching session and term
      const session = allSessions.find(s => s.session === sessionParam);
      if (session) {
        const term = session.terms?.find(t => t.term === termParam as Term);
        if (term) {
          setHistoricalView(session, term);
        }
      }
    }
  }, [allSessions]);

  const loadCurrentSessionAndTerm = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Use parent-specific endpoints for parents
      const termEndpoint = isParent ? "/api/parent/config/terms/current" : "/api/admin/config/terms/current";
      const sessionEndpoint = isParent ? "/api/parent/config/sessions/current" : "/api/admin/config/sessions/current";

      // Get current term (which includes session info via sanitization)
      const termResponse = await apiClient.get<{ success: boolean; data: AcademicTerm }>(termEndpoint);
      if (termResponse.success && termResponse.data) {
        setCurrentTerm(termResponse.data);
        if (termResponse.data.session) {
          setCurrentSession(termResponse.data.session);
        }
      } else {
        // No current term set - clear values and set error
        console.log("No current term set yet");
        setCurrentSession(null);
        setCurrentTerm(null);
        setError("No academic session or term configured. Please configure an academic session first.");
      }
    } catch (error: any) {
      console.error("Error loading current session/term:", error);
      setCurrentSession(null);
      setCurrentTerm(null);
      // Check if it's the expected "No current term set" error
      if (error.message?.includes("No current term set") || error.response?.status === 400) {
        setError("No academic session or term configured. Please configure an academic session first.");
      } else {
        setError("Failed to load current academic session/term");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllSessions = async () => {
    try {
      // Use parent-specific endpoint for parents
      const sessionsEndpoint = isParent ? "/api/parent/config/sessions" : "/api/admin/config/sessions";

      const sessionsResponse = await apiClient.get<{ success: boolean; data: AcademicSession[] }>(sessionsEndpoint);
      if (sessionsResponse.success && sessionsResponse.data) {
        setAllSessions(sessionsResponse.data);
      }
    } catch (error) {
      console.error("Error loading all sessions:", error);
    }
  };

  const setHistoricalView = (session: AcademicSession, term: AcademicTerm) => {
    setSelectedSession(session);
    setSelectedTerm(term);
    setIsHistoricalView(true);

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set("session", session.session);
    url.searchParams.set("term", term.term);
    window.history.pushState({}, "", url);
  };

  const returnToCurrent = () => {
    setSelectedSession(null);
    setSelectedTerm(null);
    setIsHistoricalView(false);

    // Clear URL parameters
    const url = new URL(window.location.href);
    url.searchParams.delete("session");
    url.searchParams.delete("term");
    window.history.pushState({}, "", url);
  };

  const switchSession = async (sessionId: string) => {
    // Parents cannot switch sessions - read-only
    if (isParent) {
      console.log("Parents cannot switch sessions");
      return;
    }

    try {
      // Find the session in allSessions
      const session = allSessions.find(s => s.id === sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      // If session has a current term, set both
      const currentTermInSession = session.terms?.find(t => t.status === "CURRENT");
      if (currentTermInSession) {
        await apiClient.put<{ success: boolean; data: { session: AcademicSession; term: AcademicTerm } }>(
          "/api/admin/config/current",
          { sessionId, termId: currentTermInSession.id }
        );
      }

      // Refresh current data
      await loadCurrentSessionAndTerm();
      await loadAllSessions();
    } catch (error) {
      console.error("Error switching session:", error);
      throw error;
    }
  };

  const switchTerm = async (termId: string) => {
    // Parents cannot switch terms - read-only
    if (isParent) {
      console.log("Parents cannot switch terms");
      return;
    }
    try {
      // Find the term in allSessions
      let foundTerm: AcademicTerm | null = null;
      let foundSession: AcademicSession | null = null;

      for (const session of allSessions) {
        const term = session.terms?.find(t => t.id === termId);
        if (term) {
          foundTerm = term;
          foundSession = session;
          break;
        }
      }

      if (!foundTerm || !foundSession) {
        throw new Error("Term not found");
      }

      await apiClient.put<{ success: boolean; data: { session: AcademicSession; term: AcademicTerm } }>(
        "/api/admin/config/current",
        { sessionId: foundSession.id, termId }
      );

      // Refresh current data
      await loadCurrentSessionAndTerm();
      await loadAllSessions();
    } catch (error) {
      console.error("Error switching term:", error);
      throw error;
    }
  };

  const refreshCurrent = async () => {
    await loadCurrentSessionAndTerm();
    await loadAllSessions();
  };

  // Determine which session/term to use (current or selected)
  const effectiveSession = isHistoricalView ? selectedSession : currentSession;
  const effectiveTerm = isHistoricalView ? selectedTerm : currentTerm;

  const value: SessionContextType = {
    currentSession,
    currentTerm,
    selectedSession: effectiveSession,
    selectedTerm: effectiveTerm,
    isHistoricalView,
    allSessions,
    isLoading,
    error,
    setHistoricalView,
    returnToCurrent,
    switchSession,
    switchTerm,
    refreshCurrent,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};
