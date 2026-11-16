import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, CheckCircle, FileText as FileTextIcon, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { adminApi } from "@/lib/api/admin";
import StatisticsCards from "@/components/results/StatisticsCards";
import ClassEntryStatus from "@/components/results/ClassEntryStatus";
import RecentActivity from "@/components/results/RecentActivity";

export default function ResultsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    totalResults: 0,
    pendingVerification: 0,
    completionPercentage: 0,
  });
  const [classStatus, setClassStatus] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log("🚀 [Results Dashboard] Starting to load dashboard data...");
      
      // Load statistics
      console.log("📊 [Results Dashboard] Fetching statistics...");
      const statsResponse = await adminApi.getResultsStatistics();
      console.log("📊 [Results Dashboard] Statistics response:", statsResponse);
      if (statsResponse.success) {
        console.log("✅ [Results Dashboard] Statistics loaded successfully:", statsResponse.data);
        setStatistics(statsResponse.data);
      } else {
        console.error("❌ [Results Dashboard] Failed to load statistics:", statsResponse.message);
      }

      // Load class entry status
      console.log("📋 [Results Dashboard] Fetching class entry status...");
      const classStatusResponse = await adminApi.getEntryStatusByClass();
      console.log("📋 [Results Dashboard] Class status response:", classStatusResponse);
      if (classStatusResponse.success) {
        console.log("✅ [Results Dashboard] Class status loaded successfully:", classStatusResponse.data);
        setClassStatus(classStatusResponse.data);
      } else {
        console.error("❌ [Results Dashboard] Failed to load class status:", classStatusResponse.message);
      }

      // Load recent activity
      console.log("📝 [Results Dashboard] Fetching recent activity...");
      const activityResponse = await adminApi.getRecentActivity({ limit: 10 });
      console.log("📝 [Results Dashboard] Recent activity response:", activityResponse);
      if (activityResponse.success) {
        console.log("✅ [Results Dashboard] Recent activity loaded successfully:", activityResponse.data);
        setRecentActivity(activityResponse.data);
      } else {
        console.error("❌ [Results Dashboard] Failed to load recent activity:", activityResponse.message);
      }
      
      console.log("✅ [Results Dashboard] Dashboard data loading complete");
    } catch (error) {
      console.error("❌ [Results Dashboard] Error loading dashboard data:", error);
      console.error("❌ [Results Dashboard] Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
    } finally {
      setLoading(false);
      console.log("🏁 [Results Dashboard] Loading state set to false");
    }
  };

  const handleClassClick = (classId: string) => {
    navigate(`/admin/results/entry?classId=${classId}`);
  };

  if (loading) {
    return (
      

        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      
    );
  }

  return (
    

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Results Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of results management with statistics
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/admin/results/entry")}>
              <FileText className="mr-2 h-4 w-4" />
              Enter Results
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/results/verification")}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Verify Results
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/results/report-cards")}>
              <FileTextIcon className="mr-2 h-4 w-4" />
              Report Cards
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin/results/annual-report-cards")}>
              <Award className="mr-2 h-4 w-4" />
              Annual Report Cards
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards
          totalStudents={statistics.totalStudents}
          totalResults={statistics.totalResults}
          pendingVerification={statistics.pendingVerification}
          completionPercentage={statistics.completionPercentage}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Class Entry Status */}
          <ClassEntryStatus
            classStatus={classStatus}
            onClassClick={handleClassClick}
          />

          {/* Recent Activity */}
          <RecentActivity activities={recentActivity} />
        </div>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/admin/results/entry")}
              >
                <FileText className="h-6 w-6" />
                <span>Enter Results</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/admin/results/verification")}
              >
                <CheckCircle className="h-6 w-6" />
                <span>Verify Results</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/admin/results/report-cards")}
              >
                <FileTextIcon className="h-6 w-6" />
                <span>View Report Cards</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => navigate("/admin/results/annual-report-cards")}
              >
                <Award className="h-6 w-6" />
                <span>Annual Report Cards</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
}