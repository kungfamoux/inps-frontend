import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/contexts/session-context';
import { apiClient } from '@/lib/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { AttendanceForm } from '@/components/teacher/AttendanceForm';
import { AttendanceView } from '@/components/teacher/AttendanceView';
import { AttendanceSummary } from '@/components/teacher/AttendanceSummary';
import { AttendanceStatus, AttendanceRecord, AttendanceResponse, AttendanceSummaryResponse } from '@/types/attendance';
import { toast } from 'sonner';

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
}

interface StudentsResponse {
  success: boolean;
  class?: { id: string; name: string };
  section?: { id: string; name: string };
  role: string;
  data: Student[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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

export default function TeacherAttendance() {
  const queryClient = useQueryClient();
  const { currentTerm } = useSession();
  
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [showSummary, setShowSummary] = useState(false);

  // Get teacher's class
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

  // Get students in teacher's class
  const { data: studentsResponse, isLoading: studentsLoading } = useQuery<StudentsResponse>({
    queryKey: ['teacher-students'],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: '1',
          limit: '1000', // Get all students for attendance
        });
        const res = await apiClient.get<StudentsResponse>(`/api/teacher/students?${params.toString()}`);
        return res;
      } catch (error) {
        return {
          success: true,
          class: null,
          section: null,
          role: 'TEACHER',
          data: [],
          meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
        };
      }
    },
  });

  // Check existing attendance for selected date
  const { data: attendanceData, isLoading: attendanceLoading, refetch: refetchAttendance } = useQuery<AttendanceResponse>({
    queryKey: ['teacher-attendance', selectedDate],
    queryFn: async () => {
      try {
        const res = await apiClient.get<AttendanceResponse>(`/api/teacher/students/attendance?date=${selectedDate}`);
        return res;
      } catch (error) {
        // Return empty response if no attendance exists
        return {
          date: selectedDate,
          class: pendingTasks?.data?.class || '',
          section: pendingTasks?.data?.section || '',
          role: 'TEACHER',
          records: [],
        };
      }
    },
    enabled: !!selectedDate,
  });

  // Get attendance summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery<AttendanceSummaryResponse>({
    queryKey: ['teacher-attendance-summary', selectedDate],
    queryFn: async () => {
      try {
        const res = await apiClient.get<AttendanceSummaryResponse>(
          `/api/teacher/students/attendance/summary?startDate=${selectedDate}&endDate=${selectedDate}`
        );
        return res;
      } catch (error) {
        return {
          class: pendingTasks?.data?.class || '',
          section: pendingTasks?.data?.section || '',
          role: 'TEACHER',
          summary: {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            presentPercentage: 0,
            absentPercentage: 0,
            latePercentage: 0,
            excusedPercentage: 0,
          },
        };
      }
    },
    enabled: showSummary && !!selectedDate,
  });

  // Submit attendance mutation
  const submitAttendanceMutation = useMutation({
    mutationFn: async (records: AttendanceRecord[]): Promise<void> => {
      const payload = {
        date: selectedDate,
        records,
      };
      await apiClient.post('/api/teacher/students/attendance', payload);
    },
    onSuccess: () => {
      toast.success('Attendance marked successfully');
      refetchAttendance();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark attendance');
    },
  });

  const handleDateChange = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate);
    if (direction === 'prev') {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() + 1);
    }
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(getTodayDate());
  };

  const students = studentsResponse?.data || [];
  const className = pendingTasks?.data?.class || pendingTasks?.data?.section || 'Not assigned';
  const hasAttendance = attendanceData?.records && attendanceData.records.length > 0;
  const isLoading = studentsLoading || attendanceLoading;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground mt-2">
          Mark and manage student attendance for <span className="font-semibold text-foreground">{className}</span>.
        </p>
      </div>

      {/* Header with date navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => handleDateChange('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => handleDateChange('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchAttendance()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant={showSummary ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowSummary(!showSummary)}
              >
                {showSummary ? 'Hide Summary' : 'Show Summary'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* No students warning */}
      {students.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <AlertCircle className="h-5 w-5" />
              <span>No students enrolled in this class yet.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendance Summary */}
      {showSummary && summaryData && (
        <AttendanceSummary summary={summaryData.summary} />
      )}

      {/* Attendance Form or View */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">Loading...</div>
          </CardContent>
        </Card>
      ) : hasAttendance ? (
        <AttendanceView data={attendanceData.records} date={selectedDate} />
      ) : (
        <AttendanceForm
          students={students}
          date={selectedDate}
          onSubmit={submitAttendanceMutation.mutateAsync}
          isSubmitting={submitAttendanceMutation.isPending}
        />
      )}
    </div>
  );
}
