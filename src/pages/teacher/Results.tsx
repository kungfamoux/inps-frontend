import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/contexts/session-context';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Upload, Eye, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

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

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName;
  result: {
    id: string;
    ca1Score: number;
    ca2Score: number;
    examScore: number;
    total: number;
    grade: string;
  } | null;
}

interface StudentsWithResultsResponse {
  success: boolean;
  data: Student[];
}

type ViewMode = 'list' | 'upload' | 'view';

export default function TeacherResults() {
  const queryClient = useQueryClient();
  const { currentTerm } = useSession();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSubject, setSelectedSubject] = useState<SubjectAssignment | null>(null);
  
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

  // Get students with results for selected subject
  const { data: studentsWithResults, isLoading: studentsLoading, refetch: refetchStudents } = useQuery<StudentsWithResultsResponse>({
    queryKey: ['teacher-students-results', classData?.id, selectedSubject?.subjectId, currentTerm],
    queryFn: async () => {
      if (!classData?.id || !selectedSubject?.subjectId || !currentTerm) {
        return { success: true, data: [] };
      }
      try {
        const response = await apiClient.get<StudentsWithResultsResponse>(
          `/api/teacher/results/class/${classData.id}/subject/${selectedSubject.subjectId}/students`,
          {
            termId: currentTerm.id,
            sessionId: currentTerm.sessionId,
          }
        );
        return response;
      } catch (error) {
        return {
          success: true,
          data: [],
        };
      }
    },
    enabled: !!classData?.id && !!selectedSubject?.subjectId && !!currentTerm && viewMode !== 'list',
  });

  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: async (records: Array<{ studentId: string; ca1Score: number; ca2Score: number; examScore: number }>) => {
      const payload = {
        classId: classData!.id,
        subjectId: selectedSubject!.subjectId,
        termId: currentTerm!.id,
        sessionId: currentTerm!.sessionId,
        records,
      };
      await apiClient.post('/api/teacher/results/bulk', payload);
    },
    onSuccess: () => {
      toast.success('Results uploaded successfully');
      refetchStudents();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload results');
    },
  });

  const handleUploadClick = (subject: SubjectAssignment) => {
    setSelectedSubject(subject);
    setViewMode('upload');
  };

  const handleViewClick = (subject: SubjectAssignment) => {
    setSelectedSubject(subject);
    setViewMode('view');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedSubject(null);
  };

  const handleBulkUpload = () => {
    const students = studentsWithResults?.data || [];
    const records = students.map((student) => {
      const ca1Input = document.getElementById(`ca1-${student.id}`) as HTMLInputElement;
      const ca2Input = document.getElementById(`ca2-${student.id}`) as HTMLInputElement;
      const examInput = document.getElementById(`exam-${student.id}`) as HTMLInputElement;
      
      return {
        studentId: student.id,
        ca1Score: Number(ca1Input?.value) || 0,
        ca2Score: Number(ca2Input?.value) || 0,
        examScore: Number(examInput?.value) || 0,
      };
    });

    bulkUploadMutation.mutate(records);
  };

  const className = pendingTasks?.data?.class || pendingTasks?.data?.section || 'Not assigned';
  const subjects = classSubjects?.data || [];
  const isLoading = classLoading || subjectsLoading;

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Results Management</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage student assessment results for <span className="font-semibold text-foreground">{className}</span>.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No subjects assigned to this class yet. Contact the administrator.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {subjects.map((assignment) => (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {assignment.subject?.subjectName || 'Unknown Subject'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{assignment.subject?.subjectCode || 'N/A'}</p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={() => handleUploadClick(assignment)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Results
                      </Button>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleViewClick(assignment)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const students = studentsWithResults?.data || [];
  const isUploadMode = viewMode === 'upload';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isUploadMode ? 'Upload Results' : 'View Results'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {selectedSubject?.subject?.subjectName} ({selectedSubject?.subject?.subjectCode}) - {className}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Results</CardTitle>
        </CardHeader>
        <CardContent>
          {studentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students enrolled in this class.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Admission No.</th>
                    <th className="text-left p-2">Student Name</th>
                    {isUploadMode ? (
                      <>
                        <th className="text-center p-2">CA1 (30)</th>
                        <th className="text-center p-2">CA2 (30)</th>
                        <th className="text-center p-2">Exam (40)</th>
                      </>
                    ) : (
                      <>
                        <th className="text-center p-2">CA1</th>
                        <th className="text-center p-2">CA2</th>
                        <th className="text-center p-2">Exam</th>
                        <th className="text-center p-2">Total</th>
                        <th className="text-center p-2">Grade</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="border-b">
                      <td className="p-2">{student.admissionNumber}</td>
                      <td className="p-2">{student.firstName} {student.lastName}</td>
                      {isUploadMode ? (
                        <>
                          <td className="p-2">
                            <Input
                              id={`ca1-${student.id}`}
                              type="number"
                              min="0"
                              max="30"
                              defaultValue={student.result?.ca1Score || 0}
                              className="w-20 mx-auto"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              id={`ca2-${student.id}`}
                              type="number"
                              min="0"
                              max="30"
                              defaultValue={student.result?.ca2Score || 0}
                              className="w-20 mx-auto"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              id={`exam-${student.id}`}
                              type="number"
                              min="0"
                              max="40"
                              defaultValue={student.result?.examScore || 0}
                              className="w-20 mx-auto"
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="text-center p-2">{student.result?.ca1Score || '-'}</td>
                          <td className="text-center p-2">{student.result?.ca2Score || '-'}</td>
                          <td className="text-center p-2">{student.result?.examScore || '-'}</td>
                          <td className="text-center p-2 font-semibold">{student.result?.total || '-'}</td>
                          <td className="text-center p-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              student.result?.grade === 'A' ? 'bg-green-100 text-green-800' :
                              student.result?.grade === 'C' ? 'bg-blue-100 text-blue-800' :
                              student.result?.grade === 'P' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {student.result?.grade || '-'}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {isUploadMode && (
            <div className="mt-4 flex justify-end">
              <Button 
                onClick={handleBulkUpload}
                disabled={bulkUploadMutation.isPending}
              >
                {bulkUploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Results
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
