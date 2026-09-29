import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Plus,
  ChevronRight,
  Calendar,
  Trash2,
  Edit
} from "lucide-react";
import { StatusDotBadge } from "@/components/admin/lists/StatusDotBadge";
import { ListEmptyState } from "@/components/admin/lists/ListEmptyState";
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

export default function AcademicYearsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => adminApi.getAllSessions(),
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
    mutationFn: (sessionId: string) => adminApi.deleteSession(sessionId),
    onSuccess: () => {
      toast.success("Session deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete session");
    },
  });

  const handleDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      deleteSessionMutation.mutate(sessionToDelete);
    }
  };

  const isCurrentSession = (sessionId: string) => {
    return currentSession?.data?.id === sessionId;
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Academic Years</h1>
            <p className="text-sm text-muted-foreground">Manage academic sessions and terms</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/admin/academic-years/add")}>
            <Plus className="size-4" /> Add Session
          </Button>
        </div>

        {/* Current Session/Term Indicator */}
        {(currentSession?.data && !currentSessionError) || (currentTerm?.data && !currentTermError) ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Calendar className="size-5" />
                </span>
                Current Academic Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 md:flex-row md:gap-6">
                {currentSession?.data && !currentSessionError && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Session:</span>
                    <Badge variant="default" className="font-medium">
                      {currentSession.data.session}
                    </Badge>
                  </div>
                )}
                {currentTerm?.data && !currentTermError && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Term:</span>
                    <Badge variant="default" className="font-medium">
                      {currentTerm.data.term.replace("_", " ")}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>All Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Failed to load sessions. Please try again.
              </div>
            ) : !sessions?.data || sessions.data.length === 0 ? (
              <ListEmptyState
                icon={Calendar}
                title="No sessions found"
                message="Create your first academic session to start managing terms and enrollment periods."
                action={
                  <Button onClick={() => navigate("/admin/academic-years/add")}>
                    <Plus className="size-4" /> Add Session
                  </Button>
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sessions.data.map((session) => (
                  <Card
                    key={session.id}
                    onClick={() => navigate(`/admin/academic-years/${session.id}`)}
                    className="group cursor-pointer gap-0 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Calendar className="size-5" />
                        </span>
                        <div className="min-w-0">
                          <CardTitle className="truncate text-base leading-snug">
                            {session.session}
                          </CardTitle>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <StatusDotBadge status={session.status} />
                            {isCurrentSession(session.id) && (
                              <StatusDotBadge status="ACTIVE" label="Active" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                          <span className="text-muted-foreground">Terms</span>
                          <span className="font-semibold">
                            {session.terms?.length || 0}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => navigate(`/admin/academic-years/${session.id}`)}
                          >
                            View
                            <ChevronRight className="size-4" />
                          </Button>
                          {!isCurrentSession(session.id) && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Edit session"
                                className="hover:text-foreground"
                                onClick={() => navigate(`/admin/academic-years/${session.id}/edit`)}
                              >
                                <Edit className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Delete session"
                                onClick={() => handleDeleteSession(session.id)}
                                disabled={deleteSessionMutation.isPending}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </>
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
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this session? This action cannot be undone and may affect related data like enrollments, results, and financial records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteSessionMutation.isPending}
            >
              {deleteSessionMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}