import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EntityAvatar } from '@/components/admin/lists/EntityAvatar';
import { StatusDotBadge } from '@/components/admin/lists/StatusDotBadge';
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
  Download,
  GraduationCap,
  DoorOpen,
  UserCircle,
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

  const downloadClassListPDF = async () => {
    try {
      const pdfBlob = await adminApi.downloadClassListPDF(classId!, {
        academicYear: sessionData?.data?.session?.session || '2026/2027',
        term: sessionData?.data?.term || 'FIRST_TERM',
      });

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${classData?.data?.name?.replace(/\s+/g, '_')}_Class_List.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download class list PDF:', error);
    }
  };

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
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/classes')}
            className="rounded-xl"
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
        <Card className="shadow-md">
          <CardContent className="p-6">
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!classData?.data) {
    return (
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/classes')}
            className="rounded-xl"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Class Details
            </h1>
            <p className="text-sm text-muted-foreground">Class not found</p>
          </div>
          <Button variant="outline" disabled className="rounded-xl">
            Bulk Transfer
          </Button>
        </div>
        <Card className="shadow-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Class not found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cls = classData.data;

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/classes')}
            className="rounded-xl"
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

        {/* Profile Header Card */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
              <div className="flex-shrink-0">
                <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white">
                  {cls.className?.substring(0, 2).toUpperCase() || cls.name?.substring(0, 2).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {cls.className || cls.name}
                    </h2>
                    <p className="text-muted-foreground">{cls.level || 'Class Level'}</p>
                  </div>
                  <StatusDotBadge status={cls.status} />
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Students:</span>
                    <span className="font-medium">{cls.currentEnrollment || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DoorOpen className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Room:</span>
                    <span className="font-medium">{cls.roomNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Color:</span>
                    <span className="font-medium">{cls.color || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Teacher Information */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <UserCircle className="size-4" />
                </div>
                Teachers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Class Teacher</p>
                  <p className="font-semibold text-foreground">
                    {cls.classTeacher
                      ? `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}`
                      : 'Not assigned'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Assistant Teacher</p>
                  <p className="font-semibold text-foreground">
                    {cls.assistantTeacher
                      ? `${cls.assistantTeacher.firstName} ${cls.assistantTeacher.lastName}`
                      : 'Not assigned'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Class Information */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <GraduationCap className="size-4" />
                </div>
                Class Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Class Name</p>
                  <p className="font-semibold text-foreground">{cls.className || cls.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Color</p>
                  <p className="font-semibold text-foreground">{cls.color || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Room Number</p>
                  <p className="font-semibold text-foreground">{cls.roomNumber || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Class Students */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Users className="size-4" />
                </div>
                Class Students
                <Badge variant="secondary" className="ml-2 rounded-lg">
                  {studentsData?.data?.length || 0}
                </Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadClassListPDF}
                disabled={!studentsData?.data || studentsData.data.length === 0}
                className="gap-2 rounded-xl"
              >
                <Download className="size-4 mr-2" />
                Download Class List
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading students...
              </div>
            ) : studentsError ? (
              <div className="flex h-[200px] flex-col items-center justify-center gap-3 text-destructive">
                <div className="grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                  <Users className="size-8" />
                </div>
                <p className="text-sm font-medium">Failed to load students: {studentsError.message}</p>
              </div>
            ) : studentsData?.data && studentsData.data.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Student Name</TableHead>
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Admission Number</TableHead>
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      <TableHead className="h-12 text-right text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsData.data.map((enrollment: any, index: number) => {
                      const student = enrollment.student || enrollment;
                      return (
                        <TableRow key={enrollment.id || student?.id || student?.admissionNumber || `student-${index}`}>
                          <TableCell className="font-medium">
                            {student.firstName || ''} {student.lastName || ''}
                          </TableCell>
                          <TableCell>
                            {student.admissionNumber || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <StatusDotBadge status={student.status || 'ACTIVE'} />
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
                              className="rounded-xl"
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
              <div className="flex h-[200px] flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="grid size-16 place-items-center rounded-2xl bg-muted/10 text-muted-foreground">
                  <Users className="size-8" />
                </div>
                <p className="text-sm font-medium">No students found in this class</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Class Subjects */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <BookOpen className="size-4" />
                </div>
                Class Subjects
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/classes/${classId}/subjects`)}
                className="gap-2 rounded-xl"
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
              <div className="overflow-hidden rounded-xl border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Subject Name</TableHead>
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Subject Code</TableHead>
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      <TableHead className="h-12 text-right text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectsData.data.map((item: any, index: number) => (
                      <TableRow key={item.id || item.subject?.id || `subject-${index}`}>
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
                          <StatusDotBadge status={item.status || 'ACTIVE'} />
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
                            className="rounded-xl"
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
              <div className="flex h-[200px] flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="grid size-16 place-items-center rounded-2xl bg-muted/10 text-muted-foreground">
                  <BookOpen className="size-8" />
                </div>
                <p className="text-sm font-medium">No subjects assigned to this class for the current term</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/classes/${classId}/subjects`)}
                  className="gap-2 rounded-xl"
                >
                  <Plus className="size-4" />
                  Add Subjects
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
