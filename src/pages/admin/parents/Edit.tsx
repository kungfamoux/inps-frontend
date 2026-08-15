import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Skeleton } from '@/components/ui/skeleton';

const guardianSchema = z.object({
  relationship: z.string().min(1, 'Relationship is required'),
  title: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address').or(z.literal('')).optional(),
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

const parentSchema = z.object({
  accountEmail: z.string().email('Invalid email address'),
  accountPhone: z.string().min(1, 'Phone number is required'),
  primaryGuardian: guardianSchema,
  secondaryGuardian: secondaryGuardianSchema.optional(),
  address: z.string().optional(),
  maritalStatus: z
    .enum(['MARRIED', 'SINGLE', 'DIVORCED', 'WIDOWED', 'SEPARATED'])
    .optional(),
});

type ParentFormData = z.infer<typeof parentSchema>;

export default function EditParent() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [showSecondaryGuardian, setShowSecondaryGuardian] = useState(false);

  const { data: parent, isLoading: parentLoading } = useQuery({
    queryKey: ['parent', id],
    queryFn: () => adminApi.getParentById(id!),
    enabled: !!id,
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ParentFormData>({
    resolver: zodResolver(parentSchema),
  });

  useEffect(() => {
    if (parent?.data) {
      setValue('accountEmail', parent.data.accountEmail);
      setValue('accountPhone', parent.data.accountPhone);
      setValue('address', parent.data.address || '');
      setValue('maritalStatus', parent.data.maritalStatus || '');

      if (parent.data.primaryGuardian) {
        setValue('primaryGuardian', parent.data.primaryGuardian);
      }

      if (parent.data.secondaryGuardian) {
        setValue('secondaryGuardian', parent.data.secondaryGuardian);
        setShowSecondaryGuardian(true);
      }
    }
  }, [parent, setValue]);

  const updateParentMutation = useMutation({
    mutationFn: (data: ParentFormData) => adminApi.updateParent(id!, data),
    onSuccess: () => {
      toast.success('Parent updated successfully');
      navigate('/admin/parents');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update parent');
    },
  });

  const onSubmit = (data: ParentFormData) => {
    updateParentMutation.mutate(data);
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

  if (parentLoading) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/parents')}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Parent</h1>
              <p className="text-sm text-muted-foreground">
                Loading parent information...
              </p>
            </div>
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

  if (!parent?.data) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/parents')}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Parent</h1>
              <p className="text-sm text-muted-foreground">Parent not found</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Parent not found
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
            onClick={() => navigate('/admin/parents')}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Parent</h1>
            <p className="text-sm text-muted-foreground">
              {parent.data.primaryGuardian?.firstName}{' '}
              {parent.data.primaryGuardian?.lastName}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="accountEmail">Account Email *</Label>
                  <Controller
                    name="accountEmail"
                    control={control}
                    render={({ field }) => (
                      <Input id="accountEmail" {...field} />
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
            </form>
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
                  <Label htmlFor="primaryGuardian.phone">Phone Number *</Label>
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
                      <Input id="primaryGuardian.email" {...field} />
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
                      Phone Number *
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
                        <Input id="secondaryGuardian.email" {...field} />
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
                  <Label htmlFor="address">Residential Address</Label>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => <Input id="address" {...field} />}
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

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/parents')}
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
                Updating...
              </>
            ) : (
              'Update Parent'
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
