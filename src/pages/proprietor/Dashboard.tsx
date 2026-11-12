import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, UsersRound, GraduationCap, TrendingUp, ArrowRight, TrendingDown, Activity } from "lucide-react";
import { proprietorApi } from "@/lib/api/proprietor";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-muted-foreground">Failed to load dashboard</div>;
  }

  const enrollmentData = stats.enrollment?.byClass?.map((item: any) => ({
    name: item.className,
    value: item.count,
  })) || [];

  const financialData = [
    { name: 'Income', value: stats.finance?.totalIncome || 0 },
    { name: 'Expenses', value: stats.finance?.totalExpenses || 0 },
    { name: 'Balance', value: stats.finance?.netBalance || 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's an overview of your school's performance.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-100">Total Students</CardTitle>
            <GraduationCap className="h-5 w-5 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.enrollment?.totalStudents || 0}</div>
            <p className="text-xs text-blue-100 mt-1">
              {stats.enrollment?.activeEnrollments || 0} active enrollments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-emerald-100">Total Staff</CardTitle>
            <UsersRound className="h-5 w-5 text-emerald-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.staff?.totalStaff || 0}</div>
            <p className="text-xs text-emerald-100 mt-1">
              {stats.staff?.teachingStaff || 0} teaching staff
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-100">Total Income</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₦{(stats.finance?.totalIncome || 0).toLocaleString()}
            </div>
            <p className="text-xs text-purple-100 mt-1">
              Net: ₦{(stats.finance?.netBalance || 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-100">Total Classes</CardTitle>
            <Activity className="h-5 w-5 text-orange-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.enrollment?.totalClasses || 0}</div>
            <p className="text-xs text-orange-100 mt-1">
              Across all levels
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-xl">Enrollment by Class</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-xl">Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={financialData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link to="/proprietor/financial-analytics">
            <div className="flex items-center justify-between p-4 rounded-xl border-2 hover:bg-accent hover:border-primary transition-all duration-200 group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="font-medium">View Financial Analytics</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
          <Link to="/proprietor/staff">
            <div className="flex items-center justify-between p-4 rounded-xl border-2 hover:bg-accent hover:border-primary transition-all duration-200 group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <UsersRound className="h-5 w-5" />
                </div>
                <span className="font-medium">View Staff Overview</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
          <Link to="/proprietor/students/enrollment">
            <div className="flex items-center justify-between p-4 rounded-xl border-2 hover:bg-accent hover:border-primary transition-all duration-200 group cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="font-medium">View Enrollment Statistics</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-2">
        <CardHeader>
          <CardTitle className="text-xl">School Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium text-muted-foreground">Academic Year</p>
            <p className="text-lg font-semibold mt-1">{stats.school?.academicYear || "Not set"}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-sm font-medium text-muted-foreground">Current Term</p>
            <p className="text-lg font-semibold mt-1">{stats.school?.currentTerm || "Not set"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
