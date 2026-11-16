import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Term, SubjectAssignmentStatus } from "@/lib/types/common";

export default function EditAssignment() {
  const navigate = useNavigate();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: assignment, isLoading, error } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: () => adminApi.getAssignmentById(assignmentId!),
    enabled: !!assignmentId,
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: (assignmentId: string) => adminApi.removeAssignment(assignmentId),
    onSuccess: () => {
      toast.success("Assignment removed successfully");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      navigate("/admin/assignments");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove assignment");
    },
  });

  const handleDelete = () => {
    removeAssignmentMutation.mutate(assignmentId!);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
      case "INACTIVE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/assignments")}>
            <ArrowLeft className="size-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Assignment</h1>
            <p className="text-sm text-muted-foreground">View and manage assignment details</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !assignment?.data) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/assignments")}>
            <ArrowLeft className="size-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Assignment</h1>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-destructive">
              Failed to load assignment. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assignmentData = assignment.data;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/assignments")}>
          <ArrowLeft className="size-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Assignment</h1>
          <p className="text-sm text-muted-foreground">View and manage assignment details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Teacher</label>
              <p className="text-lg font-semibold">
                {assignmentData.teacher?.firstName} {assignmentData.teacher?.lastName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Subject</label>
              <p className="text-lg font-semibold">{assignmentData.subject?.subjectCode} - {assignmentData.subject?.subjectName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Class</label>
              <p className="text-lg font-semibold">{assignmentData.class?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div className="mt-1">{getStatusBadge(assignmentData.status)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Academic Year</label>
              <p className="text-lg font-semibold">{assignmentData.academicYear}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Term</label>
              <p className="text-lg font-semibold">{assignmentData.term.replace("_", " ")}</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Assignment Actions</h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="size-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-amber-800 mb-2">
                    Note: Assignments cannot be directly edited. To change an assignment, you must remove the current one and create a new one.
                  </p>
                  {!showDeleteConfirm ? (
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="size-4 mr-2" /> Remove Assignment
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={removeAssignmentMutation.isPending}
                      >
                        {removeAssignmentMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 size-4 animate-spin" />
                            Removing...
                          </>
                        ) : (
                          "Confirm Remove"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/assignments/add")}
            >
              Create New Assignment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}