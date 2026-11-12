import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, UsersRound, GraduationCap, TrendingUp, ArrowRight } from "lucide-react";
import { proprietorApi } from "@/lib/api/proprietor";

export default function ProprietorDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const res = await proprietorApi.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!stats) {
    return <div className="text-muted-foreground">Failed to load dashboard</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of school operations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrollment?.totalStudents || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.enrollment?.activeEnrollments || 0} active enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <UsersRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.staff?.totalStaff || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.staff?.teachingStaff || 0} teaching staff
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{stats.finance?.totalIncome?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Net: ₦{stats.finance?.netBalance?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrollment?.totalClasses || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all levels
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/proprietor/financial-analytics">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors">
                <span>View Financial Analytics</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
            <Link to="/proprietor/staff">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors">
                <span>View Staff Overview</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
            <Link to="/proprietor/students/enrollment">
              <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent hover:text-accent-foreground transition-colors">
                <span>View Enrollment Statistics</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>School Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Academic Year:</span>{" "}
              {stats.school?.academicYear || "Not set"}
            </p>
            <p>
              <span className="font-medium">Current Term:</span>{" "}
              {stats.school?.currentTerm || "Not set"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
