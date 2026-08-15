import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { Gender } from '@/lib/types/common';

const guardianSchema = z.object({
  relationship: z.string().min(1, 'Relationship is required'),
  title: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().or(z.literal('')).optional(), // Make optional since account phone is used
  email: z.string().email('Invalid email address').or(z.literal('')).optional(), // Make optional since account email is used
  occupation: z.string().optional(),
  address: z.string().optional(),
});

const secondaryGuardianSchema = z.object({
  relationship: z.string().min(1, 'Relationship is required'),
  title: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  occupation: z.string().min(1, 'Occupation is required'),
  address: z.string().min(1, 'Address is required'),
});

const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().min(1, 'Middle name is required'),
  gender: z.nativeEnum(Gender),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  admissionDate: z.string().min(1, 'Admission date is required'),
  nationality: z.string().min(1, 'Nationality is required'),
  state: z.string().min(1, 'State is required'),
  lga: z.string().min(1, 'LGA is required'),
  religion: z.string().min(1, 'Religion is required'),
  healthInfo: z.string().min(1, 'Health info is required'),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  sportHouse: z.string().min(1, 'Sport house is required'),
  studentType: z.string().min(1, 'Student type is required'),
  address: z.string().min(1, 'Address is required'),
  accountEmail: z.string().email('Invalid email address'),
  accountPhone: z.string().min(1, 'Phone number is required'),
  primaryGuardian: guardianSchema,
  secondaryGuardian: secondaryGuardianSchema.optional(),
  maritalStatus: z
    .enum(['MARRIED', 'SINGLE', 'DIVORCED', 'WIDOWED', 'SEPARATED'])
    .optional(),
  classId: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

