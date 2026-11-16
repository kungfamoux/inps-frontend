import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Trash2, Filter, Layers, Users, BookOpen } from "lucide-react";
import { Term, SubjectAssignmentStatus } from "@/lib/types/common";

export default function SubjectTeachers() {
  const queryClient = useQueryClient();
  const [selectedAssignments, setSelectedAssignments] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"all" | "byTeacher" | "byClass">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    classId: "",
    subjectId: "",
    teacherId: "",
    academicYear: "",
    term: "" as Term,
    status: "" as SubjectAssignmentStatus,
  });
  const [bulkAssignData, setBulkAssignData] = useState({
    subjectId: "",
    teacherId: "",
    selectedClassIds: new Set<string>(),
    term: Term.FIRST_TERM,
    academicYear: "",
    termId: "",
  });

  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ["assignments", filters],
    queryFn: () => adminApi.getAllAssignments(filters),
  });

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: () => adminApi.getAllClasses(),
  });

  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => adminApi.getAllSubjects(),
  });

  const { data: staff } = useQuery({
    queryKey: ["staff"],
    queryFn: () => adminApi.getAllStaff(),
  });

  const { data: currentSession } = useQuery({
    queryKey: ["currentSession"],
    queryFn: () => adminApi.getCurrentSession(),
    retry: false,
  });

  const { data: currentTerm } = useQuery({
    queryKey: ["currentTerm"],
    queryFn: () => adminApi.getCurrentTerm(),
    retry: false,
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: (assignmentId: string) => adminApi.removeAssignment(assignmentId),
    onSuccess: () => {
      toast.success("Assignment removed successfully");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove assignment");
    },
  });

  const bulkAssignMutation = useMutation({
    mutationFn: (data: {
      classIds: string[];
      subjectId: string;
      teacherId: string;
      academicYear: string;
      term: Term;
      termId: string;
    }) => adminApi.bulkCreateAssignment(data),
    onSuccess: () => {
      toast.success("Subject assignments created successfully");
      setBulkAssignDialogOpen(false);
      setBulkAssignData({
        subjectId: "",
        teacherId: "",
        selectedClassIds: new Set<string>(),
        term: Term.FIRST_TERM,
        academicYear: "",
        termId: "",
      });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create subject assignments");
    },
  });

  const handleDelete = (assignmentId: string) => {
    removeAssignmentMutation.mutate(assignmentId);
  };

  const handleBulkDelete = () => {
    selectedAssignments.forEach((id) => {
      removeAssignmentMutation.mutate(id);
    });
    setSelectedAssignments(new Set());
  };

  const handleSelectAll = (checked: boolean | string) => {
    const isChecked = typeof checked === 'boolean' ? checked : checked === 'true';
    if (isChecked && assignments?.data) {
      setSelectedAssignments(new Set(assignments.data.map((a) => a.id)));
    } else {
      setSelectedAssignments(new Set());
    }
  };

  const handleSelectAssignment = (id: string, checked: boolean | string) => {
    const isChecked = typeof checked === 'boolean' ? checked : checked === 'true';
    const newSelected = new Set(selectedAssignments);
    if (isChecked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedAssignments(newSelected);
  };

  const handleBulkAssign = () => {
    const classIds = Array.from(bulkAssignData.selectedClassIds);
    if (!bulkAssignData.subjectId || !bulkAssignData.teacherId || classIds.length === 0) {
      toast.error("Please select subject, teacher, and at least one class");
      return;
    }
    bulkAssignMutation.mutate({
      classIds,
      subjectId: bulkAssignData.subjectId,
      teacherId: bulkAssignData.teacherId,
      academicYear: bulkAssignData.academicYear,
      term: bulkAssignData.term,
      termId: bulkAssignData.termId,
    });
  };

  const groupedByTeacher = assignments?.data?.reduce((acc, assignment) => {
    const teacherId = assignment.teacherId;
    if (!acc[teacherId]) {
      acc[teacherId] = [];
    }
    acc[teacherId].push(assignment);
    return acc;
  }, {} as Record<string, typeof assignments.data>);

  const groupedByClass = assignments?.data?.reduce((acc, assignment) => {
    const classId = assignment.classId;
    if (!acc[classId]) {
      acc[classId] = [];
    }
    acc[classId].push(assignment);
    return acc;
  }, {} as Record<string, typeof assignments.data>);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const teachers = staff?.data?.filter((s) => s.role === "TEACHER") || [];

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subject Teacher Assignments</h1>
            <p className="text-sm text-muted-foreground">Manage teacher-subject-class assignments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="size-4 mr-2" /> Filters
            </Button>
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as "all" | "byTeacher" | "byClass")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="View mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                <SelectItem value="byTeacher">By Teacher</SelectItem>
                <SelectItem value="byClass">By Class</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={bulkAssignDialogOpen} onOpenChange={setBulkAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="size-4" /> Bulk Assign
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Bulk Subject Assignment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select
                        value={bulkAssignData.subjectId}
                        onValueChange={(value) => setBulkAssignData({ ...bulkAssignData, subjectId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects?.data?.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.subjectCode} - {subject.subjectName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teacher">Teacher *</Label>
                      <Select
                        value={bulkAssignData.teacherId}
                        onValueChange={(value) => setBulkAssignData({ ...bulkAssignData, teacherId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.firstName} {teacher.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Classes *</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {classes?.data?.map((cls) => (
                        <div key={cls.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`bulk-class-${cls.id}`}
                            checked={bulkAssignData.selectedClassIds.has(cls.id)}
                            onCheckedChange={(checked) => {
                              const isChecked = typeof checked === 'boolean' ? checked : checked === 'true';
                              const newSelected = new Set(bulkAssignData.selectedClassIds);
                              if (isChecked) {
                                newSelected.add(cls.id);
                              } else {
                                newSelected.delete(cls.id);
                              }
                              setBulkAssignData({ ...bulkAssignData, selectedClassIds: newSelected });
                            }}
                          />
                          <Label htmlFor={`bulk-class-${cls.id}`} className="text-sm cursor-pointer">
                            {cls.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="term">Term *</Label>
                      <Select
                        value={bulkAssignData.term || Term.FIRST_TERM}
                        onValueChange={(value) => setBulkAssignData({ ...bulkAssignData, term: value as Term })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Term.FIRST_TERM}>First Term</SelectItem>
                          <SelectItem value={Term.SECOND_TERM}>Second Term</SelectItem>
                          <SelectItem value={Term.THIRD_TERM}>Third Term</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Academic Year *</Label>
                      <Input
                        id="academicYear"
                        value={bulkAssignData.academicYear}
                        onChange={(e) => setBulkAssignData({ ...bulkAssignData, academicYear: e.target.value })}
                        placeholder="e.g., 2024/2025"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setBulkAssignDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleBulkAssign}
                      disabled={bulkAssignMutation.isPending}
                    >
                      {bulkAssignMutation.isPending ? "Assigning..." : "Assign"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select
                    value={filters.classId}
                    onValueChange={(value) => setFilters({ ...filters, classId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.data?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select
                    value={filters.subjectId}
                    onValueChange={(value) => setFilters({ ...filters, subjectId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects?.data?.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>{subject.subjectCode} - {subject.subjectName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Academic Year</Label>
                  <Input
                    value={filters.academicYear}
                    onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
                    placeholder="e.g., 2024/2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Term</Label>
                  <Select
                    value={filters.term}
                    onValueChange={(value) => setFilters({ ...filters, term: value as Term })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Term.FIRST_TERM}>First Term</SelectItem>
                      <SelectItem value={Term.SECOND_TERM}>Second Term</SelectItem>
                      <SelectItem value={Term.THIRD_TERM}>Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value as SubjectAssignmentStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SubjectAssignmentStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={SubjectAssignmentStatus.INACTIVE}>Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button variant="outline" onClick={() => setFilters({ classId: "", subjectId: "", teacherId: "", academicYear: "", term: "" as Term, status: "" as SubjectAssignmentStatus })}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions */}
        {selectedAssignments.size > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm">{selectedAssignments.size} assignments selected</p>
                <Button variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="size-4 mr-2" /> Remove Selected
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading assignments...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Failed to load assignments. Please try again.
              </div>
            ) : !assignments?.data || assignments.data.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No subject assignments found. Create your first assignment to get started.
              </div>
            ) : viewMode === "all" ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedAssignments.size === assignments.data.length && assignments.data.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.data.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedAssignments.has(assignment.id)}
                            onCheckedChange={(checked) => handleSelectAssignment(assignment.id, checked)}
                          />
                        </TableCell>
                        <TableCell>
                          {assignment.teacher?.firstName} {assignment.teacher?.lastName}
                        </TableCell>
                        <TableCell>
                          {assignment.subject?.subjectCode} - {assignment.subject?.subjectName}
                        </TableCell>
                        <TableCell>
                          {assignment.class?.name}
                        </TableCell>
                        <TableCell>{assignment.academicYear}</TableCell>
                        <TableCell>{assignment.term.replace("_", " ")}</TableCell>
                        <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDelete(assignment.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 size-4" /> Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : viewMode === "byTeacher" ? (
              <div className="space-y-6">
                {Object.entries(groupedByTeacher || {}).map(([teacherId, teacherAssignments]) => (
                  <Card key={teacherId}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="size-5" />
                        {teacherAssignments[0]?.teacher?.firstName} {teacherAssignments[0]?.teacher?.lastName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Academic Year</TableHead>
                            <TableHead>Term</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teacherAssignments.map((assignment) => (
                            <TableRow key={assignment.id}>
                              <TableCell>{assignment.subject?.subjectCode} - {assignment.subject?.subjectName}</TableCell>
                              <TableCell>{assignment.class?.name}</TableCell>
                              <TableCell>{assignment.academicYear}</TableCell>
                              <TableCell>{assignment.term.replace("_", " ")}</TableCell>
                              <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="size-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(assignment.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="mr-2 size-4" /> Remove
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedByClass || {}).map(([classId, classAssignments]) => (
                  <Card key={classId}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="size-5" />
                        {classAssignments[0]?.class?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Teacher</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Academic Year</TableHead>
                            <TableHead>Term</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classAssignments.map((assignment) => (
                            <TableRow key={assignment.id}>
                              <TableCell>
                                {assignment.teacher?.firstName} {assignment.teacher?.lastName}
                              </TableCell>
                              <TableCell>{assignment.subject?.subjectCode} - {assignment.subject?.subjectName}</TableCell>
                              <TableCell>{assignment.academicYear}</TableCell>
                              <TableCell>{assignment.term.replace("_", " ")}</TableCell>
                              <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="size-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(assignment.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="mr-2 size-4" /> Remove
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
