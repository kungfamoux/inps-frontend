import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Users,
  ChevronRight,
  User,
  MapPin,
  ArrowRight,
  BookOpen,
  Plus,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ClassDetails() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();

  const { data: classData, isLoading } = useQuery({
    queryKey: ['class', classId],
    queryFn: () => adminApi.getClassById(classId!),
    enabled: !!classId,
  });

  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => {
      console.log('[DEBUG ClassDetails] Fetching students for class:', classId);
      const result = adminApi.getStudentsByClass(classId!, {});
      console.log('[DEBUG ClassDetails] Students API result:', result);
      return result;
    },
    enabled: !!classId,
  });

  const { data: sessionData } = useQuery({
    queryKey: ['current-term'],
    queryFn: () => adminApi.getCurrentTerm(),
  });

  const { data: subjectsData, isLoading: subjectsLoading } = useQuery({
    queryKey: ['class-subjects', classId, sessionData?.data?.id],
    queryFn: () => adminApi.getSubjectsByClass(classId!, sessionData?.data?.id),
    enabled: !!classId && !!sessionData?.data?.id,
  });

  // Log the actual student data structure when it arrives
  if (studentsData?.data) {
    console.log(
      '[DEBUG ClassDetails] Student data structure sample:',
      studentsData.data[0],
    );
    console.log('[DEBUG ClassDetails] All student data:', studentsData.data);
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/classes')}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Class Details
              </h1>
              <p className="text-sm text-muted-foreground">
                Loading class information...
              </p>
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (!classData?.data) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/classes')}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">
                Class Details
              </h1>
              <p className="text-sm text-muted-foreground">Class not found</p>
            </div>
            <Button variant="outline" disabled>
              Bulk Transfer
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Class not found
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const cls = classData.data;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/classes')}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Class Details</h1>
            <p className="text-sm text-muted-foreground">
              {cls.className || cls.name}
            </p>
          </div>
          <Button
            className="gap-2"
            onClick={() => navigate(`/admin/classes/${classId}/bulk-transfer`)}
          >
            <ArrowRight className="size-4" /> Bulk Transfer
          </Button>
        </div>

        {/* Class Information */}
        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Class Name</p>
                <p className="font-medium text-lg">
                  {cls.className || cls.name}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Color</p>
                <p className="font-medium text-lg">{cls.color || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Room Number</p>
                <p className="font-medium text-lg">{cls.roomNumber || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={cls.status === 'ACTIVE' ? 'default' : 'secondary'}
                >
                  {cls.status}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Current Enrollment
                </p>
                <p className="font-medium text-lg">
                  {cls.currentEnrollment || 0}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Class Teacher</p>
                <p className="font-medium text-lg">
                  {cls.classTeacher
                    ? `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}`
                    : 'Not assigned'}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Assistant Teacher
                </p>
                <p className="font-medium text-lg">
                  {cls.assistantTeacher
                    ? `${cls.assistantTeacher.firstName} ${cls.assistantTeacher.lastName}`
                    : 'Not assigned'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Subjects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5" />
                Class Subjects
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/classes/${classId}/subjects`)}
                className="gap-2"
              >
                <Plus className="size-4" />
                Manage Subjects
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {subjectsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading subjects...
              </div>
            ) : subjectsData?.data && subjectsData.data.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject Name</TableHead>
                      <TableHead>Subject Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectsData.data.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.subject?.subjectName ||
                            item.subjectName ||
                            'N/A'}
                        </TableCell>
                        <TableCell>
                          {item.subject?.subjectCode ||
                            item.subjectCode ||
                            'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === 'ACTIVE' ? 'default' : 'secondary'
                            }
                          >
                            {item.status || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(
                                `/admin/subjects/${item.subject?.id || item.id}`,
                              )
                            }
                          >
                            <Eye className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No subjects assigned to this class for the current term
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/classes/${classId}/subjects`)}
                  className="gap-2"
                >
                  <Plus className="size-4" />
                  Add Subjects
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Class Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading students...
              </div>
            ) : studentsError ? (
              <div className="text-center py-8 text-destructive">
                Failed to load students: {studentsError.message}
              </div>
            ) : studentsData?.data && studentsData.data.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Admission Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsData.data.map((enrollment: any) => {
                      const student = enrollment.student || enrollment;
                      return (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">
                            {student.firstName || ''} {student.lastName || ''}
                          </TableCell>
                          <TableCell>
                            {student.admissionNumber || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                student.status === 'ACTIVE'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {student.status || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                navigate(
                                  `/admin/students/${student.admissionNumber}`,
                                )
                              }
                            >
                              <Eye className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No students found in this class
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
