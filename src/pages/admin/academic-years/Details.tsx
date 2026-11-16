import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  ChevronRight,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowLeft,
  Calendar,
  Play,
  Pause
} from "lucide-react";
import { TermStatus } from "@/lib/types/common";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SessionDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [termToDelete, setTermToDelete] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState(false);

  const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery({
    queryKey: ["session", id],
    queryFn: () => adminApi.getSessionById(id!),
    enabled: !!id,
  });

  const { data: terms, isLoading: termsLoading } = useQuery({
    queryKey: ["sessionTerms", id],
    queryFn: () => adminApi.getTermsBySession(id!),
    enabled: !!id,
  });

  const { data: currentSession, error: currentSessionError } = useQuery({
    queryKey: ["currentSession"],
    queryFn: () => adminApi.getCurrentSession(),
    retry: false,
  });

  const { data: currentTerm, error: currentTermError } = useQuery({
    queryKey: ["currentTerm"],
    queryFn: () => adminApi.getCurrentTerm(),
    retry: false,
  });

  const deleteSessionMutation = useMutation({
    mutationFn: () => adminApi.deleteSession(id!),
    onSuccess: () => {
      toast.success("Session deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      navigate("/admin/academic-years");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete session");
    },
  });

  const deleteTermMutation = useMutation({
    mutationFn: (termId: string) => adminApi.deleteTerm(termId),
    onSuccess: () => {
      toast.success("Term deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sessionTerms", id] });
      setDeleteDialogOpen(false);
      setTermToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete term");
    },
  });

  const updateTermStatusMutation = useMutation({
    mutationFn: ({ termId, status, sessionId }: { termId: string; status: TermStatus; sessionId?: string }) => 
      adminApi.updateTermStatus(termId, { status, sessionId }),
    onSuccess: () => {
      toast.success("Term status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["sessionTerms", id] });
      queryClient.invalidateQueries({ queryKey: ["currentTerm"] });
      queryClient.invalidateQueries({ queryKey: ["currentSession"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update term status");
    },
  });

  const handleDeleteSession = () => {
    setSessionToDelete(true);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTerm = (termId: string) => {
    setTermToDelete(termId);
    setSessionToDelete(false);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      deleteSessionMutation.mutate();
    } else if (termToDelete) {
      deleteTermMutation.mutate(termToDelete);
    }
  };

  const handleSetTermAsCurrent = (termId: string) => {
    updateTermStatusMutation.mutate({
      termId,
      status: TermStatus.CURRENT,
      sessionId: id,
    });
  };

  const handleCompleteTerm = (termId: string) => {
    updateTermStatusMutation.mutate({
      termId,
      status: TermStatus.COMPLETED,
    });
  };

  const handleResetTerm = (termId: string) => {
    updateTermStatusMutation.mutate({
      termId,
      status: TermStatus.UPCOMING,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CURRENT":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="size-3" />
            Current
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="size-3" />
            Completed
          </Badge>
        );
      case "UPCOMING":
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="size-3" />
            Upcoming
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isCurrentSession = currentSession?.data?.id === id && !currentSessionError;
  const isCurrentTerm = (termId: string) => currentTerm?.data?.id === termId && !currentTermError;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (sessionLoading) {
    return (
      <>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-40 w-full" />
        </div>
      </>
    );
  }

  if (sessionError || !session?.data) {
    return (
      <>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="text-center py-8 text-destructive">
            Failed to load session. Please try again.
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/academic-years")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{session.data.session}</h1>
          <p className="text-sm text-muted-foreground">Session details and term management</p>
        </div>
        <div className="flex gap-2">
          {!isCurrentSession && (
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/academic-years/${id}/edit`)}
            >
              <Edit className="size-4 mr-2" />
              Edit Session
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleDeleteSession}
            disabled={isCurrentSession || deleteSessionMutation.isPending}
          >
            <Trash2 className="size-4 mr-2" />
            Delete Session
          </Button>
        </div>
      </div>

      {/* Session Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            Session Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Session Name</p>
              <p className="text-lg font-semibold">{session.data.session}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                {getStatusBadge(session.data.status)}
                {isCurrentSession && (
                  <Badge variant="default" className="gap-1 bg-green-600">
                    <CheckCircle className="size-3" />
                    Active
                  </Badge>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Terms</p>
              <p className="text-lg font-semibold">{terms?.data?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Terms</CardTitle>
            <Button
              className="gap-2"
              onClick={() => navigate(`/admin/academic-years/${id}/add-term`)}
            >
              <Plus className="size-4" /> Add Term
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {termsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : !terms?.data || terms.data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No terms added to this session yet. Click "Add Term" to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {terms.data.map((term) => (
                <Card key={term.id} className="hover:border-primary/50 transition-all">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {term.term.replace("_", " ")}
                          </h3>
                          {getStatusBadge(term.status)}
                          {isCurrentTerm(term.id) && (
                            <Badge variant="default" className="gap-1 bg-green-600">
                              <CheckCircle className="size-3" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            <span>Start: {formatDate(term.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            <span>End: {formatDate(term.endDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {term.status !== "CURRENT" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetTermAsCurrent(term.id)}
                            disabled={updateTermStatusMutation.isPending}
                          >
                            <Play className="size-4 mr-1" />
                            Set Current
                          </Button>
                        )}
                        {term.status === "CURRENT" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteTerm(term.id)}
                            disabled={updateTermStatusMutation.isPending}
                          >
                            <Pause className="size-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        {term.status === "COMPLETED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetTerm(term.id)}
                            disabled={updateTermStatusMutation.isPending}
                          >
                            Reset
                          </Button>
                        )}
                        {!isCurrentTerm(term.id) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTerm(term.id)}
                            disabled={deleteTermMutation.isPending}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {sessionToDelete ? "Delete Session" : "Delete Term"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {sessionToDelete
              ? "Are you sure you want to delete this session? This action cannot be undone and may affect related data like enrollments, results, and financial records."
              : "Are you sure you want to delete this term? This action cannot be undone and may affect related data like enrollments, results, and financial records."
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteSessionMutation.isPending || deleteTermMutation.isPending}
          >
            {(deleteSessionMutation.isPending || deleteTermMutation.isPending) ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
    </>
  );
}