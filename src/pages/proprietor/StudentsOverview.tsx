import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { proprietorApi } from "@/lib/api/proprietor";

export default function StudentsOverview() {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      const res = await proprietorApi.getStudentEnrollmentOverview();
      if (res.success && res.data) {
        setOverview(res.data);
      }
    } catch (error) {
      console.error("Failed to load enrollment overview:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!overview) {
    return <div className="text-muted-foreground">Failed to load enrollment data</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students Overview</h1>
        <p className="text-muted-foreground">
          Enrollment statistics by session, term, and class
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.enrollment?.totalStudents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.enrollment?.activeEnrollments || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.enrollment?.totalClasses || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment by Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {overview.enrollment?.byClass?.length > 0 ? (
              overview.enrollment.byClass.map((item: any) => (
                <div key={item.className} className="flex justify-between text-sm p-2 rounded border">
                  <span>{item.className}</span>
                  <span className="font-medium">{item.count} students</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No class data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment by Session</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {overview.enrollment?.bySession?.length > 0 ? (
              overview.enrollment.bySession.map((item: any) => (
                <div key={item.session} className="flex justify-between text-sm p-2 rounded border">
                  <span>{item.session}</span>
                  <span className="font-medium">{item.count} students</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No session data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
