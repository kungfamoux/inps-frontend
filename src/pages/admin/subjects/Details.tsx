import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Pencil, Power, PowerOff } from 'lucide-react';
import { SchoolLevel, SubjectStatus } from '@/lib/types/common';

const LEVEL_LABELS: Record<SchoolLevel, string> = {
  [SchoolLevel.DAYCARE]: 'Daycare',
  [SchoolLevel.PRENURSERY]: 'Pre-Nursery',
  [SchoolLevel.NURSERY_1]: 'Nursery 1',
  [SchoolLevel.NURSERY_2]: 'Nursery 2',
  [SchoolLevel.NURSERY_3]: 'Nursery 3',
  [SchoolLevel.PRIMARY_1]: 'Primary 1',
  [SchoolLevel.PRIMARY_2]: 'Primary 2',
  [SchoolLevel.PRIMARY_3]: 'Primary 3',
  [SchoolLevel.PRIMARY_4]: 'Primary 4',
  [SchoolLevel.PRIMARY_5]: 'Primary 5',
  [SchoolLevel.PRIMARY_6]: 'Primary 6',
};

export default function SubjectDetails() {
  const navigate = useNavigate();
  const { subjectId } = useParams<{ subjectId: string }>();

  const {
    data: subjectData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => adminApi.getSubjectById(subjectId!),
    enabled: !!subjectId,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: () => adminApi.toggleSubjectActive(subjectId!),
    onSuccess: () => {
      toast.success(
        `Subject ${!subjectData?.data?.isActive ? 'activated' : 'deactivated'} successfully`,
      );
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to toggle subject status');
    },
  });

  const handleToggleActive = () => {
    toggleActiveMutation.mutate();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/subjects')}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Subject Details
              </h1>
              <p className="text-sm text-muted-foreground">
                Loading subject information...
              </p>
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

  if (!subjectData?.data) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/subjects')}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Subject Details
              </h1>
              <p className="text-sm text-muted-foreground">Subject not found</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Subject not found
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const subject = subjectData.data;
  const levels =
    subject.levels?.map((l: any) => (typeof l === 'string' ? l : l.level)) ||
    [];

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/subjects')}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Subject Details
              </h1>
              <p className="text-sm text-muted-foreground">
                View and manage subject information
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleActive}
              disabled={toggleActiveMutation.isPending}
            >
              {subject.isActive ? (
                <>
                  <PowerOff className="mr-2 size-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Power className="mr-2 size-4" />
                  Activate
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/subjects/${subjectId}/edit`)}
            >
              <Pencil className="mr-2 size-4" />
              Edit
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Subject Name
                </p>
                <p className="text-lg font-semibold">{subject.subjectName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Subject Code
                </p>
                <p className="text-lg font-semibold uppercase">
                  {subject.subjectCode}
                </p>
              </div>
              {subject.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm">{subject.description}</p>
                </div>
              )}
              <div className="flex gap-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge variant={subject.isActive ? 'default' : 'secondary'}>
                    {subject.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {subject.status && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Record Status
                    </p>
                    <Badge
                      variant={
                        subject.status === SubjectStatus.ACTIVE
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {subject.status}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Applicable Levels</CardTitle>
            </CardHeader>
            <CardContent>
              {levels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {levels.map((level: SchoolLevel) => (
                    <Badge key={level} variant="outline" className="text-sm">
                      {LEVEL_LABELS[level]}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No levels assigned
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Created At
                </p>
                <p className="text-sm">
                  {new Date(subject.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </p>
                <p className="text-sm">
                  {new Date(subject.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
