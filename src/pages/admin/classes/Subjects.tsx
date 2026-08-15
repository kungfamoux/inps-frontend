import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ClassSubjects() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  const { data: classData, isLoading: classLoading } = useQuery({
    queryKey: ['class', classId],
    queryFn: () => adminApi.getClassById(classId!),
    enabled: !!classId,
  });

  const { data: sessionData } = useQuery({
    queryKey: ['current-term'],
    queryFn: () => adminApi.getCurrentTerm(),
  });

  const { data: allSubjects, isLoading: subjectsLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => adminApi.getAllSubjects(),
  });

  const {
    data: assignedSubjects,
    isLoading: assignedLoading,
    refetch,
  } = useQuery({
    queryKey: ['class-subjects', classId, sessionData?.data?.id],
    queryFn: () => adminApi.getSubjectsByClass(classId!, sessionData?.data?.id),
    enabled: !!classId && !!sessionData?.data?.id,
  });

  // Initialize selected subjects when assigned subjects load
  useEffect(() => {
    if (assignedSubjects?.data) {
      const ids = assignedSubjects.data
        .map((item: any) => item.subject?.id || item.subjectId)
        .filter(Boolean);
      setSelectedSubjectIds(ids);
    }
  }, [assignedSubjects?.data]);

  const assignMutation = useMutation({
    mutationFn: (subjectIds: string[]) =>
      adminApi.assignSubjectsToClass(classId!, {
        termId: sessionData!.data!.id,
        subjectIds,
      }),
    onSuccess: (data) => {
      toast.success(
        `Successfully assigned ${data.data.added} subjects to class`,
      );
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign subjects');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (subjectId: string) =>
      adminApi.removeSubjectFromClass(
        classId!,
        subjectId,
        sessionData!.data!.id,
      ),
    onSuccess: () => {
      toast.success('Subject removed from class');
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove subject');
    },
  });

  const handleAddSubject = (subjectId: string) => {
    if (!selectedSubjectIds.includes(subjectId)) {
      setSelectedSubjectIds((prev) => [...prev, subjectId]);
    }
  };

  const handleRemoveSubject = (subjectId: string) => {
    setSelectedSubjectIds((prev) => prev.filter((id) => id !== subjectId));
  };

  const handleSave = () => {
    if (!sessionData?.data?.id) {
      toast.error('No active term found');
      return;
    }
    // Deduplicate subject IDs to prevent duplicates
    const uniqueSubjectIds = Array.from(new Set(selectedSubjectIds));
    assignMutation.mutate(uniqueSubjectIds);
  };

  const availableSubjects =
    allSubjects?.data?.filter((subject: any) => {
      if (!subject.isActive) return false;
      return !selectedSubjectIds.includes(subject.id);
    }) || [];

  if (classLoading || subjectsLoading || assignedLoading) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/admin/classes/${classId}`)}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Manage Class Subjects
              </h1>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <Loader2 className="animate-spin" />
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
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Manage Class Subjects
              </h1>
              <p className="text-sm text-muted-foreground">Class not found</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const cls = classData.data;
  const currentTerm = sessionData?.data;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/admin/classes/${classId}`)}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Manage Class Subjects
            </h1>
            <p className="text-sm text-muted-foreground">
              {cls.className || cls.name} -{' '}
              {currentTerm?.term || currentTerm?.session || 'Current Term'}
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={assignMutation.isPending}
            className="gap-2"
          >
            {assignMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Subjects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject-select">Select Subject</Label>
              <Select onValueChange={handleAddSubject}>
                <SelectTrigger id="subject-select">
                  <SelectValue placeholder="Choose a subject to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No available subjects
                    </div>
                  ) : (
                    availableSubjects.map((subject: any) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.subjectName} ({subject.subjectCode})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Selected Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSubjectIds.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No subjects selected
              </p>
            ) : (
              <div className="space-y-2">
                {selectedSubjectIds.map((subjectId) => {
                  const subject = allSubjects?.data?.find(
                    (s: any) => s.id === subjectId,
                  );
                  if (!subject) return null;
                  return (
                    <div
                      key={subjectId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{subject.subjectName}</p>
                        <p className="text-sm text-muted-foreground">
                          {subject.subjectCode}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSubject(subjectId)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
