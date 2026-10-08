import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/contexts/session-context';
import { apiClient } from '@/lib/api/client';
import { adminApi } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Calendar, CheckCircle, GraduationCap } from 'lucide-react';

interface PendingTasksResponse {
  success: boolean;
  data: {
    class?: string;
    section?: string;
    role: string;
    tasks: Array<{ type: string; message: string; priority: string }>;
    total: number;
  };
}

interface ClassSubjectsResponse {
  success: boolean;
  data: Array<{
    id: string;
    subjectId: string;
    subject: {
      id: string;
      subjectName: string;
      subjectCode: string;
    };
  }>;
}

export default function TeacherDashboard() {
  const { currentSession, currentTerm } = useSession();
  
  const { data: pendingTasks, isLoading: pendingLoading } = useQuery<PendingTasksResponse>({
    queryKey: ['teacher-dashboard-stats'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<PendingTasksResponse>('/api/teacher/students/pending-tasks');
        return response;
      } catch (error) {
        return {
          success: true,
          data: {
            class: null,
            section: null,
            role: 'TEACHER',
            tasks: [],
            total: 0,
          },
        };
      }
    },
  });

  // First get class ID from pending tasks, then fetch class subjects
  const { data: classSubjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['teacher-class-subjects', pendingTasks?.data?.class, currentTerm],
    queryFn: async () => {
      if (!pendingTasks?.data?.class || !currentTerm) {
        return { success: true, data: [] };
      }
      try {
        // Get class ID by class name
        const classResponse = await apiClient.get<any>(`/api/admin/classes`);
        const classData = classResponse.data.find((c: any) => c.name === pendingTasks.data.class);
        
        if (!classData) {
          return { success: true, data: [] };
        }
        
        const response = await apiClient.get<any>(`/api/admin/subjects/classes/${classData.id}/subjects`, {
          termId: currentTerm.id,
        });
        return response;
      } catch (error) {
        return {
          success: true,
          data: [],
        };
      }
    },
    enabled: !!pendingTasks?.data?.class && !!currentTerm,
  });

  const className = pendingTasks?.data?.class || pendingTasks?.data?.section || 'Not assigned';
  const totalSubjects = classSubjects?.data?.length || 0;
  const pendingTasksCount = pendingTasks?.data?.total || 0;

  if (pendingLoading || subjectsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's an overview of your class.</p>
      </div>

      {/* Class Information Card */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            My Class
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{className}</div>
          <p className="text-sm text-primary-foreground/70">Assigned class</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Students in class</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubjects}</div>
            <p className="text-xs text-muted-foreground">Subjects assigned to class</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasksCount}</div>
            <p className="text-xs text-muted-foreground">Tasks to complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">This term</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Mark Attendance</div>
              <div className="text-sm text-muted-foreground">Record daily attendance for your class</div>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">Enter Results</div>
              <div className="text-sm text-muted-foreground">Upload student assessment results</div>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-accent transition-colors">
              <div className="font-medium">View Schedule</div>
              <div className="text-sm text-muted-foreground">Check your teaching schedule</div>
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            {totalSubjects === 0 ? (
              <div className="text-sm text-muted-foreground">
                No subjects assigned to this class yet.
              </div>
            ) : (
              <div className="space-y-2">
                {classSubjects?.data?.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between px-3 py-2 rounded-lg border">
                    <div>
                      <div className="font-medium">{assignment.subject?.subjectName || 'Unknown Subject'}</div>
                      <div className="text-xs text-muted-foreground">{assignment.subject?.subjectCode || ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
