import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Users,
  ChevronRight,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import { Term, EnrollmentStatus } from "@/lib/types/common";

interface Section {
  id: string;
  name: string;
  color?: string;
  roomNumber?: string;
  currentEnrollment: number;
  status: string;
}

interface Class {
  id: string;
  name: string;
  className?: string;
  level: string;
  status: string;
  sections: Section[];
}

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  enrollments?: Array<{
    id: string;
    sectionId: string;
    section?: { id: string; name: string };
    status: string;
  }>;
}

interface Enrollment {
  id: string;
  student: {
    id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
  };
  sectionId: string;
  section?: {
    id: string;
    name: string;
  };
  status: string;
}

export default function BulkTransfer() {
  const navigate = useNavigate();
  const { classId } = useParams<{ classId: string }>();

  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [transferMode, setTransferMode] = useState<"section" | "class">("section");
  const [targetClassId, setTargetClassId] = useState("");
  const [targetSectionId, setTargetSectionId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any[] | null>(null);

  // Fetch current class details
  const { data: classData, isLoading: classLoading } = useQuery({
    queryKey: ["class", classId],
    queryFn: () => adminApi.getClassById(classId!),
    enabled: !!classId,
  });

  // Fetch all classes for transfer destinations
  const { data: allClasses } = useQuery({
    queryKey: ["classesWithSections"],
    queryFn: () => adminApi.getAllClassesWithSections(),
  });

  // Fetch current session/term
  const { data: currentTerm } = useQuery({
    queryKey: ["currentTerm"],
    queryFn: () => adminApi.getCurrentTerm(),
  });

  // Fetch students in current class
  const { data: enrollmentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["enrollmentsByClass", classId, currentTerm?.data?.session?.session, currentTerm?.data?.term],
    queryFn: () => adminApi.getEnrollmentsByClass(
      classId!,
      currentTerm?.data?.session?.session || "",
      currentTerm?.data?.term || Term.FIRST_TERM,
      EnrollmentStatus.ACTIVE
    ),
    enabled: !!classId && !!currentTerm?.data,
  });

  const currentClass = classData?.data;
  const enrollments = enrollmentsData?.data || [];
  const targetClass = allClasses?.data?.find((c: Class) => c.id === targetClassId);
  const targetSection = targetClass?.sections?.find((s: Section) => s.id === targetSectionId);

  const handleSelectAll = () => {
    if (selectedStudents.size === enrollments.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(enrollments.map((e: any) => e.student?.id).filter(Boolean)));
    }
  };

  const handleSelectStudent = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const handleClearSelection = () => {
    setSelectedStudents(new Set());
  };

  const handleTransfer = async () => {
    if (selectedStudents.size === 0) {
      setError("Please select at least one student to transfer");
      return;
    }

    if (!targetSectionId) {
      setError("Please select a target section");
      return;
    }

    if (transferMode === "class" && !targetClassId) {
      setError("Please select a target class");
      return;
    }

    setIsTransferring(true);
    setError("");
    setResults(null);

    try {
      const transfers = enrollments
        .filter((e: any) => selectedStudents.has(e.student?.id))
        .map((e: any) => ({
          enrollmentId: e.id,
          newClassId: transferMode === "class" ? targetClassId : undefined,
          newSectionId: targetSectionId,
        }));

      const response = await adminApi.bulkTransferStudentsWithClass(transfers);
      setResults(response.data?.results || []);
    } catch (err: any) {
      setError(err.message || "Failed to transfer students");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleReset = () => {
    setSelectedStudents(new Set());
    setTransferMode("section");
    setTargetClassId("");
    setTargetSectionId("");
    setSearchTerm("");
    setError("");
    setResults(null);
  };

  const filteredEnrollments = enrollments.filter((e: any) =>
    e.student?.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${e.student?.firstName} ${e.student?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const successCount = results?.filter((r) => r.success).length || 0;
  const failureCount = results?.filter((r) => !r.success).length || 0;

  if (classLoading || studentsLoading) {
    return (
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/classes/${classId}`)}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bulk Transfer</h1>
            <p className="text-sm text-muted-foreground">Loading...</p>
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
    );
  }

  if (!currentClass) {
    return (
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/classes")}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bulk Transfer</h1>
            <p className="text-sm text-muted-foreground">Class not found</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Class not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/classes/${classId}`)}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bulk Transfer</h1>
            <p className="text-sm text-muted-foreground">
              Classes / {currentClass.className || currentClass.name} / Bulk Transfer
            </p>
          </div>
        </div>

        {/* Class Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Class Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Class Name</p>
                <p className="font-medium text-lg">{currentClass.className || currentClass.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="font-medium text-lg">{currentClass.level}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="font-medium text-lg">{enrollments.length}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Academic Session</p>
                <p className="font-medium text-lg">{currentTerm?.data?.session?.session || "N/A"}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Sections</p>
              <div className="flex flex-wrap gap-2">
                {currentClass.sections?.map((section: Section) => (
                  <Badge key={section.id} variant="outline">
                    {section.name} ({section.currentEnrollment || 0})
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Selection */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>Select Students to Transfer</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full md:w-[300px] border rounded-md px-3 py-2"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="size-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedStudents.size > 0 && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-900">
                    {selectedStudents.size} student(s) selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSelection}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleClearSelection}>
                    Clear Selection
                  </Button>
                </div>
              </div>
            )}

            {filteredEnrollments.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No students found</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedStudents.size === filteredEnrollments.length && filteredEnrollments.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Admission No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Current Section</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEnrollments.map((enrollment: any) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.has(enrollment.student?.id)}
                            onCheckedChange={() => handleSelectStudent(enrollment.student?.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{enrollment.student?.admissionNumber}</TableCell>
                        <TableCell>
                          {enrollment.student?.firstName} {enrollment.student?.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{enrollment.section?.name || "Not assigned"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={enrollment.status === EnrollmentStatus.ACTIVE ? "default" : "secondary"}>
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transfer Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transfer Mode */}
            <div className="space-y-2">
              <Label>Transfer Mode</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={transferMode === "section" ? "default" : "outline"}
                  onClick={() => {
                    setTransferMode("section");
                    setTargetClassId("");
                    setTargetSectionId("");
                  }}
                  size="sm"
                >
                  Section Only
                </Button>
                <Button
                  type="button"
                  variant={transferMode === "class" ? "default" : "outline"}
                  onClick={() => {
                    setTransferMode("class");
                    setTargetSectionId("");
                  }}
                  size="sm"
                >
                  Class + Section
                </Button>
              </div>
            </div>

            {/* Target Class Selection */}
            {transferMode === "class" && (
              <div className="space-y-2">
                <Label htmlFor="targetClass">Target Class</Label>
                <Select value={targetClassId} onValueChange={setTargetClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class to transfer to" />
                  </SelectTrigger>
                  <SelectContent>
                    {allClasses?.data?.map((cls: Class) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.className || cls.name} ({cls.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Target Section Selection */}
            <div className="space-y-2">
              <Label htmlFor="targetSection">Target Section</Label>
              <Select
                value={targetSectionId}
                onValueChange={setTargetSectionId}
                disabled={transferMode === "class" && !targetClassId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select section to transfer to" />
                </SelectTrigger>
                <SelectContent>
                  {transferMode === "class"
                    ? targetClass?.sections?.map((section: Section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name} ({section.currentEnrollment || 0} students)
                        </SelectItem>
                      ))
                    : currentClass.sections?.map((section: Section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name} ({section.currentEnrollment || 0} students)
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            {/* Transfer Preview */}
            {targetSection && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-3">Transfer Preview</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Source Class</p>
                    <p className="font-medium">{currentClass.className || currentClass.name}</p>
                    <p className="text-sm text-muted-foreground">Students to transfer: {selectedStudents.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Section</p>
                    <p className="font-medium">
                      {transferMode === "class" ? targetClass?.className || targetClass?.name : currentClass.className || currentClass.name} - {targetSection?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Current enrollment: {targetSection?.currentEnrollment || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      After transfer: {(targetSection?.currentEnrollment || 0) + selectedStudents.size}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
                <AlertCircle className="size-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Results Display */}
            {results && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="size-5" />
                  <span className="font-semibold">Transfer Complete</span>
                </div>
                <div className="mt-2 text-sm text-green-600">
                  {successCount} succeeded, {failureCount} failed
                </div>
                {failureCount > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-sm text-green-700 mb-2">Failed Transfers:</p>
                    <div className="space-y-1">
                      {results.filter((r) => !r.success).map((r, i) => (
                        <div key={i} className="text-sm text-red-600">
                          {r.enrollmentId}: {r.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleReset} disabled={isTransferring}>
                Reset
              </Button>
              <Button
                onClick={handleTransfer}
                disabled={!targetSectionId || selectedStudents.size === 0 || isTransferring || (transferMode === "class" && !targetClassId)}
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Transferring {selectedStudents.size} student(s)...
                  </>
                ) : (
                  `Transfer ${selectedStudents.size} Student(s)`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Completion Actions */}
        {results && (
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => navigate(`/admin/classes/${classId}`)}>
                  Return to Class Details
                </Button>
                <Button onClick={handleReset}>
                  Transfer More Students
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}