export default function AddStudent() {
  const navigate = useNavigate();
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);
  const [currentTerm, setCurrentTerm] = useState<any>(null);
  const [showSecondaryGuardian, setShowSecondaryGuardian] = useState(false);

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => adminApi.getAllClasses(),
  });

  const { data: currentTermData } = useQuery({
    queryKey: ['currentTerm'],
    queryFn: () => adminApi.getCurrentTerm(),
  });

  useEffect(() => {
    if (currentTermData?.data) {
      setCurrentTerm(currentTermData.data);
    }
  }, [currentTermData]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      gender: Gender.MALE,
      primaryGuardian: {
        relationship: 'Father',
        title: 'Mr.',
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        occupation: '',
      },
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const formData = new FormData();

      // Student data
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('middleName', data.middleName || '');
      formData.append('gender', data.gender);
      formData.append('dateOfBirth', data.dateOfBirth);
      formData.append('admissionDate', data.admissionDate);
      formData.append('nationality', data.nationality);
      formData.append('state', data.state);
      formData.append('lga', data.lga);
      formData.append('religion', data.religion);
      formData.append('healthInfo', data.healthInfo);
      formData.append('bloodGroup', data.bloodGroup);
      formData.append('sportHouse', data.sportHouse);
      formData.append('studentType', data.studentType);
      formData.append('address', data.address);

      // Account credentials
      formData.append('accountEmail', data.accountEmail);
      formData.append('accountPhone', data.accountPhone);

      if (passportPhoto) {
        formData.append('passportPhoto', passportPhoto);
      }

      // Parent data with new guardian structure
      const parentData: any = {
        primaryGuardian: data.primaryGuardian,
        secondaryGuardian: data.secondaryGuardian || null,
        address: data.address || null,
        maritalStatus: data.maritalStatus || null,
      };

      formData.append('parentData', JSON.stringify(parentData));
      formData.append('intakeType', 'NEW'); // Default to NEW for new students

      // Create student
      const studentResponse = await adminApi.createStudent(formData);

      console.log('Student creation response:', studentResponse);

      if (!studentResponse.success) {
        throw new Error(studentResponse.message || 'Failed to create student');
      }

      // Enroll student if class is selected
      if (data.classId && currentTerm) {
        const enrollmentData = {
          studentId: studentResponse.data?.admissionNumber || '',
          classId: data.classId,
          academicYear: currentTerm.session?.session || '',
          term:
            currentTerm.term?.toUpperCase().replace(' ', '_') || 'FIRST_TERM',
        };

        const enrollmentResponse = await adminApi.enrollStudent(enrollmentData);

        if (!enrollmentResponse.success) {
          // Rollback: Delete the created student since enrollment failed
          await adminApi.deleteStudent(
            studentResponse.data?.admissionNumber || '',
          );
          throw new Error(
            enrollmentResponse.message || 'Failed to enroll student',
          );
        }
      }

      return { student: studentResponse.data };
    },
    onSuccess: () => {
      toast.success('Student created successfully');
      navigate('/admin/students');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create student');
    },
  });

  const onSubmit = (data: StudentFormData) => {
    createStudentMutation.mutate(data);
  };

  const addSecondaryGuardian = () => {
    setShowSecondaryGuardian(true);
    setValue('secondaryGuardian', {
      relationship: 'Mother',
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      occupation: '',
    });
  };

  const removeSecondaryGuardian = () => {
    setShowSecondaryGuardian(false);
    setValue('secondaryGuardian', undefined);
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/students')}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Add New Student
            </h1>
            <p className="text-sm text-muted-foreground">
              Register a new student and enroll them in a class
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <Input id="firstName" {...field} />
                      )}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-destructive">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => <Input id="lastName" {...field} />}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-destructive">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName">Middle Name *</Label>
                    <Controller
                      name="middleName"
                      control={control}
                      render={({ field }) => (
                        <Input id="middleName" {...field} />
                      )}
                    />
                    {errors.middleName && (
                      <p className="text-sm text-destructive">
                        {errors.middleName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
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
                    {errors.gender && (
                      <p className="text-sm text-destructive">
                        {errors.gender.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Controller
                      name="dateOfBirth"
                      control={control}
                      render={({ field }) => (
                        <Input id="dateOfBirth" type="date" {...field} />
                      )}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-sm text-destructive">
                        {errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admissionDate">Admission Date *</Label>
                    <Controller
                      name="admissionDate"
                      control={control}
                      render={({ field }) => (
                        <Input id="admissionDate" type="date" {...field} />
                      )}
                    />
                    {errors.admissionDate && (
                      <p className="text-sm text-destructive">
                        {errors.admissionDate.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Additional Information
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality *</Label>
                    <Controller
                      name="nationality"
                      control={control}
                      render={({ field }) => (
                        <Input id="nationality" {...field} />
                      )}
                    />
                    {errors.nationality && (
                      <p className="text-sm text-destructive">
                        {errors.nationality.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => <Input id="state" {...field} />}
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive">
                        {errors.state.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lga">LGA *</Label>
                    <Controller
                      name="lga"
                      control={control}
                      render={({ field }) => <Input id="lga" {...field} />}
                    />
                    {errors.lga && (
                      <p className="text-sm text-destructive">
                        {errors.lga.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="religion">Religion *</Label>
                    <Controller
                      name="religion"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select religion" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Christianity">
                              Christianity
                            </SelectItem>
                            <SelectItem value="Islam">Islam</SelectItem>
                            <SelectItem value="Traditional">
                              Traditional
                            </SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.religion && (
                      <p className="text-sm text-destructive">
                        {errors.religion.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="healthInfo">Health Info *</Label>
                    <Controller
                      name="healthInfo"
                      control={control}
                      render={({ field }) => (
                        <Input id="healthInfo" {...field} />
                      )}
                    />
                    {errors.healthInfo && (
                      <p className="text-sm text-destructive">
                        {errors.healthInfo.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup">Blood Group *</Label>
                    <Controller
                      name="bloodGroup"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.bloodGroup && (
                      <p className="text-sm text-destructive">
                        {errors.bloodGroup.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentType">Student Type *</Label>
                    <Controller
                      name="studentType"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select student type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Day">Day</SelectItem>
                            <SelectItem value="Boarding">Boarding</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.studentType && (
                      <p className="text-sm text-destructive">
                        {errors.studentType.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sportHouse">Sport House *</Label>
                    <Controller
                      name="sportHouse"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select sport house" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Red">Red</SelectItem>
                            <SelectItem value="Blue">Blue</SelectItem>
                            <SelectItem value="Green">Green</SelectItem>
                            <SelectItem value="Yellow">Yellow</SelectItem>
                            <SelectItem value="Purple">Purple</SelectItem>
                            <SelectItem value="Orange">Orange</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.sportHouse && (
                      <p className="text-sm text-destructive">
                        {errors.sportHouse.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <p className="text-sm text-muted-foreground">
              These credentials will be used for the parent portal login
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="accountEmail">Account Email *</Label>
                  <Controller
                    name="accountEmail"
                    control={control}
                    render={({ field }) => (
                      <Input id="accountEmail" type="email" {...field} />
                    )}
                  />
                  {errors.accountEmail && (
                    <p className="text-sm text-destructive">
                      {errors.accountEmail.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountPhone">Account Phone *</Label>
                  <Controller
                    name="accountPhone"
                    control={control}
                    render={({ field }) => (
                      <Input id="accountPhone" {...field} />
                    )}
                  />
                  {errors.accountPhone && (
                    <p className="text-sm text-destructive">
                      {errors.accountPhone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Primary Guardian (Account Holder)</CardTitle>
            <p className="text-sm text-muted-foreground">
              This guardian will receive portal login credentials, invoices, and
              SMS alerts
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryGuardian.relationship">
                    Relationship *
                  </Label>
                  <Controller
                    name="primaryGuardian.relationship"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Father">Father</SelectItem>
                          <SelectItem value="Mother">Mother</SelectItem>
                          <SelectItem value="Guardian">Guardian</SelectItem>
                          <SelectItem value="Uncle">Uncle</SelectItem>
                          <SelectItem value="Aunt">Aunt</SelectItem>
                          <SelectItem value="Grandparent">
                            Grandparent
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.primaryGuardian?.relationship && (
                    <p className="text-sm text-destructive">
                      {errors.primaryGuardian.relationship.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryGuardian.title">Title</Label>
                  <Controller
                    name="primaryGuardian.title"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mr.">Mr.</SelectItem>
                          <SelectItem value="Mrs.">Mrs.</SelectItem>
                          <SelectItem value="Ms.">Ms.</SelectItem>
                          <SelectItem value="Dr.">Dr.</SelectItem>
                          <SelectItem value="Chief">Chief</SelectItem>
                          <SelectItem value="Engr.">Engr.</SelectItem>
                          <SelectItem value="Pastor">Pastor</SelectItem>
                          <SelectItem value="Imam">Imam</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryGuardian.firstName">
                    First Name *
                  </Label>
                  <Controller
                    name="primaryGuardian.firstName"
                    control={control}
                    render={({ field }) => (
                      <Input id="primaryGuardian.firstName" {...field} />
                    )}
                  />
                  {errors.primaryGuardian?.firstName && (
                    <p className="text-sm text-destructive">
                      {errors.primaryGuardian.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryGuardian.lastName">Last Name *</Label>
                  <Controller
                    name="primaryGuardian.lastName"
                    control={control}
                    render={({ field }) => (
                      <Input id="primaryGuardian.lastName" {...field} />
                    )}
                  />
                  {errors.primaryGuardian?.lastName && (
                    <p className="text-sm text-destructive">
                      {errors.primaryGuardian.lastName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryGuardian.phone">Phone Number</Label>
                  <Controller
                    name="primaryGuardian.phone"
                    control={control}
                    render={({ field }) => (
                      <Input id="primaryGuardian.phone" {...field} />
                    )}
                  />
                  {errors.primaryGuardian?.phone && (
                    <p className="text-sm text-destructive">
                      {errors.primaryGuardian.phone.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryGuardian.email">Email Address</Label>
                  <Controller
                    name="primaryGuardian.email"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="primaryGuardian.email"
                        type="email"
                        {...field}
                      />
                    )}
                  />
                  {errors.primaryGuardian?.email && (
                    <p className="text-sm text-destructive">
                      {errors.primaryGuardian.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryGuardian.occupation">Occupation</Label>
                  <Controller
                    name="primaryGuardian.occupation"
                    control={control}
                    render={({ field }) => (
                      <Input id="primaryGuardian.occupation" {...field} />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryGuardian.address">Address</Label>
                  <Controller
                    name="primaryGuardian.address"
                    control={control}
                    render={({ field }) => (
                      <Input id="primaryGuardian.address" {...field} />
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Secondary Guardian (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            {!showSecondaryGuardian ? (
              <Button
                type="button"
                variant="outline"
                onClick={addSecondaryGuardian}
              >
                <Plus className="mr-2 size-4" />
                Add Secondary Guardian
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="secondaryGuardian.relationship">
                      Relationship *
                    </Label>
                    <Controller
                      name="secondaryGuardian.relationship"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Father">Father</SelectItem>
                            <SelectItem value="Mother">Mother</SelectItem>
                            <SelectItem value="Guardian">Guardian</SelectItem>
                            <SelectItem value="Uncle">Uncle</SelectItem>
                            <SelectItem value="Aunt">Aunt</SelectItem>
                            <SelectItem value="Grandparent">
                              Grandparent
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.secondaryGuardian?.relationship && (
                      <p className="text-sm text-destructive">
                        {errors.secondaryGuardian.relationship.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryGuardian.firstName">
                      First Name *
                    </Label>
                    <Controller
                      name="secondaryGuardian.firstName"
                      control={control}
                      render={({ field }) => (
                        <Input id="secondaryGuardian.firstName" {...field} />
                      )}
                    />
                    {errors.secondaryGuardian?.firstName && (
                      <p className="text-sm text-destructive">
                        {errors.secondaryGuardian.firstName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryGuardian.lastName">
                      Last Name *
                    </Label>
                    <Controller
                      name="secondaryGuardian.lastName"
                      control={control}
                      render={({ field }) => (
                        <Input id="secondaryGuardian.lastName" {...field} />
                      )}
                    />
                    {errors.secondaryGuardian?.lastName && (
                      <p className="text-sm text-destructive">
                        {errors.secondaryGuardian.lastName.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryGuardian.phone">
                      Phone Number
                    </Label>
                    <Controller
                      name="secondaryGuardian.phone"
                      control={control}
                      render={({ field }) => (
                        <Input id="secondaryGuardian.phone" {...field} />
                      )}
                    />
                    {errors.secondaryGuardian?.phone && (
                      <p className="text-sm text-destructive">
                        {errors.secondaryGuardian.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryGuardian.email">
                      Email Address *
                    </Label>
                    <Controller
                      name="secondaryGuardian.email"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="secondaryGuardian.email"
                          type="email"
                          {...field}
                        />
                      )}
                    />
                    {errors.secondaryGuardian?.email && (
                      <p className="text-sm text-destructive">
                        {errors.secondaryGuardian.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryGuardian.occupation">
                      Occupation *
                    </Label>
                    <Controller
                      name="secondaryGuardian.occupation"
                      control={control}
                      render={({ field }) => (
                        <Input id="secondaryGuardian.occupation" {...field} />
                      )}
                    />
                    {errors.secondaryGuardian?.occupation && (
                      <p className="text-sm text-destructive">
                        {errors.secondaryGuardian.occupation.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondaryGuardian.address">Address *</Label>
                    <Controller
                      name="secondaryGuardian.address"
                      control={control}
                      render={({ field }) => (
                        <Input id="secondaryGuardian.address" {...field} />
                      )}
                    />
                    {errors.secondaryGuardian?.address && (
                      <p className="text-sm text-destructive">
                        {errors.secondaryGuardian.address.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={removeSecondaryGuardian}
                >
                  <Trash2 className="mr-2 size-4" />
                  Remove Secondary Guardian
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Household Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address">Residential Address *</Label>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => <Input id="address" {...field} />}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">
                      {errors.address.message}
                    </p>
                  )}
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
                          <SelectItem value="MARRIED">Married</SelectItem>
                          <SelectItem value="SINGLE">Single</SelectItem>
                          <SelectItem value="DIVORCED">Divorced</SelectItem>
                          <SelectItem value="WIDOWED">Widowed</SelectItem>
                          <SelectItem value="SEPARATED">Separated</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Enrollment</CardTitle>
            <p className="text-sm text-muted-foreground">
              Optional: Enroll the student in a class
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="classId">Class</Label>
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
                          {classes?.data?.map((cls: any) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passportPhoto">Passport Photo</Label>
                <Input
                  id="passportPhoto"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setPassportPhoto(e.target.files?.[0] || null)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/students')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Student'
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
