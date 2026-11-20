import { GraduationCap, UsersRound, BookOpenCheck, RefreshCw, Cake, Calendar, BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Skeleton } from "@/components/ui/skeleton";
import { StaffRole } from "@/lib/types/common";

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => adminApi.getDashboardStats(),
    enabled: !!user && 'role' in user && (user.role === StaffRole.ADMIN || user.role === StaffRole.HEAD_TEACHER),
  });

  const { data: birthdays, isLoading: birthdaysLoading } = useQuery({
    queryKey: ["upcomingBirthdays"],
    queryFn: () => adminApi.getUpcomingBirthdays(),
    enabled: !!user && 'role' in user && (user.role === StaffRole.ADMIN || user.role === StaffRole.HEAD_TEACHER),
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["upcomingEvents"],
    queryFn: () => adminApi.getUpcomingEvents(),
    enabled: !!user && 'role' in user && (user.role === StaffRole.ADMIN || user.role === StaffRole.HEAD_TEACHER),
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    queryClient.invalidateQueries({ queryKey: ["upcomingBirthdays"] });
    queryClient.invalidateQueries({ queryKey: ["upcomingEvents"] });
  };

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
      icon: GraduationCap,
      tone: "bg-blue-50 text-blue-700"
    },
    {
      label: "Total staff",
      value: stats.data.totalStaff.toLocaleString(),
      icon: UsersRound,
      tone: "bg-violet-50 text-violet-700"
    },
    {
      label: "Active enrollments",
      value: stats.data.activeEnrollments.toLocaleString(),
      icon: BookOpenCheck,
      tone: "bg-teal-50 text-teal-700"
    },
  ] : [];

  const enrollmentData = stats?.data?.classStats?.map((classItem) => ({
    name: classItem.name,
    students: classItem.studentCount,
  })) || [];

  // Color palette for chart bars
  const barColors = [
    'url(#gradient1)',
    'url(#gradient2)',
    'url(#gradient3)',
    'url(#gradient4)',
    'url(#gradient5)',
    'url(#gradient6)',
    'url(#gradient7)',
    'url(#gradient8)',
  ];

  return (
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
            onClick={handleRefresh}
            disabled={isLoading || birthdaysLoading || eventsLoading}
            className="gap-2"
          >
            <RefreshCw className={`size-4 ${isLoading || birthdaysLoading || eventsLoading ? 'animate-spin' : ''}`} />
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
            {overview.map(({ label, value, icon: Icon, tone }) => (
              <Card key={label} className="rounded-2xl border-border/80 shadow-md transition-transform duration-200 hover:-translate-y-0.5">
                <CardContent className="flex items-start justify-between p-5">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
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
          <Card className="rounded-2xl shadow-md">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">Enrollment by class</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Active students in the current term</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600">
                <BarChart3 className="size-5" />
              </div>
            </CardHeader>
            <CardContent className="h-[300px] pt-5">
              {isLoading ? (
                <Skeleton className="h-full w-full" />
              ) : enrollmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentData} barSize={32} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="gradient3" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="gradient4" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="gradient5" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="gradient6" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="gradient7" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="gradient8" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#84cc16" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#84cc16" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#E2E8F0" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
                      dx={-10}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                      itemStyle={{ color: "#64748B" }}
                    />
                    <Bar dataKey="students" radius={[8, 8, 0, 0]}>
                      {enrollmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                  <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-400">
                    <BarChart3 className="size-8" />
                  </div>
                  <p className="text-sm font-medium">No enrollment data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-1">
          <Card className="rounded-2xl shadow-md">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">Upcoming birthdays</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Next 5 student birthdays in the next 30 days</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600">
                <Cake className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              {birthdaysLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : birthdays?.data && birthdays.data.length > 0 ? (
                <div className="space-y-3">
                  {birthdays.data.map((birthday) => {
                    const isToday = birthday.daysUntilBirthday === 0;
                    const isSoon = birthday.daysUntilBirthday <= 3 && birthday.daysUntilBirthday > 0;
                    const badgeGradient = isToday
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/20'
                      : isSoon
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700';

                    return (
                      <div
                        key={birthday.studentId}
                        className="group flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-gradient-to-r from-pink-50/50 to-purple-50/50 p-4 transition-all hover:shadow-md hover:border-pink-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-lg shadow-pink-500/20">
                              <Cake className="size-6" />
                            </div>
                            {isToday && (
                              <div className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-white">
                                <div className="size-2 rounded-full bg-white animate-pulse" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground group-hover:text-pink-600 transition-colors">
                              {birthday.firstName} {birthday.middleName && `${birthday.middleName} `}{birthday.lastName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium text-muted-foreground">
                                {birthday.class || 'Not enrolled'}
                              </span>
                              <span className="text-xs text-muted-foreground/50">•</span>
                              <span className="text-xs text-muted-foreground">
                                {birthday.admissionNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeGradient}`}>
                            {isToday ? '🎉 Today!' : isSoon ? `In ${birthday.daysUntilBirthday} days` : `${birthday.daysUntilBirthday} days`}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium">
                            {birthday.birthdayDate}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-[200px] flex-col items-center justify-center gap-3 text-muted-foreground">
                  <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 text-pink-400">
                    <Cake className="size-8" />
                  </div>
                  <p className="text-sm font-medium">No upcoming birthdays in the next 30 days</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-1">
          <Card className="rounded-2xl shadow-md">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">Calendar</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Upcoming events, holidays, and important dates</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600">
                <Calendar className="size-5" />
              </div>
            </CardHeader>
            <CardContent>
              {eventsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : events?.data && events.data.length > 0 ? (
                <div className="space-y-3">
                  {events.data.map((event) => {
                    const startDate = new Date(event.startDate);
                    const endDate = new Date(event.endDate);
                    const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const isHoliday = event.type === 'HOLIDAY';
                    const iconGradient = isHoliday ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20' : 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-lg shadow-blue-500/20';
                    const cardGradient = isHoliday ? 'from-amber-50/50 to-orange-50/50 hover:border-amber-200' : 'from-blue-50/50 to-cyan-50/50 hover:border-blue-200';
                    const badgeGradient = isHoliday ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20' : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20';

                    return (
                      <div
                        key={event.id}
                        className="group flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-gradient-to-r p-4 transition-all hover:shadow-md hover:border-blue-200"
                        style={{ background: `linear-gradient(to right, ${isHoliday ? 'rgba(251, 191, 36, 0.1)' : 'rgba(59, 130, 246, 0.1)'}, ${isHoliday ? 'rgba(251, 146, 60, 0.1)' : 'rgba(6, 182, 212, 0.1)'})` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`grid size-12 place-items-center rounded-xl ${iconGradient}`}>
                            <Calendar className="size-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                              {event.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-medium text-muted-foreground">
                                {isHoliday ? 'Holiday' : 'Event'}
                              </span>
                              <span className="text-xs text-muted-foreground/50">•</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(startDate)}
                                {endDate > startDate && ` - ${formatDate(endDate)}`}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeGradient}`}>
                            {isHoliday ? 'Holiday' : 'Event'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-[200px] flex-col items-center justify-center gap-3 text-muted-foreground">
                  <div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-400">
                    <Calendar className="size-8" />
                  </div>
                  <p className="text-sm font-medium">No upcoming events or holidays in the next 30 days</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
  );
}
