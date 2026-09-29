import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { AdminLayout } from "@/components/layout/AdminLayout";
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
import { useNavigate } from "react-router-dom";
import { Plus, MoreHorizontal, Edit, Trash2, Filter, Layers, BookOpen, SearchX } from "lucide-react";
import { Term, SubjectAssignmentStatus } from "@/lib/types/common";
import { EntityAvatar } from "@/components/admin/lists/EntityAvatar";
import { StatusDotBadge } from "@/components/admin/lists/StatusDotBadge";
import { ListEmptyState } from "@/components/admin/lists/ListEmptyState";
import { ListTableSkeleton } from "@/components/admin/lists/ListTableSkeleton";

export default function AssignmentsList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedAssignments, setSelectedAssignments] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"all" | "byTeacher" | "byClass">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    classId: "",
    subjectId: "",
    teacherId: "",
    academicYear: "",
    term: "" as Term,
    status: "" as SubjectAssignmentStatus,
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

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subject Assignments</h1>
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
            <Button className="gap-2" onClick={() => navigate("/admin/assignments/add")}>
              <Plus className="size-4" /> Add Assignment
            </Button>
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
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ListTableSkeleton rows={6} />
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Failed to load assignments. Please try again.
              </div>
            ) : !assignments?.data || assignments.data.length === 0 ? (
              <ListEmptyState
                icon={Layers}
                title="No assignments found"
                message={
                  hasActiveFilters
                    ? "No assignments match the current filters. Try adjusting or clearing them."
                    : "Assignments link teachers to subjects and classes. Create your first one to get started."
                }
                action={
                  hasActiveFilters ? (
                    <Button
                      variant="outline"
                      onClick={() => setFilters({ classId: "", subjectId: "", teacherId: "", academicYear: "", term: "" as Term, status: "" as SubjectAssignmentStatus })}
                    >
                      <SearchX className="size-4" /> Clear Filters
                    </Button>
                  ) : (
                    <Button onClick={() => navigate("/admin/assignments/add")}>
                      <Plus className="size-4" /> Add Assignment
                    </Button>
                  )
                }
              />
            ) : viewMode === "all" ? (
              <div className="overflow-hidden rounded-xl border shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="w-12 h-11">
                        <Checkbox
                          checked={selectedAssignments.size === assignments.data.length && assignments.data.length > 0}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all assignments"
                        />
                      </TableHead>
                      <TableHead className="h-11 text-xs uppercase tracking-wider">Teacher</TableHead>
                      <TableHead className="h-11 text-xs uppercase tracking-wider">Subject</TableHead>
                      <TableHead className="h-11 text-xs uppercase tracking-wider">Class</TableHead>
                      <TableHead className="h-11 text-xs uppercase tracking-wider">Academic Year</TableHead>
                      <TableHead className="h-11 text-xs uppercase tracking-wider">Term</TableHead>
                      <TableHead className="h-11 text-xs uppercase tracking-wider">Status</TableHead>
                      <TableHead className="h-11 text-right text-xs uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.data.map((assignment) => (
                      <TableRow
                        key={assignment.id}
                        className="cursor-pointer even:bg-muted/30 hover:bg-primary/5"
                        onClick={() => navigate(`/admin/assignments/${assignment.id}/edit`)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedAssignments.has(assignment.id)}
                            onCheckedChange={(checked) => handleSelectAssignment(assignment.id, checked)}
                            aria-label="Select assignment"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <EntityAvatar
                              name={`${assignment.teacher?.firstName || ""} ${assignment.teacher?.lastName || ""}`}
                              className="size-8"
                            />
                            <span className="truncate font-medium">
                              {assignment.teacher?.firstName} {assignment.teacher?.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{assignment.subject?.subjectCode}</span>
                          <span className="text-muted-foreground"> — {assignment.subject?.subjectName}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {assignment.class?.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{assignment.academicYear}</TableCell>
                        <TableCell className="text-muted-foreground">{assignment.term.replace("_", " ")}</TableCell>
                        <TableCell>
                          <StatusDotBadge status={assignment.status} />
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Open actions"
                                className="size-8 rounded-lg border border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/admin/assignments/${assignment.id}/edit`)}>
                                <Edit className="mr-2 size-4" /> Edit
                              </DropdownMenuItem>
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
                  <Card key={teacherId} className="overflow-hidden py-0 shadow-sm">
                    <CardHeader className="border-b bg-muted/40 py-4">
                      <CardTitle className="flex items-center gap-3 text-base">
                        <EntityAvatar
                          name={`${teacherAssignments[0]?.teacher?.firstName || ""} ${teacherAssignments[0]?.teacher?.lastName || ""}`}
                        />
                        <span>
                          {teacherAssignments[0]?.teacher?.firstName} {teacherAssignments[0]?.teacher?.lastName}
                        </span>
                        <Badge variant="secondary" className="ml-auto font-normal">
                          {teacherAssignments.length}{" "}
                          {teacherAssignments.length === 1 ? "assignment" : "assignments"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="rounded-none border-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-muted/50">
                              <TableHead className="h-10 text-xs uppercase tracking-wider">Subject</TableHead>
                              <TableHead className="h-10 text-xs uppercase tracking-wider">Class</TableHead>
                              <TableHead className="h-10 text-xs uppercase tracking-wider">Academic Year</TableHead>
                              <TableHead className="h-10 text-xs uppercase tracking-wider">Term</TableHead>
                              <TableHead className="h-10 text-xs uppercase tracking-wider">Status</TableHead>
                              <TableHead className="h-10 text-right text-xs uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {teacherAssignments.map((assignment) => (
                              <TableRow
                                key={assignment.id}
                                className="cursor-pointer even:bg-muted/30 hover:bg-primary/5"
                                onClick={() => navigate(`/admin/assignments/${assignment.id}/edit`)}
                              >
                                <TableCell>
                                  <span className="font-medium">{assignment.subject?.subjectCode}</span>
                                  <span className="text-muted-foreground"> — {assignment.subject?.subjectName}</span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{assignment.class?.name}</TableCell>
                                <TableCell className="text-muted-foreground">{assignment.academicYear}</TableCell>
                                <TableCell className="text-muted-foreground">{assignment.term.replace("_", " ")}</TableCell>
                                <TableCell>
                                  <StatusDotBadge status={assignment.status} />
                                </TableCell>
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Open actions"
                                        className="size-8 rounded-lg border border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground"
                                      >
                                        <MoreHorizontal className="size-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => navigate(`/admin/assignments/${assignment.id}/edit`)}>
                                        <Edit className="mr-2 size-4" /> Edit
                                      </DropdownMenuItem>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedByClass || {}).map(([classId, classAssignments]) => (
                  <Card key={classId} className="overflow-hidden py-0 shadow-sm">
                    <CardHeader className="border-b bg-muted/40 py-4">
                      <CardTitle className="flex items-center gap-3 text-base">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <BookOpen className="size-4" />
                        </span>
                        <span>{classAssignments[0]?.class?.name}</span>
                        <Badge variant="secondary" className="ml-auto font-normal">
                          {classAssignments.length}{" "}
                          {classAssignments.length === 1 ? "assignment" : "assignments"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="rounded-none border-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-muted/50">
                              <TableHead className="h-10 text-xs uppercase tracking-wider">Teacher</TableHead>
                              <TableHead className="h-10 text-xs uppercase tracking-wider">Subject</TableHead>
                              <TableHead className="h-10 text-xs uppercase tracking-wider">Academic Year</TableHead>
                              <TableHead className="h-10 text-xs uppercase tracking-wider">Term</TableHead>
                              <TableHead className="h-10 text-xs uppercase tracking-wider">Status</TableHead>
                              <TableHead className="h-10 text-right text-xs uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {classAssignments.map((assignment) => (
                              <TableRow
                                key={assignment.id}
                                className="cursor-pointer even:bg-muted/30 hover:bg-primary/5"
                                onClick={() => navigate(`/admin/assignments/${assignment.id}/edit`)}
                              >
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <EntityAvatar
                                      name={`${assignment.teacher?.firstName || ""} ${assignment.teacher?.lastName || ""}`}
                                      className="size-8"
                                    />
                                    <span className="truncate font-medium">
                                      {assignment.teacher?.firstName} {assignment.teacher?.lastName}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium">{assignment.subject?.subjectCode}</span>
                                  <span className="text-muted-foreground"> — {assignment.subject?.subjectName}</span>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{assignment.academicYear}</TableCell>
                                <TableCell className="text-muted-foreground">{assignment.term.replace("_", " ")}</TableCell>
                                <TableCell>
                                  <StatusDotBadge status={assignment.status} />
                                </TableCell>
                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Open actions"
                                        className="size-8 rounded-lg border border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground"
                                      >
                                        <MoreHorizontal className="size-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => navigate(`/admin/assignments/${assignment.id}/edit`)}>
                                        <Edit className="mr-2 size-4" /> Edit
                                      </DropdownMenuItem>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}