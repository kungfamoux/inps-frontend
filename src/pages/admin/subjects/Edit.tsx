import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  SchoolLevel,
  UpdateSubjectRequest,
  SubjectStatus,
} from '@/lib/types/common';

const subjectSchema = z.object({
  subjectName: z.string().min(1, 'Subject name is required'),
  subjectCode: z
    .string()
    .min(1, 'Subject code is required')
    .max(20, 'Subject code must be 20 characters or less'),
  description: z.string().optional(),
  levels: z
    .array(z.nativeEnum(SchoolLevel))
    .min(1, 'At least one level must be selected'),
  status: z.nativeEnum(SubjectStatus).optional(),
  isActive: z.boolean().optional(),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

const ALL_LEVELS = [
  SchoolLevel.DAYCARE,
  SchoolLevel.PRENURSERY,
  SchoolLevel.NURSERY_1,
  SchoolLevel.NURSERY_2,
  SchoolLevel.NURSERY_3,
  SchoolLevel.PRIMARY_1,
  SchoolLevel.PRIMARY_2,
  SchoolLevel.PRIMARY_3,
  SchoolLevel.PRIMARY_4,
  SchoolLevel.PRIMARY_5,
  SchoolLevel.PRIMARY_6,
];

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

export default function EditSubject() {
  const navigate = useNavigate();
  const { subjectId } = useParams<{ subjectId: string }>();

  const { data: subjectData, isLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => adminApi.getSubjectById(subjectId!),
    enabled: !!subjectId,
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      levels: [],
      isActive: true,
    },
  });

  const selectedLevels = watch('levels');

  // Reset form when subject data is loaded
  useEffect(() => {
    if (subjectData?.data && !isLoading) {
      const subject = subjectData.data;
      const existingLevels =
        subject.levels?.map((l: any) =>
          typeof l === 'string' ? l : l.level,
        ) || [];

      reset({
        subjectName: subject.subjectName,
        subjectCode: subject.subjectCode,
        description: subject.description || '',
        levels: existingLevels,
        status: subject.status || SubjectStatus.ACTIVE,
        isActive: subject.isActive !== undefined ? subject.isActive : true,
      });
    }
  }, [subjectData?.data, isLoading, reset]);

  const toggleLevel = (level: SchoolLevel) => {
    const currentLevels = selectedLevels || [];
    if (currentLevels.includes(level)) {
      setValue(
        'levels',
        currentLevels.filter((l) => l !== level),
      );
    } else {
      setValue('levels', [...currentLevels, level]);
    }
  };

  const selectAllLevels = () => {
    setValue('levels', ALL_LEVELS);
  };

  const clearAllLevels = () => {
    setValue('levels', []);
  };

  const updateSubjectMutation = useMutation({
    mutationFn: (data: UpdateSubjectRequest) =>
      adminApi.updateSubject(subjectId!, data),
    onSuccess: () => {
      toast.success('Subject updated successfully');
      navigate('/admin/subjects');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subject');
    },
  });

  const onSubmit = (data: SubjectFormData) => {
    const updateData: UpdateSubjectRequest = {
      subjectName: data.subjectName,
      subjectCode: data.subjectCode,
      description: data.description,
      levels: data.levels,
      status: data.status,
      isActive: data.isActive,
    };
    updateSubjectMutation.mutate(updateData);
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
                Edit Subject
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
                Edit Subject
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
            <h1 className="text-2xl font-bold tracking-tight">Edit Subject</h1>
            <p className="text-sm text-muted-foreground">
              Update subject information
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subject Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subjectName">Subject Name *</Label>
                  <Input
                    id="subjectName"
                    {...register('subjectName')}
                    placeholder="e.g., Mathematics"
                  />
                  {errors.subjectName && (
                    <p className="text-sm text-destructive">
                      {errors.subjectName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subjectCode">Subject Code *</Label>
                  <Input
                    id="subjectCode"
                    {...register('subjectCode')}
                    placeholder="e.g., MATH"
                    className="uppercase"
                  />
                  {errors.subjectCode && (
                    <p className="text-sm text-destructive">
                      {errors.subjectCode.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    A short code for the subject (e.g., MATH, ENG, SCI)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Brief description of the subject"
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Applicable Levels *</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={selectAllLevels}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearAllLevels}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {ALL_LEVELS.map((level) => (
                      <div key={level} className="flex items-center space-x-2">
                        <Checkbox
                          id={`level-${level}`}
                          checked={selectedLevels?.includes(level)}
                          onCheckedChange={() => toggleLevel(level)}
                        />
                        <Label
                          htmlFor={`level-${level}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {LEVEL_LABELS[level]}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.levels && (
                    <p className="text-sm text-destructive">
                      {errors.levels.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SubjectStatus.ACTIVE}>
                            Active
                          </SelectItem>
                          <SelectItem value={SubjectStatus.INACTIVE}>
                            Inactive
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && (
                    <p className="text-sm text-destructive">
                      {errors.status.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="isActive" {...register('isActive')} />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Subject is active (can be assigned to classes)
                  </Label>
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/subjects')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Subject'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
