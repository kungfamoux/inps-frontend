import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Mail,
  Phone,
  Users,
  User,
  Calendar,
  MapPin,
  Eye,
  Briefcase,
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

export default function ParentDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: parent, isLoading } = useQuery({
    queryKey: ['parent', id],
    queryFn: () => adminApi.getParentById(id!),
    enabled: !!id,
  });

  if (isLoading) {
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
              <h1 className="text-2xl font-bold tracking-tight">
                Parent Details
              </h1>
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
              <h1 className="text-2xl font-bold tracking-tight">
                Parent Details
              </h1>
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

  const parentData = parent.data;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/parents')}
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Parent Details
              </h1>
              <p className="text-sm text-muted-foreground">
                {parentData.firstName} {parentData.lastName}
              </p>
            </div>
          </div>
          <Button onClick={() => navigate(`/admin/parents/${id}/edit`)}>
            Edit Parent
          </Button>
        </div>

        {/* Primary Guardian Information */}
        <Card>
          <CardHeader>
            <CardTitle>Primary Guardian Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">
                      {parentData.primaryGuardian?.title}{' '}
                      {parentData.primaryGuardian?.firstName}{' '}
                      {parentData.primaryGuardian?.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{parentData.accountEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{parentData.accountPhone}</p>
                  </div>
                </div>
                {parentData.primaryGuardian?.occupation && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Occupation
                      </p>
                      <p className="font-medium">
                        {parentData.primaryGuardian.occupation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Relationship</p>
                  <p className="font-medium">
                    {parentData.primaryGuardian?.relationship}
                  </p>
                </div>
                {parentData.primaryGuardian?.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {parentData.primaryGuardian.address}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      parentData.status === 'ACTIVE' ? 'default' : 'secondary'
                    }
                  >
                    {parentData.status}
                  </Badge>
                </div>
                {parentData.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Household Address
                      </p>
                      <p className="font-medium">{parentData.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secondary Guardian Information */}
        {parentData.secondaryGuardian && (
          <Card>
            <CardHeader>
              <CardTitle>Secondary Guardian Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">
                        {parentData.secondaryGuardian?.title}{' '}
                        {parentData.secondaryGuardian?.firstName}{' '}
                        {parentData.secondaryGuardian?.lastName}
                      </p>
                    </div>
                  </div>
                  {parentData.secondaryGuardian?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">
                          {parentData.secondaryGuardian.email}
                        </p>
                      </div>
                    </div>
                  )}
                  {parentData.secondaryGuardian?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">
                          {parentData.secondaryGuardian.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {parentData.secondaryGuardian?.occupation && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Occupation
                        </p>
                        <p className="font-medium">
                          {parentData.secondaryGuardian.occupation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">
                      Relationship
                    </p>
                    <p className="font-medium">
                      {parentData.secondaryGuardian?.relationship}
                    </p>
                  </div>
                  {parentData.secondaryGuardian?.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">
                          {parentData.secondaryGuardian.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Children */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Linked Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {parentData.students && parentData.students.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admission No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parentData.students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.admissionNumber}
                        </TableCell>
                        <TableCell>
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.gender}</TableCell>
                        <TableCell>
                          {student.enrollments?.[0]?.class?.className ||
                            'Not enrolled'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.status === 'ACTIVE'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {student.status}
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No linked students found
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
