import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Mail, Phone, User, Calendar, MapPin, GraduationCap, Heart, Users, BookOpen, Briefcase, DollarSign } from "lucide-react";
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
      <AdminLayout>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/students")}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Student Details</h1>
              <p className="text-sm text-muted-foreground">Loading student information...</p>
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

  if (!student?.data) {
    return (
      <AdminLayout>
        <div className="mx-auto max-w-[1500px] space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/students")}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Student Details</h1>
              <p className="text-sm text-muted-foreground">Student not found</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Student not found</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const studentData = student.data;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/students")}>
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Student Details</h1>
              <p className="text-sm text-muted-foreground">
                {studentData.firstName} {studentData.middleName && studentData.middleName + " "}{studentData.lastName}
              </p>
            </div>
          </div>
          <Button onClick={() => navigate(`/admin/students/${admissionNumber}/edit`)}>
            Edit Student
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
                    <p className="font-medium">{studentData.firstName} {studentData.middleName && studentData.middleName + " "}{studentData.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">{new Date(studentData.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={studentData.status === "ACTIVE" ? "default" : "secondary"}>
                    {studentData.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Admission Number</p>
                  <p className="font-medium">{studentData.admissionNumber}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-medium">{studentData.gender}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Admission Date</p>
                  <p className="font-medium">{new Date(studentData.admissionDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact & Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium">{studentData.address || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p className="font-medium">{studentData.nationality || "N/A"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">State</p>
                  <p className="font-medium">{studentData.state || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">LGA</p>
                  <p className="font-medium">{studentData.lga || "N/A"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Religion</p>
                  <p className="font-medium">{studentData.religion || "N/A"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Student Type</p>
                  <p className="font-medium">{studentData.studentType || "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health & Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="size-5" />
              Health & Medical Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Health Info</p>
                  <p className="font-medium">{studentData.healthInfo || "N/A"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{studentData.bloodGroup || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Sport House</p>
                  <p className="font-medium">{studentData.sportHouse || "N/A"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Intake Type</p>
                  <p className="font-medium">{studentData.intakeType || "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Current Class</p>
                    <p className="font-medium">{studentData.class?.name || "Not enrolled"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">Section</p>
                  <p className="font-medium">{studentData.section?.name || "N/A"}</p>
                </div>
              </div>
              <div className="space-y-4">
                {studentData.graduationDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Graduation Date</p>
                      <p className="font-medium">{new Date(studentData.graduationDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enrollment History */}
            {studentData.enrollments && studentData.enrollments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Enrollment History</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Status</TableHead>
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
                            <Badge variant={enrollment.status === "ACTIVE" ? "default" : "secondary"}>
                              {enrollment.status}
                            </Badge>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-5" />
                Parent/Guardian Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Primary Guardian</p>
                      <p className="font-medium">{studentData.parent.primaryGuardian?.firstName} {studentData.parent.primaryGuardian?.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{studentData.parent.accountEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="size-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{studentData.parent.accountPhone}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {studentData.parent.secondaryGuardian && (
                    <div className="flex items-center gap-3">
                      <User className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Secondary Guardian</p>
                    <p className="font-medium">{studentData.parent.secondaryGuardian.firstName} {studentData.parent.secondaryGuardian.lastName}</p>
                  </div>
                </div>
                  )}
                  {studentData.parent.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{studentData.parent.address}</p>
                      </div>
                    </div>
                  )}
                  {studentData.parent.maritalStatus && (
                    <div className="flex items-center gap-3">
                      <p className="text-sm text-muted-foreground">Marital Status</p>
                      <p className="font-medium">{studentData.parent.maritalStatus}</p>
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