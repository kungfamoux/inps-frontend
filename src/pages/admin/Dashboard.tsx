import { GraduationCap, UsersRound, BookOpenCheck, TrendingUp, RefreshCw, Cake } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { StaffRole } from "@/lib/types/common";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => adminApi.getDashboardStats(),
    enabled: !!user && 'role' in user && (user.role === StaffRole.ADMIN || user.role === StaffRole.HEAD_TEACHER),
  });

  const { data: birthdays, isLoading: birthdaysLoading } = useQuery({
    queryKey: ["upcomingBirthdays"],
    queryFn: () => adminApi.getUpcomingBirthdays(),
    enabled: !!user && 'role' in user && (user.role === StaffRole.ADMIN || user.role === StaffRole.HEAD_TEACHER),
  });

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const userGreeting = user?.firstName || "Admin";

  const overview = stats?.data ? [
    {
      label: "Total students",
      value: stats.data.totalStudents.toLocaleString(),
      note: `${stats.data.teachingStaff} teaching staff`,
      icon: GraduationCap,
      tone: "bg-blue-50 text-blue-700"
    },
    {
      label: "Total staff",
      value: stats.data.totalStaff.toLocaleString(),
      note: `${stats.data.teachingStaff} teaching staff`,
      icon: UsersRound,
      tone: "bg-violet-50 text-violet-700"
    },
    {
      label: "Active enrollments",
      value: stats.data.activeEnrollments.toLocaleString(),
      note: `${Math.round((stats.data.activeEnrollments / stats.data.totalStudents) * 100)}% of students`,
      icon: BookOpenCheck,
      tone: "bg-teal-50 text-teal-700"
    },
  ] : [];

  const enrollmentData = stats?.data?.classStats?.map((classItem) => ({
    name: classItem.name,
    students: classItem.studentCount,
  })) || [];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-7">
        <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-1 text-sm font-semibold text-accent">{currentDate}</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Good morning, {userGreeting}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Here is today's overview of the INPS school community.</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </section>

        {isLoading ? (
          <section aria-label="School overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-2xl border-border/80 shadow-sm">
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </section>
        ) : error ? (
          <Card className="rounded-2xl border-destructive/50 bg-destructive/5">
            <CardContent className="p-5">
              <p className="text-sm text-destructive">Failed to load dashboard statistics. Please try again later.</p>
            </CardContent>
          </Card>
        ) : (
          <section aria-label="School overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overview.map(({ label, value, note, icon: Icon, tone }) => (
              <Card key={label} className="rounded-2xl border-border/80 shadow-sm transition-transform duration-200 hover:-translate-y-0.5">
                <CardContent className="flex items-start justify-between p-5">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
                    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <TrendingUp className="size-3.5 text-accent" /> {note}
                    </p>
                  </div>
                  <div className={`grid size-11 place-items-center rounded-xl ${tone}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        <section className="grid gap-5 xl:grid-cols-1">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">Enrollment by class</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Active students in the current term</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">View report</Button>
            </CardHeader>
            <CardContent className="h-[300px] pt-5">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : enrollmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData} barSize={24}>
                    <CartesianGrid vertical={false} stroke="#E8EDF0" strokeDasharray="4 4" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                    <Tooltip cursor={{ fill: "#F4F7F8" }} contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0" }} />
                    <Bar dataKey="students" fill="#2C3E50" radius={[7, 7, 2, 2]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No enrollment data available
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-1">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">Upcoming birthdays</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Next 5 student birthdays in the next 30 days</p>
              </div>
              <Cake className="size-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {birthdaysLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : birthdays?.data && birthdays.data.length > 0 ? (
                <div className="space-y-3">
                  {birthdays.data.map((birthday) => (
                    <div key={birthday.studentId} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600">
                          <Cake className="size-5" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {birthday.firstName} {birthday.middleName && `${birthday.middleName} `}{birthday.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {birthday.class || 'Not enrolled'} • {birthday.admissionNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {birthday.birthdayDate}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {birthday.daysUntilBirthday === 0 ? 'Today!' : `In ${birthday.daysUntilBirthday} days`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                  No upcoming birthdays in the next 30 days
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </AdminLayout>
  );
}
