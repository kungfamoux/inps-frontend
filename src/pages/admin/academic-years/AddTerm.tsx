import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";
import { Term } from "@/lib/types/common";

const termSchema = z.object({
  term: z.nativeEnum(Term, {
    errorMap: () => ({ message: "Please select a term" }),
  }),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type TermFormData = {
  term: Term;
  startDate: string;
  endDate: string;
};

export default function AddTerm() {
  const navigate = useNavigate();
  const { id: sessionId } = useParams();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TermFormData>({
    resolver: zodResolver(termSchema),
    defaultValues: {
      term: Term.FIRST_TERM,
      startDate: "",
      endDate: "",
    },
  });

  const { data: session } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => adminApi.getSessionById(sessionId!),
    enabled: !!sessionId,
  });

  const { data: existingTerms } = useQuery({
    queryKey: ["sessionTerms", sessionId],
    queryFn: () => adminApi.getTermsBySession(sessionId!),
    enabled: !!sessionId,
  });

  const createTermMutation = useMutation({
    mutationFn: (data: TermFormData) => 
      adminApi.createTerm({
        ...data,
        sessionId: sessionId!,
      }),
    onSuccess: () => {
      toast.success("Term created successfully");
      navigate(`/admin/academic-years/${sessionId}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create term");
    },
  });

  const onSubmit = (data: TermFormData) => {
    // Check if term already exists for this session
    const termExists = existingTerms?.data?.some(
      (term) => term.term === data.term
    );

    if (termExists) {
      toast.error("This term already exists for this session");
      return;
    }

    createTermMutation.mutate(data);
  };

  const getAvailableTerms = () => {
    const existingTermTypes = existingTerms?.data?.map((term) => term.term) || [];
    return Object.values(Term).filter((term) => !existingTermTypes.includes(term));
  };

  const availableTerms = getAvailableTerms();

  if (!session?.data) {
    return (
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="text-center py-8 text-destructive">
          Session not found. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/academic-years/${sessionId}`)}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Term to {session.data.session}</h1>
          <p className="text-sm text-muted-foreground">Create a new term for this academic session</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Term Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="term">Term *</Label>
              <Controller
                name="term"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a term" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTerms.length > 0 ? (
                        availableTerms.map((term) => (
                          <SelectItem key={term} value={term}>
                            {term.replace("_", " ")}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          All terms already added
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.term && (
                <p className="text-sm text-destructive">{errors.term.message}</p>
              )}
              {availableTerms.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  All three terms (First, Second, Third) have already been added to this session.
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4" />
              <p>Enter the start and end dates for this term period.</p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || createTermMutation.isPending || availableTerms.length === 0}
            >
              {isSubmitting || createTermMutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Add Term"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}