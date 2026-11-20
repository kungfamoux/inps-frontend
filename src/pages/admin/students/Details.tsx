import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EntityAvatar } from "@/components/admin/lists/EntityAvatar";
import { StatusDotBadge } from "@/components/admin/lists/StatusDotBadge";
import { ArrowLeft, Mail, Phone, User, Calendar, MapPin, GraduationCap, Heart, Users, BookOpen, Briefcase, DollarSign, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StudentDetails() {
  const navigate = useNavigate();
  const { admissionNumber } = useParams<{ admissionNumber: string }>();

  const { data: student, isLoading } = useQuery({
    queryKey: ["student", admissionNumber],
    queryFn: () => adminApi.getStudentByAdmissionNumber(admissionNumber!),
    enabled: !!admissionNumber,
  });

  if (isLoading) {
    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/students")} className="rounded-xl">
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Student Details</h1>
              <p className="text-sm text-muted-foreground">Loading student information...</p>
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

  if (!student?.data) {
    return (
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/students")} className="rounded-xl">
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Student Details</h1>
              <p className="text-sm text-muted-foreground">Student not found</p>
            </div>
          </div>
          <Card className="shadow-md">
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Student not found</p>
            </CardContent>
          </Card>
        </div>
    );
  }

  const studentData = student.data;

  return (
      <div className="mx-auto max-w-[1500px] space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/students")} className="rounded-xl">
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Student Details</h1>
              <p className="text-sm text-muted-foreground">
                {studentData.firstName} {studentData.middleName && studentData.middleName + " "}{studentData.lastName}
              </p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => navigate(`/admin/students/${admissionNumber}/edit`)}>
            <Edit className="size-4" /> Edit Student
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
              <div className="flex-shrink-0">
                <EntityAvatar
                  name={`${studentData.firstName} ${studentData.lastName}`}
                  shape="circle"
                  className="size-24 text-2xl"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {studentData.firstName} {studentData.middleName && studentData.middleName + " "}{studentData.lastName}
                    </h2>
                    <p className="text-muted-foreground">{studentData.admissionNumber}</p>
                  </div>
                  <StatusDotBadge status={studentData.status} />
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">DOB:</span>
                    <span className="font-medium">{new Date(studentData.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Gender:</span>
                    <span className="font-medium">{studentData.gender}</span>
                  </div>
                  {studentData.class && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Class:</span>
                      <span className="font-medium">{studentData.class.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <User className="size-4" />
                </div>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Admission Number</p>
                  <p className="font-semibold text-foreground">{studentData.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Admission Date</p>
                  <p className="font-semibold text-foreground">{new Date(studentData.admissionDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Student Type</p>
                  <p className="font-semibold text-foreground">{studentData.studentType || "N/A"}</p>
                </div>
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
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-semibold text-foreground">{studentData.address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">State</p>
                  <p className="font-semibold text-foreground">{studentData.state || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">LGA</p>
                  <p className="font-semibold text-foreground">{studentData.lga || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <Briefcase className="size-4" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Nationality</p>
                  <p className="font-semibold text-foreground">{studentData.nationality || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Religion</p>
                  <p className="font-semibold text-foreground">{studentData.religion || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Marital Status (Parent)</p>
                  <p className="font-semibold text-foreground">{studentData.parent?.maritalStatus || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health Information */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <Heart className="size-4" />
                </div>
                Health Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Blood Group</p>
                  <p className="font-semibold text-foreground">{studentData.bloodGroup || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Health Info</p>
                  <p className="font-semibold text-foreground">{studentData.healthInfo || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sport House</p>
                  <p className="font-semibold text-foreground">{studentData.sportHouse || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Academic Information */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <GraduationCap className="size-4" />
              </div>
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Class</p>
                  <p className="font-semibold text-foreground">{studentData.class?.name || "Not enrolled"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="font-semibold text-foreground">{studentData.section?.name || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-4">
                {studentData.graduationDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Graduation Date</p>
                    <p className="font-semibold text-foreground">{new Date(studentData.graduationDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Enrollment History */}
            {studentData.enrollments && studentData.enrollments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Enrollment History</h3>
                <div className="overflow-hidden rounded-xl border border-border/50">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Academic Year</TableHead>
                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Term</TableHead>
                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Class</TableHead>
                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Section</TableHead>
                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentData.enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">{enrollment.academicYear}</TableCell>
                          <TableCell>{enrollment.term}</TableCell>
                          <TableCell>{enrollment.class?.name || "N/A"}</TableCell>
                          <TableCell>{enrollment.section?.name || "N/A"}</TableCell>
                          <TableCell>
                            <StatusDotBadge status={enrollment.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parent Information */}
        {studentData.parent && (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="flex size-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600">
                  <Users className="size-4" />
                </div>
                Parent/Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Guardian</p>
                    <p className="font-semibold text-foreground">{studentData.parent.primaryGuardian?.firstName} {studentData.parent.primaryGuardian?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold text-foreground">{studentData.parent.accountEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold text-foreground">{studentData.parent.accountPhone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {studentData.parent.secondaryGuardian && (
                    <div>
                      <p className="text-sm text-muted-foreground">Secondary Guardian</p>
                      <p className="font-semibold text-foreground">{studentData.parent.secondaryGuardian.firstName} {studentData.parent.secondaryGuardian.lastName}</p>
                    </div>
                  )}
                  {studentData.parent.address && (
                    <div>
                      <p className="text-sm text-muted-foreground">Parent Address</p>
                      <p className="font-semibold text-foreground">{studentData.parent.address}</p>
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