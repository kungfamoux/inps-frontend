import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EntityAvatar } from '@/components/admin/lists/EntityAvatar';
import { StatusDotBadge } from '@/components/admin/lists/StatusDotBadge';
import { Badge } from '@/components/ui/badge';
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
  Edit,
} from 'lucide-react';
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
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/parents')}
              className="rounded-xl"
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

  if (!parent?.data) {
    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/parents')}
              className="rounded-xl"
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
          <Card className="shadow-md">
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Parent not found
              </p>
            </CardContent>
          </Card>
        </div>
    );
  }

  const parentData = parent.data;

  return (
      <div className="mx-auto max-w-[1500px] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin/parents')}
              className="rounded-xl"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Parent Details
              </h1>
              <p className="text-sm text-muted-foreground">
                {parentData.primaryGuardian?.firstName} {parentData.primaryGuardian?.lastName}
              </p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => navigate(`/admin/parents/${id}/edit`)}>
            <Edit className="size-4" /> Edit Parent
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
              <div className="flex-shrink-0">
                <EntityAvatar
                  name={`${parentData.primaryGuardian?.firstName} ${parentData.primaryGuardian?.lastName}`}
                  shape="circle"
                  className="size-24 text-2xl"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {parentData.primaryGuardian?.title}{' '}
                      {parentData.primaryGuardian?.firstName}{' '}
                      {parentData.primaryGuardian?.lastName}
                    </h2>
                    <p className="text-muted-foreground">{parentData.accountEmail}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{parentData.accountPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Children:</span>
                    <span className="font-medium">{parentData.students?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Primary Guardian Information */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <User className="size-4" />
                </div>
                Primary Guardian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Relationship</p>
                  <p className="font-semibold text-foreground">{parentData.primaryGuardian?.relationship}</p>
                </div>
                {parentData.primaryGuardian?.occupation && (
                  <div>
                    <p className="text-muted-foreground">Occupation</p>
                    <p className="font-semibold text-foreground">{parentData.primaryGuardian.occupation}</p>
                  </div>
                )}
                {parentData.primaryGuardian?.address && (
                  <div>
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-semibold text-foreground">{parentData.primaryGuardian.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <Mail className="size-4" />
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">{parentData.accountEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-semibold text-foreground">{parentData.accountPhone}</p>
                </div>
                {parentData.address && (
                  <div>
                    <p className="text-muted-foreground">Household Address</p>
                    <p className="font-semibold text-foreground">{parentData.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Guardian */}
        {parentData.secondaryGuardian && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <User className="size-4" />
                </div>
                Secondary Guardian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-semibold text-foreground">
                      {parentData.secondaryGuardian?.title}{' '}
                      {parentData.secondaryGuardian?.firstName}{' '}
                      {parentData.secondaryGuardian?.lastName}
                    </p>
                  </div>
                  {parentData.secondaryGuardian?.email && (
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold text-foreground">{parentData.secondaryGuardian.email}</p>
                    </div>
                  )}
                  {parentData.secondaryGuardian?.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-semibold text-foreground">{parentData.secondaryGuardian.phone}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Relationship</p>
                    <p className="font-semibold text-foreground">{parentData.secondaryGuardian?.relationship}</p>
                  </div>
                  {parentData.secondaryGuardian?.occupation && (
                    <div>
                      <p className="text-sm text-muted-foreground">Occupation</p>
                      <p className="font-semibold text-foreground">{parentData.secondaryGuardian.occupation}</p>
                    </div>
                  )}
                  {parentData.secondaryGuardian?.address && (
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-semibold text-foreground">{parentData.secondaryGuardian.address}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Children */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <Users className="size-4" />
              </div>
              Linked Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {parentData.students && parentData.students.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Admission No</TableHead>
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Name</TableHead>
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Gender</TableHead>
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Class</TableHead>
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      <TableHead className="h-12 text-right text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
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
                          {student.class?.name || 'Not enrolled'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'} className="rounded-lg">
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
                  <Users className="size-8" />
                </div>
                <p className="text-sm font-medium">No linked students found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
