import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { staffApi } from '@/lib/api/staff';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Layers } from 'lucide-react';
import { Term } from '@/lib/types/common';
import { SessionTermSelector } from '@/components/admin/SessionTermSelector';

const singleAssignmentSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  term: z.nativeEnum(Term),
  termId: z.string().min(1, 'Term ID is required'),
});

const bulkAssignmentSchema = z.object({
  classIds: z.array(z.string()).min(1, 'At least one class is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  term: z.nativeEnum(Term),
  termId: z.string().min(1, 'Term ID is required'),
});

type SingleFormData = z.infer<typeof singleAssignmentSchema>;
type BulkFormData = z.infer<typeof bulkAssignmentSchema>;

export default function AddAssignment() {
  const navigate = useNavigate();
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(
    new Set(),
  );
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedSessionName, setSelectedSessionName] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => adminApi.getAllClasses(),
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => adminApi.getAllSubjects(),
  });

  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => staffApi.getAllStaff({ role: 'TEACHER' }),
  });

  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SingleFormData | BulkFormData>({
    resolver: zodResolver(
      isBulkMode ? bulkAssignmentSchema : singleAssignmentSchema,
    ),
    defaultValues: {
      academicYear: '',
      term: Term.FIRST_TERM,
      termId: '',
      classId: '',
      subjectId: '',
      teacherId: '',
      classIds: [],
    },
  });

  // Auto-select current session/term for SessionTermSelector
  useEffect(() => {
    const fetchCurrentData = async () => {
      try {
        const [sessionData, termData] = await Promise.all([
          adminApi.getCurrentSession(),
          adminApi.getCurrentTerm(),
        ]);

        if (sessionData.data && termData.data) {
          setSelectedSessionId(sessionData.data.id);
          setSelectedSessionName(sessionData.data.session);
          setSelectedTermId(termData.data.id);
          setSelectedTerm(termData.data.term);
          setValue('academicYear', sessionData.data.session);
          setValue('term', termData.data.term as Term);
          setValue('termId', termData.data.id);
        }
      } catch (error) {
        console.error('Failed to fetch current session/term:', error);
      }
    };

    fetchCurrentData();
  }, [setValue]);

  const createAssignmentMutation = useMutation({
    mutationFn: (data: SingleFormData | BulkFormData) => {
      if (isBulkMode) {
        return adminApi.bulkCreateAssignment({
          classIds: Array.from(selectedClasses),
          subjectId: (data as BulkFormData).subjectId,
          teacherId: (data as BulkFormData).teacherId,
          academicYear: (data as BulkFormData).academicYear,
          term: (data as BulkFormData).term,
          termId: (data as BulkFormData).termId,
        });
      } else {
        return adminApi.createAssignment(data as SingleFormData);
      }
    },
    onSuccess: () => {
      toast.success(
        isBulkMode
          ? 'Bulk assignment created successfully'
          : 'Assignment created successfully',
      );
      navigate('/admin/assignments');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create assignment');
    },
  });

  const onSubmit = (data: SingleFormData | BulkFormData) => {
    if (isBulkMode && selectedClasses.size === 0) {
      toast.error('Please select at least one class');
      return;
    }
    createAssignmentMutation.mutate(data);
  };

  const handleSelectAllClasses = (checked: boolean | string) => {
    const isChecked =
      typeof checked === 'boolean' ? checked : checked === 'true';
    if (isChecked && classes?.data) {
      setSelectedClasses(new Set(classes.data.map((cls) => cls.id)));
    } else {
      setSelectedClasses(new Set());
    }
  };

  const handleSelectClass = (classId: string, checked: boolean | string) => {
    const isChecked =
      typeof checked === 'boolean' ? checked : checked === 'true';
    const newSelected = new Set(selectedClasses);
    if (isChecked) {
      newSelected.add(classId);
    } else {
      newSelected.delete(classId);
    }
    setSelectedClasses(newSelected);
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/assignments')}
          >
            <ArrowLeft className="size-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Add Assignment
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new subject-teacher assignment
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {isBulkMode ? 'Bulk Assignment' : 'Single Assignment'}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsBulkMode(!isBulkMode);
                  setSelectedClasses(new Set());
                }}
              >
                <Layers className="size-4 mr-2" />
                {isBulkMode ? 'Switch to Single' : 'Switch to Bulk'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {!currentSession?.data && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    No current academic session set. Please set up academic
                    sessions before creating assignments.
                  </p>
                </div>
              )}

              {isBulkMode ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Select Classes *</Label>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={
                          selectedClasses.size === classes?.data?.length &&
                          classes?.data?.length > 0
                        }
                        onCheckedChange={handleSelectAllClasses}
                      />
                      <span className="text-sm">Select All</span>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {classes?.data?.map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center space-x-2 p-3 border rounded-lg"
                      >
                        <Checkbox
                          checked={selectedClasses.has(cls.id)}
                          onCheckedChange={(checked) =>
                            handleSelectClass(cls.id, checked)
                          }
                        />
                        <span className="text-sm">{cls.name}</span>
                      </div>
                    ))}
                  </div>
                  {selectedClasses.size === 0 && (
                    <p className="text-sm text-destructive">
                      Please select at least one class
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="classId">Class *</Label>
                  <Controller
                    name="classId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes?.data?.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.classId && (
                    <p className="text-sm text-destructive">
                      {errors.classId.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="subjectId">Subject *</Label>
                <Controller
                  name="subjectId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects?.data?.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.subjectCode} - {subject.subjectName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subjectId && (
                  <p className="text-sm text-destructive">
                    {errors.subjectId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacherId">Teacher *</Label>
                <Controller
                  name="teacherId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers?.data?.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.firstName} {teacher.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.teacherId && (
                  <p className="text-sm text-destructive">
                    {errors.teacherId.message}
                  </p>
                )}
              </div>

              <SessionTermSelector
                sessionId={selectedSessionId}
                termId={selectedTermId}
                onSessionChange={(id, name) => {
                  setSelectedSessionId(id);
                  setSelectedSessionName(name);
                  setValue('academicYear', name);
                }}
                onTermChange={(id, term) => {
                  setSelectedTermId(id);
                  setSelectedTerm(term);
                  setValue('termId', id);
                  setValue('term', term as Term);
                }}
                required
              />

              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/assignments')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Creating...
                    </>
                  ) : isBulkMode ? (
                    'Create Bulk Assignment'
                  ) : (
                    'Create Assignment'
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
