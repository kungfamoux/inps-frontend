import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpCircle,
  Users,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowRight,
  Calendar,
} from "lucide-react";

interface AcademicSession {
  id: string;
  session: string;
  status: string;
  terms: Array<{
    id: string;
    term: string;
    status: string;
  }>;
}

export default function Promotion() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [promotionResult, setPromotionResult] = useState<any>(null);
  const [error, setError] = useState("");

  // Fetch all sessions
  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => adminApi.getAllSessions(),
  });

  const sessions = sessionsData?.data || [];

  // Verify promotion mutation
  const verifyMutation = useMutation({
    mutationFn: (sessionId: string) => adminApi.verifyPromotion(sessionId),
    onSuccess: (data) => {
      setVerificationResult(data.data);
      setPromotionResult(null);
      setError("");
    },
    onError: (err: any) => {
      setError(err.message || "Verification failed");
      setVerificationResult(null);
    },
  });

  // Run promotion mutation
  const promotionMutation = useMutation({
    mutationFn: (sessionId: string) => adminApi.runPromotion(sessionId),
    onSuccess: (data) => {
      setPromotionResult(data.data);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (err: any) => {
      setError(err.message || "Promotion failed");
      setPromotionResult(null);
    },
  });

  const selectedSession = sessions.find((s: AcademicSession) => s.id === selectedSessionId);
  const completedTerms = selectedSession?.terms?.filter((t: any) => t.status === "COMPLETED") || [];
  const isReady = completedTerms.length === 3;

  const handleVerify = () => {
    if (!selectedSessionId) {
      setError("Please select a session");
      return;
    }
    verifyMutation.mutate(selectedSessionId);
  };

  const handleRunPromotion = () => {
    if (!selectedSessionId) {
      setError("Please select a session");
      return;
    }
    if (!verificationResult?.canPromote) {
      setError("Session is not ready for promotion");
      return;
    }
    if (!confirm("Are you sure you want to run promotion? This will automatically promote all students except Primary 5.")) {
      return;
    }
    promotionMutation.mutate(selectedSessionId);
  };

  const handleReset = () => {
    setSelectedSessionId("");
    setVerificationResult(null);
    setPromotionResult(null);
    setError("");
  };

  if (sessionsLoading) {
    return (
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}>
            <ArrowRight className="size-4 rotate-180" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Student Promotion</h1>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <Loader2 className="size-8 animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}>
          <ArrowRight className="size-4 rotate-180" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Promotion</h1>
          <p className="text-sm text-muted-foreground">Automatic student promotion at end of academic year</p>
        </div>
      </div>

        {/* Session Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              Select Academic Session
            </CardTitle>
            <CardDescription>
              Choose the session to promote students from. All 3 terms must be completed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 max-w-md">
              <label className="text-sm font-medium">Academic Session</label>
              <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session: AcademicSession) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.session} ({session.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSession && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Terms Status:</span>
                  <Badge variant={isReady ? "default" : "secondary"}>
                    {completedTerms.length}/3 Completed
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedSession.terms.map((term: any) => (
                    <Badge
                      key={term.id}
                      variant={term.status === "COMPLETED" ? "default" : "outline"}
                    >
                      {term.term.replace("_", " ")} - {term.status}
                    </Badge>
                  ))}
                </div>
                {!isReady && (
                  <Alert className="mt-3">
                    <AlertTriangle className="size-4" />
                    <AlertDescription>
                      All 3 terms must be completed before promotion can run.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleVerify}
                disabled={!selectedSessionId || verifyMutation.isPending}
              >
                {verifyMutation.isPending ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="size-4 mr-2" />
                )}
                Verify Promotion
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-600" />
                Verification Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Users className="size-4" />
                    Total Students
                  </div>
                  <p className="text-2xl font-bold">{verificationResult.totalStudents}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <ArrowUpCircle className="size-4" />
                    Ready to Promote
                  </div>
                  <p className="text-2xl font-bold">{verificationResult.readyToPromote}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <CheckCircle className="size-4" />
                    Can Promote
                  </div>
                  <p className="text-2xl font-bold">
                    {verificationResult.canPromote ? "Yes" : "No"}
                  </p>
                </div>
              </div>

              {verificationResult.canPromote && (
                <>
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="size-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      <strong>Important:</strong> Primary 5 students will be skipped for manual handling.
                      Primary 6 students will be graduated. All other students will be promoted to the next level.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleRunPromotion}
                    disabled={promotionMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {promotionMutation.isPending ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <ArrowUpCircle className="size-4 mr-2" />
                    )}
                    Run Promotion
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Promotion Result */}
        {promotionResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="size-5 text-green-600" />
                Promotion Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Users className="size-4" />
                    Total Processed
                  </div>
                  <p className="text-2xl font-bold">{promotionResult.total}</p>
                </div>
                <div className="p-4 border rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <ArrowUpCircle className="size-4" />
                    Promoted
                  </div>
                  <p className="text-2xl font-bold">{promotionResult.promoted}</p>
                </div>
                <div className="p-4 border rounded-lg bg-purple-50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <GraduationCap className="size-4" />
                    Graduated
                  </div>
                  <p className="text-2xl font-bold">{promotionResult.graduated}</p>
                </div>
                <div className="p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <AlertTriangle className="size-4" />
                    Skipped (P5)
                  </div>
                  <p className="text-2xl font-bold">{promotionResult.skipped}</p>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle className="size-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Promotion completed successfully. Students have been enrolled in the next academic session.
                  Primary 5 students require manual handling. Use the Bulk Transfer feature to move them to Primary 6.
                </AlertDescription>
              </Alert>

              <Button onClick={handleReset} variant="outline" className="w-full">
                Process Another Session
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
