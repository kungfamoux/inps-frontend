import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { staffApi } from '@/lib/api/staff';
import { adminApi } from '@/lib/api/admin';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Plus, Trash2, ChevronDown } from 'lucide-react';
import { StaffRole, Gender, MaritalStatus, Term } from '@/lib/types/common';
import { Qualification, PreviousEmployment } from '@/lib/types/staff';
import { SessionTermSelector } from '@/components/admin/SessionTermSelector';

const staffSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    middleName: z.string().optional(),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    role: z.nativeEnum(StaffRole),
    gender: z.nativeEnum(Gender).optional(),
    dateOfBirth: z.string().optional(),
    address: z.string().optional(),
    maritalStatus: z.nativeEnum(MaritalStatus).optional(),
    nationality: z.string().optional(),
    state: z.string().optional(),
    lga: z.string().optional(),
    religion: z.string().optional(),
    qualifications: z
      .array(
        z.object({
          degree: z.string(),
          institution: z.string(),
          year: z.string(),
        }),
      )
      .optional(),
    subjectId: z.string().optional(),
    yearsOfExperience: z.number().optional(),
    previousEmployment: z
      .array(
        z.object({
          company: z.string(),
          position: z.string(),
          period: z.string(),
        }),
      )
      .optional(),
    dateOfEmployment: z.string().optional(),
    nextOfKinName: z.string().optional(),
    nextOfKinPhone: z.string().optional(),
    nextOfKinRelationship: z.string().optional(),
    nextOfKinAddress: z.string().optional(),
  })
  .refine(
    (data) => {
      return (
        !!data.firstName &&
        !!data.lastName &&
        !!data.email &&
        !!data.phone &&
        !!data.role
      );
    },
    {
      message: 'All required fields must be filled',
      path: [],
    },
  );

type StaffFormData = {
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  role: StaffRole;
  gender?: Gender;
  dateOfBirth?: string;
  address?: string;
  maritalStatus?: MaritalStatus;
  nationality?: string;
  state?: string;
  lga?: string;
  religion?: string;
  qualifications?: Qualification[];
  subjectId?: string;
  yearsOfExperience?: number;
  previousEmployment?: PreviousEmployment[];
  dateOfEmployment?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
  nextOfKinRelationship?: string;
  nextOfKinAddress?: string;
};

