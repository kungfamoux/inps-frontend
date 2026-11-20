import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/lib/api/staff";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityAvatar } from "@/components/admin/lists/EntityAvatar";
import { StatusDotBadge } from "@/components/admin/lists/StatusDotBadge";
import { ArrowLeft, Mail, Phone, User, Calendar, MapPin, Briefcase, GraduationCap, Building, Edit, Users, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MaritalStatus } from "@/lib/types/staff";

export default function StaffDetails() {
  const navigate = useNavigate();
  const { staffId } = useParams<{ staffId: string }>();

  const { data: staff, isLoading } = useQuery({
    queryKey: ["staff", staffId],
    queryFn: () => staffApi.getStaffById(staffId!),
    enabled: !!staffId,
  });

  if (isLoading) {
    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/staff")} className="rounded-xl">
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Staff Details</h1>
              <p className="text-sm text-muted-foreground">Loading staff information...</p>
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

  if (!staff?.data) {
    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/staff")} className="rounded-xl">
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Staff Details</h1>
              <p className="text-sm text-muted-foreground">Staff not found</p>
            </div>
          </div>
          <Card className="shadow-md">
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Staff not found</p>
            </CardContent>
          </Card>
        </div>
    );
  }

  const staffData = staff.data;

  return (
      <div className="mx-auto max-w-[1500px] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/staff")} className="rounded-xl">
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Staff Details</h1>
              <p className="text-sm text-muted-foreground">
                {staffData.firstName} {staffData.middleName && staffData.middleName + " "}{staffData.lastName}
              </p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => navigate(`/admin/staff/${staffId}/edit`)}>
            <Edit className="size-4" /> Edit Staff
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
              <div className="flex-shrink-0">
                <EntityAvatar
                  name={`${staffData.firstName} ${staffData.lastName}`}
                  shape="circle"
                  className="size-24 text-2xl"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {staffData.firstName} {staffData.middleName && staffData.middleName + " "}{staffData.lastName}
                    </h2>
                    <p className="text-muted-foreground">{staffData.staffId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-lg">{staffData.role}</Badge>
                    <StatusDotBadge status={staffData.status} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{staffData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{staffData.phone || "N/A"}</span>
                  </div>
                  {staffData.dateOfEmployment && (
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Employed:</span>
                      <span className="font-medium">{new Date(staffData.dateOfEmployment).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <User className="size-4" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 text-sm">
                {staffData.dateOfBirth && (
                  <div>
                    <p className="text-muted-foreground">Date of Birth</p>
                    <p className="font-semibold text-foreground">{new Date(staffData.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Gender</p>
                  <p className="font-semibold text-foreground">{staffData.gender || "N/A"}</p>
                </div>
                {staffData.maritalStatus && (
                  <div>
                    <p className="text-muted-foreground">Marital Status</p>
                    <p className="font-semibold text-foreground">{staffData.maritalStatus}</p>
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
                  <MapPin className="size-4" />
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-semibold text-foreground">{staffData.address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">State</p>
                  <p className="font-semibold text-foreground">{staffData.state || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">LGA</p>
                  <p className="font-semibold text-foreground">{staffData.lga || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <Briefcase className="size-4" />
                </div>
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-semibold text-foreground">{staffData.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Years of Experience</p>
                  <p className="font-semibold text-foreground">{staffData.yearsOfExperience || "N/A"}</p>
                </div>
                {staffData.subject && (
                  <div>
                    <p className="text-muted-foreground">Assigned Subject</p>
                    <p className="font-semibold text-foreground">{staffData.subject.subjectName} ({staffData.subject.subjectCode})</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Other Information */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Users className="size-4" />
                </div>
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nationality</p>
                  <p className="font-semibold text-foreground">{staffData.nationality || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Religion</p>
                  <p className="font-semibold text-foreground">{staffData.religion || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Qualifications */}
        {staffData.qualifications && staffData.qualifications.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                  <GraduationCap className="size-4" />
                </div>
                Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Degree</TableHead>
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Institution</TableHead>
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Year</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffData.qualifications.map((qualification, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{qualification.degree}</TableCell>
                        <TableCell>{qualification.institution}</TableCell>
                        <TableCell>{qualification.year}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Previous Employment */}
        {staffData.previousEmployment && staffData.previousEmployment.length > 0 && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <Building className="size-4" />
                </div>
                Previous Employment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Company</TableHead>
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Position</TableHead>
                      <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffData.previousEmployment.map((employment, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{employment.company}</TableCell>
                        <TableCell>{employment.position}</TableCell>
                        <TableCell>{employment.period}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next of Kin */}
        {(staffData.nextOfKinName || staffData.nextOfKinPhone || staffData.nextOfKinRelationship || staffData.nextOfKinAddress) && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <Users className="size-4" />
                </div>
                Next of Kin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  {staffData.nextOfKinName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-semibold text-foreground">{staffData.nextOfKinName}</p>
                    </div>
                  )}
                  {staffData.nextOfKinPhone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-semibold text-foreground">{staffData.nextOfKinPhone}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {staffData.nextOfKinRelationship && (
                    <div>
                      <p className="text-sm text-muted-foreground">Relationship</p>
                      <p className="font-semibold text-foreground">{staffData.nextOfKinRelationship}</p>
                    </div>
                  )}
                  {staffData.nextOfKinAddress && (
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-semibold text-foreground">{staffData.nextOfKinAddress}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Information */}
        {staffData.financialRecord && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <DollarSign className="size-4" />
                </div>
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  {staffData.financialRecord.salary && (
                    <div>
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="font-semibold text-foreground">{staffData.financialRecord.salary.toLocaleString()}</p>
                    </div>
                  )}
                  {staffData.financialRecord.bankName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Bank Name</p>
                      <p className="font-semibold text-foreground">{staffData.financialRecord.bankName}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {staffData.financialRecord.bankAccountNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="font-semibold text-foreground">{staffData.financialRecord.bankAccountNumber}</p>
                    </div>
                  )}
                  {staffData.financialRecord.bankAccountName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Account Name</p>
                      <p className="font-semibold text-foreground">{staffData.financialRecord.bankAccountName}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}