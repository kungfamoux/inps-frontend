import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

const sessionSchema = z.object({
  session: z.string()
    .min(1, "Session is required")
    .regex(/^\d{4}\/\d{4}$/, "Session must be in format YYYY/YYYY (e.g., 2026/2027)")
    .refine((val) => {
      const [start, end] = val.split("/");
      const startYear = parseInt(start);
      const endYear = parseInt(end);
      return endYear === startYear + 1;
    }, "End year must be exactly one year after start year (e.g., 2026/2027)")
    .refine((val) => {
      const [start] = val.split("/");
      const startYear = parseInt(start);
      const currentYear = new Date().getFullYear();
      return startYear >= currentYear - 1;
    }, "Session year cannot be too far in the past"),
});

type SessionFormData = {
  session: string;
};

export default function AddSession() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      session: "",
    },
  });

  // Fetch session data if in edit mode
  const { data: sessionData } = useQuery({
    queryKey: ["session", id],
    queryFn: () => adminApi.getSessionById(id!),
    enabled: isEditMode,
    onSuccess: (data) => {
      if (data.data) {
        setValue("session", data.data.session);
      }
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: (data: SessionFormData) => adminApi.createSession(data),
    onSuccess: () => {
      toast.success("Session created successfully");
      navigate("/admin/academic-years");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create session");
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: (data: SessionFormData) => adminApi.updateSession(id!, data),
    onSuccess: () => {
      toast.success("Session updated successfully");
      navigate("/admin/academic-years");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update session");
    },
  });

  const onSubmit = (data: SessionFormData) => {
    if (isEditMode) {
      updateSessionMutation.mutate(data);
    } else {
      createSessionMutation.mutate(data);
    }
  };

  const generateSuggestedSession = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    return `${currentYear}/${nextYear}`;
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/academic-years")}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditMode ? "Edit Academic Session" : "Add Academic Session"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? "Update academic session information" : "Create a new academic session"}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="session">Academic Session *</Label>
              <Input
                id="session"
                placeholder="e.g., 2026/2027"
                {...register("session")}
                className="font-mono"
              />
              {errors.session && (
                <p className="text-sm text-destructive">{errors.session.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Format: YYYY/YYYY (e.g., 2026/2027). End year must be exactly one year after start year.
              </p>
            </div>

            <div className="flex gap-3">
              {!isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const suggested = generateSuggestedSession();
                    setValue("session", suggested);
                  }}
                >
                  Use Suggested: {generateSuggestedSession()}
                </Button>
              )}
              <Button
                type="submit"
                disabled={isSubmitting || createSessionMutation.isPending || updateSessionMutation.isPending}
              >
                {isSubmitting || createSessionMutation.isPending || updateSessionMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update Session" : "Create Session"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}