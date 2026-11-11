import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill, ClipboardList, FileImage, Clock } from "lucide-react";
import { healthApi } from "@/lib/api/health";
import { DrugRequest, SickbayVisit } from "@/lib/api/health";

export default function Dashboard() {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    todayVisits: 0,
    totalRequests: 0,
    totalVisits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [requestsRes, visitsRes] = await Promise.all([
        healthApi.getDrugRequests(),
        healthApi.getSickbayVisits(),
      ]);

      if (requestsRes.success && requestsRes.data) {
        const pending = requestsRes.data.filter((r) => r.status === "PENDING").length;
        setStats((prev) => ({
          ...prev,
          pendingRequests: pending,
          totalRequests: requestsRes.data.length,
        }));
      }

      if (visitsRes.success && visitsRes.data) {
        const today = new Date().toDateString();
        const todayVisits = visitsRes.data.filter(
          (v) => new Date(v.visitDate).toDateString() === today
        ).length;
        setStats((prev) => ({
          ...prev,
          todayVisits,
          totalVisits: visitsRes.data.length,
        }));
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Health Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of sickbay activities and drug requests
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Requests
              </CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">
                Drug requests awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Visits
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayVisits}</div>
              <p className="text-xs text-muted-foreground">
                Sickbay visits today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">
                All drug requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Visits
              </CardTitle>
              <FileImage className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVisits}</div>
              <p className="text-xs text-muted-foreground">
                All sickbay visits
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/health/drug-requests"
              className="block rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <Pill className="h-5 w-5" />
                <div>
                  <div className="font-medium">New Drug Request</div>
                  <div className="text-sm text-muted-foreground">
                    Submit a drug request
                  </div>
                </div>
              </div>
            </a>
            <a
              href="/health/sickbay-visits"
              className="block rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="h-5 w-5" />
                <div>
                  <div className="font-medium">Record Visit</div>
                  <div className="text-sm text-muted-foreground">
                    Document a sickbay visit
                  </div>
                </div>
              </div>
            </a>
            <a
              href="/health/daily-log"
              className="block rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileImage className="h-5 w-5" />
                <div>
                  <div className="font-medium">Daily Log</div>
                  <div className="text-sm text-muted-foreground">
                    Upload daily visitor log
                  </div>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              No recent activity to display.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
