import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/lib/api/staff";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Mail, Phone, User, Calendar, MapPin, Briefcase, GraduationCap, Building, Users, DollarSign, ShieldCheck, ShieldX } from "lucide-react";
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
      <AdminLayout>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/staff")}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Staff Details</h1>
              <p className="text-sm text-muted-foreground">Loading staff information...</p>
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

  if (!staff?.data) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/staff")}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Staff Details</h1>
              <p className="text-sm text-muted-foreground">Staff not found</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Staff not found</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const staffData = staff.data;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/staff")}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Staff Details</h1>
              <p className="text-sm text-muted-foreground">
                {staffData.firstName} {staffData.middleName && staffData.middleName + " "}{staffData.lastName}
              </p>
            </div>
          </div>
          <Button onClick={() => navigate(`/admin/staff/${staffId}/edit`)}>
            Edit Staff
          </Button>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium">{staffData.firstName} {staffData.middleName && staffData.middleName + " "}{staffData.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{staffData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{staffData.phone || "N/A"}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Staff ID</p>
                  <p className="font-medium">{staffData.staffId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant="outline">{staffData.role}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{staffData.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={staffData.status === "ACTIVE" ? "default" : "secondary"}>
                    {staffData.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                {staffData.dateOfBirth && (
                  <div className="flex items-center gap-3">
                    <Calendar className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{new Date(staffData.dateOfBirth).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{staffData.gender || "N/A"}</p>
                </div>
                {staffData.maritalStatus && (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">Marital Status</p>
                    <p className="font-medium">{staffData.maritalStatus}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{staffData.address || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">{staffData.nationality || "N/A"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">State</p>
                  <p className="font-medium">{staffData.state || "N/A"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">LGA</p>
                  <p className="font-medium">{staffData.lga || "N/A"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Religion</p>
                  <p className="font-medium">{staffData.religion || "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="size-5" />
              Employment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                {staffData.dateOfEmployment && (
                  <div className="flex items-center gap-3">
                    <Calendar className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Employment</p>
                      <p className="font-medium">{new Date(staffData.dateOfEmployment).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Years of Experience</p>
                  <p className="font-medium">{staffData.yearsOfExperience || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-4">
                {staffData.subject && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned Subject</p>
                      <p className="font-medium">{staffData.subject.subjectName} ({staffData.subject.subjectCode})</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Qualifications */}
        {staffData.qualifications && staffData.qualifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="size-5" />
                Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Degree</TableHead>
                      <TableHead>Institution</TableHead>
                      <TableHead>Year</TableHead>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="size-5" />
                Previous Employment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Period</TableHead>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Next of Kin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  {staffData.nextOfKinName && (
                    <div className="flex items-center gap-3">
                      <User className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{staffData.nextOfKinName}</p>
                      </div>
                    </div>
                  )}
                  {staffData.nextOfKinPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{staffData.nextOfKinPhone}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {staffData.nextOfKinRelationship && (
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-muted-foreground">Relationship</p>
                      <p className="font-medium">{staffData.nextOfKinRelationship}</p>
                    </div>
                  )}
                  {staffData.nextOfKinAddress && (
                    <div className="flex items-center gap-3">
                      <MapPin className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{staffData.nextOfKinAddress}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Financial Information */}
        {staffData.financialRecord && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="size-5" />
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  {staffData.financialRecord.salary && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Salary</p>
                        <p className="font-medium">{staffData.financialRecord.salary.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  {staffData.financialRecord.bankName && (
                    <div className="flex items-center gap-3">
                      <Building className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Bank Name</p>
                        <p className="font-medium">{staffData.financialRecord.bankName}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {staffData.financialRecord.bankAccountNumber && (
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="font-medium">{staffData.financialRecord.bankAccountNumber}</p>
                    </div>
                  )}
                  {staffData.financialRecord.bankAccountName && (
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-muted-foreground">Account Name</p>
                      <p className="font-medium">{staffData.financialRecord.bankAccountName}</p>
                    </div>
                  )}
                  {staffData.financialRecord.taxId && (
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-muted-foreground">Tax ID</p>
                      <p className="font-medium">{staffData.financialRecord.taxId}</p>
                    </div>
                  )}
                  {staffData.financialRecord.pensionNumber && (
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-muted-foreground">Pension Number</p>
                      <p className="font-medium">{staffData.financialRecord.pensionNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}