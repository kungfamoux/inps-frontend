import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/contexts/session-context';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2 } from 'lucide-react';

interface SubjectAssignment {
  id: string;
  subjectId: string;
  subject: {
    id: string;
    subjectName: string;
    subjectCode: string;
  };
}

interface ClassData {
  id: string;
  name: string;
}

interface PendingTasksResponse {
  success: boolean;
  data: {
    class?: string | null;
    section?: string | null;
    role: string;
    tasks: Array<{ type: string; message: string; priority: string }>;
    total: number;
  };
}

interface SubjectsResponse {
  success: boolean;
  data: SubjectAssignment[];
}

export default function TeacherSubjects() {
  const { currentTerm } = useSession();
  
  // Get teacher's class from pending tasks
  const { data: pendingTasks } = useQuery<PendingTasksResponse>({
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

  // Get class ID by class name
  const { data: classData, isLoading: classLoading } = useQuery<ClassData | null>({
    queryKey: ['teacher-class-id', pendingTasks?.data?.class],
    queryFn: async () => {
      if (!pendingTasks?.data?.class) {
        return null;
      }
      try {
        const response = await apiClient.get<{ data: ClassData[] }>('/api/admin/classes');
        const classInfo = response.data.find((c: ClassData) => c.name === pendingTasks.data.class);
        return classInfo || null;
      } catch (error) {
        return null;
      }
    },
    enabled: !!pendingTasks?.data?.class,
  });

  // Get subjects assigned to the class
  const { data: classSubjects, isLoading: subjectsLoading } = useQuery<SubjectsResponse>({
    queryKey: ['teacher-class-subjects', classData?.id, currentTerm],
    queryFn: async () => {
      if (!classData?.id || !currentTerm) {
        return { success: true, data: [] };
      }
      try {
        const response = await apiClient.get<SubjectsResponse>(`/api/admin/subjects/classes/${classData.id}/subjects`, {
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
    enabled: !!classData?.id && !!currentTerm,
  });

  const className = pendingTasks?.data?.class || pendingTasks?.data?.section || 'Not assigned';
  const isLoading = classLoading || subjectsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Class Subjects</h1>
        <p className="text-muted-foreground mt-2">
          View subjects assigned to <span className="font-semibold text-foreground">{className}</span>.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Subjects for {className}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {classSubjects?.data?.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No subjects assigned to this class yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classSubjects?.data?.map((assignment: SubjectAssignment) => (
                  <Card key={assignment.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="font-semibold text-lg">{assignment.subject?.subjectName || 'Unknown Subject'}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {assignment.subject?.subjectCode || 'N/A'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
