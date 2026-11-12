import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { proprietorApi } from "@/lib/api/proprietor";
import { GraduationCap, TrendingUp, BookOpen, Award } from "lucide-react";

export default function AcademicPerformance() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const res = await proprietorApi.getAcademicPerformanceMetrics();
      if (res.success && res.data) {
        setMetrics(res.data);
      }
    } catch (error) {
      console.error("Failed to load academic performance metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-muted-foreground">Failed to load metrics</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Academic Performance
        </h1>
        <p className="text-muted-foreground mt-2">
          Overall school performance metrics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-100 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalStudents || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-100 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Total Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalClasses || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Class Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.averageClassSize || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Award className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="p-6 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-muted-foreground mb-2">Student-to-Teacher Ratio</p>
              <p className="text-3xl font-bold text-primary">
                {metrics.averageClassSize || 0}:1
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Average students per class
              </p>
            </div>
            <div className="p-6 rounded-lg bg-muted/50">
              <p className="text-sm font-medium text-muted-foreground mb-2">Total Class Sections</p>
              <p className="text-3xl font-bold text-primary">
                {metrics.totalClasses || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Active class sections
              </p>
            </div>
          </div>
          <div className="mt-6 p-6 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ℹ️ Detailed academic performance metrics (pass/fail rates, subject performance, class rankings) will be available once result data is integrated with the system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