export default function AddStaff() {
  const navigate = useNavigate();
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [previousEmployment, setPreviousEmployment] = useState<
    PreviousEmployment[]
  >([]);
  const [enableAssignment, setEnableAssignment] = useState(false);
  const [assignmentType, setAssignmentType] = useState<
    'classTeacher' | 'subjectTeacher'
  >('classTeacher');
  const [assignmentData, setAssignmentData] = useState({
    classId: '',
    subjectId: '',
    selectedClassIds: new Set<string>(),
    term: Term.FIRST_TERM,
    academicYear: '',
    termId: '',
  });
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedSessionName, setSelectedSessionName] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');

  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => adminApi.getAllSubjects(),
  });

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => adminApi.getAllClasses(),
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      role: StaffRole.TEACHER,
      gender: Gender.MALE,
      qualifications: [],
      previousEmployment: [],
      middleName: '',
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
          setAssignmentData({
            ...assignmentData,
            term: termData.data.term as Term,
            academicYear: sessionData.data.session,
            termId: termData.data.id,
          });
        }
      } catch (error) {
        console.error('Failed to fetch current session/term:', error);
      }
    };

    fetchCurrentData();
  }, []);

  const selectedRole = watch('role');

  const createStaffMutation = useMutation({
    mutationFn: async (data: StaffFormData) => {
      // First create the staff
      const staff = await staffApi.createStaff({
        ...data,
        qualifications: qualifications.length > 0 ? qualifications : undefined,
        previousEmployment:
          previousEmployment.length > 0 ? previousEmployment : undefined,
      });

      // If assignment is enabled and role is TEACHER, create assignment
      if (enableAssignment && data.role === StaffRole.TEACHER && staff.data) {
        try {
          if (assignmentType === 'classTeacher') {
            // Class teacher assignment
            await adminApi.assignClassTeacher(
              assignmentData.classId,
              staff.data.id,
            );
            return {
              staff,
              assignmentCreated: true,
              assignmentType: 'classTeacher',
            };
          } else if (assignmentType === 'subjectTeacher') {
            // Subject teacher assignment (bulk)
            const classIds = Array.from(assignmentData.selectedClassIds);
            if (classIds.length > 0) {
              await adminApi.bulkCreateAssignment({
                classIds,
                subjectId: assignmentData.subjectId,
                teacherId: staff.data.id,
                academicYear: assignmentData.academicYear,
                term: assignmentData.term,
                termId: assignmentData.termId,
              });
              return {
                staff,
                assignmentCreated: true,
                assignmentType: 'subjectTeacher',
              };
            }
          }
        } catch (assignmentError) {
          console.error('Assignment failed:', assignmentError);
          return {
            staff,
            assignmentCreated: false,
            assignmentError,
            assignmentType,
          };
        }
      }

      return { staff, assignmentCreated: false };
    },
    onSuccess: (result) => {
      if (result.assignmentCreated) {
        if (result.assignmentType === 'classTeacher') {
          toast.success(
            'Staff account and class teacher assignment created successfully',
          );
        } else if (result.assignmentType === 'subjectTeacher') {
          toast.success(
            'Staff account and subject teacher assignment created successfully',
          );
        }
      } else if (result.assignmentError) {
        toast.warning('Staff account created, but assignment failed');
      } else {
        toast.success('Staff account created successfully');
      }
      navigate('/admin/staff');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create staff account');
    },
  });

  const onSubmit = (data: StaffFormData) => {
    createStaffMutation.mutate(data);
  };

  const addQualification = () => {
    setQualifications([
      ...qualifications,
      { degree: '', institution: '', year: '' },
    ]);
  };

  const removeQualification = (index: number) => {
    setQualifications(qualifications.filter((_, i) => i !== index));
  };

  const updateQualification = (
    index: number,
    field: keyof Qualification,
    value: string,
  ) => {
    const updated = [...qualifications];
    updated[index][field] = value;
    setQualifications(updated);
  };

  const addEmployment = () => {
    setPreviousEmployment([
      ...previousEmployment,
      { company: '', position: '', period: '' },
    ]);
  };

  const removeEmployment = (index: number) => {
    setPreviousEmployment(previousEmployment.filter((_, i) => i !== index));
  };

  const updateEmployment = (
    index: number,
    field: keyof PreviousEmployment,
    value: string,
  ) => {
    const updated = [...previousEmployment];
    updated[index][field] = value;
    setPreviousEmployment(updated);
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/staff')}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Staff</h1>
            <p className="text-sm text-muted-foreground">
              Create a new staff account
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" {...register('firstName')} />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" {...register('lastName')} />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input id="middleName" {...register('middleName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" {...register('phone')} />
                    {errors.phone && (
                      <p className="text-sm text-destructive">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...register('dateOfBirth')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={Gender.MALE}>Male</SelectItem>
                            <SelectItem value={Gender.FEMALE}>
                              Female
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">Marital Status</Label>
                    <Controller
                      name="maritalStatus"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={MaritalStatus.SINGLE}>
                              Single
                            </SelectItem>
                            <SelectItem value={MaritalStatus.MARRIED}>
                              Married
                            </SelectItem>
                            <SelectItem value={MaritalStatus.DIVORCED}>
                              Divorced
                            </SelectItem>
                            <SelectItem value={MaritalStatus.WIDOWED}>
                              Widowed
                            </SelectItem>
                            <SelectItem value={MaritalStatus.SEPARATED}>
                              Separated
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input id="nationality" {...register('nationality')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" {...register('state')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lga">LGA</Label>
                    <Input id="lga" {...register('lga')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="religion">Religion</Label>
                    <Input id="religion" {...register('religion')} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" {...register('address')} />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Professional Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={StaffRole.TEACHER}>
                              Teacher
                            </SelectItem>
                            <SelectItem value={StaffRole.ADMIN}>
                              Admin
                            </SelectItem>
                            <SelectItem value={StaffRole.HEAD_TEACHER}>
                              Head Teacher
                            </SelectItem>
                            <SelectItem value={StaffRole.BURSARY}>
                              Bursary
                            </SelectItem>
                            <SelectItem value={StaffRole.STOREKEEPER}>
                              Storekeeper
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.role && (
                      <p className="text-sm text-destructive">
                        {errors.role.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfExperience">
                      Years of Experience
                    </Label>
                    <Input
                      id="yearsOfExperience"
                      type="number"
                      {...register('yearsOfExperience', {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfEmployment">Date of Employment</Label>
                    <Input
                      id="dateOfEmployment"
                      type="date"
                      {...register('dateOfEmployment')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subjectId">Subject Specialization</Label>
                    <Controller
                      name="subjectId"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects?.data?.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.subjectName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Qualifications */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Qualifications</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addQualification}
                    >
                      <Plus className="size-4 mr-1" /> Add Qualification
                    </Button>
                  </div>
                  {qualifications.map((qual, index) => (
                    <div
                      key={index}
                      className="grid gap-3 md:grid-cols-3 items-end p-4 border rounded-lg"
                    >
                      <div className="space-y-2">
                        <Label>Degree</Label>
                        <Input
                          value={qual.degree}
                          onChange={(e) =>
                            updateQualification(index, 'degree', e.target.value)
                          }
                          placeholder="e.g., B.Sc Computer Science"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Institution</Label>
                        <Input
                          value={qual.institution}
                          onChange={(e) =>
                            updateQualification(
                              index,
                              'institution',
                              e.target.value,
                            )
                          }
                          placeholder="e.g., University of Lagos"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Year</Label>
                        <div className="flex gap-2">
                          <Input
                            value={qual.year}
                            onChange={(e) =>
                              updateQualification(index, 'year', e.target.value)
                            }
                            placeholder="e.g., 2020"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeQualification(index)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Previous Employment */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Previous Employment</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addEmployment}
                    >
                      <Plus className="size-4 mr-1" /> Add Employment
                    </Button>
                  </div>
                  {previousEmployment.map((emp, index) => (
                    <div
                      key={index}
                      className="grid gap-3 md:grid-cols-3 items-end p-4 border rounded-lg"
                    >
                      <div className="space-y-2">
                        <Label>Company</Label>
                        <Input
                          value={emp.company}
                          onChange={(e) =>
                            updateEmployment(index, 'company', e.target.value)
                          }
                          placeholder="e.g., ABC School"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Input
                          value={emp.position}
                          onChange={(e) =>
                            updateEmployment(index, 'position', e.target.value)
                          }
                          placeholder="e.g., Mathematics Teacher"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Period</Label>
                        <div className="flex gap-2">
                          <Input
                            value={emp.period}
                            onChange={(e) =>
                              updateEmployment(index, 'period', e.target.value)
                            }
                            placeholder="e.g., 2018-2022"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeEmployment(index)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Emergency Contact</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nextOfKinName">Next of Kin Name</Label>
                    <Input id="nextOfKinName" {...register('nextOfKinName')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextOfKinPhone">Next of Kin Phone</Label>
                    <Input
                      id="nextOfKinPhone"
                      {...register('nextOfKinPhone')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextOfKinRelationship">Relationship</Label>
                    <Input
                      id="nextOfKinRelationship"
                      {...register('nextOfKinRelationship')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nextOfKinAddress">
                      Next of Kin Address
                    </Label>
                    <Input
                      id="nextOfKinAddress"
                      {...register('nextOfKinAddress')}
                    />
                  </div>
                </div>
              </div>

              {/* Teacher Assignment - Only for TEACHER role */}
              {selectedRole === StaffRole.TEACHER && (
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between cursor-pointer py-2 border-b">
                      <h3 className="text-lg font-semibold">
                        Teacher Assignment (Optional)
                      </h3>
                      <ChevronDown className="size-4" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="enableAssignment"
                        checked={enableAssignment}
                        onChange={(e) => setEnableAssignment(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="enableAssignment" className="text-sm">
                        Assign this teacher immediately
                      </Label>
                    </div>

                    {enableAssignment && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="assignmentType">
                            Assignment Type *
                          </Label>
                          <Select
                            value={assignmentType}
                            onValueChange={(value) =>
                              setAssignmentType(
                                value as 'classTeacher' | 'subjectTeacher',
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select assignment type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="classTeacher">
                                Class Teacher
                              </SelectItem>
                              <SelectItem value="subjectTeacher">
                                Subject Teacher
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {assignmentType === 'classTeacher' && (
                          <div className="space-y-2">
                            <Label htmlFor="assignmentClass">Class *</Label>
                            <Select
                              value={assignmentData.classId}
                              onValueChange={(value) =>
                                setAssignmentData({
                                  ...assignmentData,
                                  classId: value,
                                })
                              }
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
                            <p className="text-xs text-gray-500">
                              One teacher can only be class teacher of one class
                            </p>
                          </div>
                        )}

                        {assignmentType === 'subjectTeacher' && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="assignmentSubject">
                                Subject *
                              </Label>
                              <Select
                                value={assignmentData.subjectId}
                                onValueChange={(value) =>
                                  setAssignmentData({
                                    ...assignmentData,
                                    subjectId: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select subject" />
                                </SelectTrigger>
                                <SelectContent>
                                  {subjects?.data?.map((subject) => (
                                    <SelectItem
                                      key={subject.id}
                                      value={subject.id}
                                    >
                                      {subject.subjectCode} -{' '}
                                      {subject.subjectName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="assignmentClasses">
                                Classes *
                              </Label>
                              <div className="space-y-2">
                                {classes?.data?.map((cls) => (
                                  <div
                                    key={cls.id}
                                    className="flex items-center space-x-2"
                                  >
                                    <input
                                      type="checkbox"
                                      id={`class-${cls.id}`}
                                      checked={assignmentData.selectedClassIds.has(
                                        cls.id,
                                      )}
                                      onChange={(e) => {
                                        const newSelected = new Set(
                                          assignmentData.selectedClassIds,
                                        );
                                        if (e.target.checked) {
                                          newSelected.add(cls.id);
                                        } else {
                                          newSelected.delete(cls.id);
                                        }
                                        setAssignmentData({
                                          ...assignmentData,
                                          selectedClassIds: newSelected,
                                        });
                                      }}
                                      className="rounded"
                                    />
                                    <Label
                                      htmlFor={`class-${cls.id}`}
                                      className="text-sm"
                                    >
                                      {cls.name}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <SessionTermSelector
                                sessionId={selectedSessionId}
                                termId={selectedTermId}
                                onSessionChange={(id, name) => {
                                  setSelectedSessionId(id);
                                  setSelectedSessionName(name);
                                  setAssignmentData({
                                    ...assignmentData,
                                    academicYear: name,
                                  });
                                }}
                                onTermChange={(id, term) => {
                                  setSelectedTermId(id);
                                  setSelectedTerm(term);
                                  setAssignmentData({
                                    ...assignmentData,
                                    term: term as Term,
                                    termId: id,
                                  });
                                }}
                                required
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!selectedSessionId && (
                      <p className="text-sm text-amber-600">
                        No current academic session set. Please set up academic
                        sessions before assigning subjects.
                      </p>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              )}

              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/staff')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Staff Account'
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
