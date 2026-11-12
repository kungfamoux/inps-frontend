import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { proprietorApi } from "@/lib/api/proprietor";

export default function StaffStatistics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await proprietorApi.getStaffStatistics();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Failed to load staff statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!stats) {
    return <div className="text-muted-foreground">Failed to load statistics</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Statistics</h1>
        <p className="text-muted-foreground">
          Staff count by role and department
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teaching Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachingStaff || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Non-Teaching Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nonTeachingStaff || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff by Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.byRole?.length > 0 ? (
              stats.byRole.map((item: any) => (
                <div key={item.role} className="flex justify-between text-sm p-2 rounded border">
                  <span>{item.role}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No role data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Staff by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.byDepartment?.length > 0 ? (
              stats.byDepartment.map((item: any) => (
                <div key={item.department} className="flex justify-between text-sm p-2 rounded border">
                  <span>{item.department}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No department data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
