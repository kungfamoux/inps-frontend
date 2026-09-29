import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2, Users, SearchX } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { useSession } from "@/contexts/session-context";
import AdvancedSearch, { FilterConfig, SearchFilters } from "@/components/admin/AdvancedSearch";
import { EntityAvatar } from "@/components/admin/lists/EntityAvatar";
import { StatusDotBadge } from "@/components/admin/lists/StatusDotBadge";
import { NumberedPagination } from "@/components/admin/lists/NumberedPagination";
import { ListEmptyState } from "@/components/admin/lists/ListEmptyState";
import { ListTableSkeleton } from "@/components/admin/lists/ListTableSkeleton";
import { toast } from "sonner";

export default function StudentsList() {
  const navigate = useNavigate();
  const { selectedSession, selectedTerm, error: sessionError } = useSession();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);
  const limit = 20;
  const [isSearching, setIsSearching] = useState(false);

  // Filter configuration for students
  const filterConfig: FilterConfig[] = [
    {
      field: 'status',
      type: 'chip',
      label: 'Status',
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
        { value: 'GRADUATED', label: 'Graduated' },
      ]
    },
  ];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["students", page, searchFilters, selectedSession, selectedTerm, isSearching],
    queryFn: () => {
      if (!selectedSession || !selectedTerm) {
        return Promise.resolve({ data: [], meta: null });
      }

      // Use search endpoint if there's a search query
      if (searchFilters.q && searchFilters.q.trim()) {
        setIsSearching(true);
        return adminApi.searchStudents({
          q: searchFilters.q,
          page,
          limit,
          status: searchFilters.status,
          classId: searchFilters.classId,
          academicYear: selectedSession.session,
          term: selectedTerm.term
        });
      }

      // Otherwise use regular getAllStudents
      setIsSearching(false);
      return adminApi.getAllStudents({ 
        page, 
        limit, 
        status: searchFilters.status || "ACTIVE",
        academicYear: selectedSession.session,
        term: selectedTerm.term
      });
    },
    enabled: !!selectedSession && !!selectedTerm,
  });

  const students = data?.data || [];
  const pagination = data?.meta || data?.pagination;

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setPage(1);
  };

  const handleClear = () => {
    setSearchFilters({});
    setPage(1);
  };

  const handleEdit = (admissionNumber: string) => {
    navigate(`/admin/students/${admissionNumber}/edit`);
  };

  const handleView = (admissionNumber: string) => {
    navigate(`/admin/students/${admissionNumber}`);
  };

  const deleteStudentMutation = useMutation({
    mutationFn: async (admissionNumber: string) => {
      return adminApi.deleteStudent(admissionNumber);
    },
    onSuccess: (result: any) => {
      toast.success(result.message || "Student deleted successfully");
      if (result.warning) {
        toast.warning(result.warning);
      }
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete student");
    },
  });

  const handleDelete = (admissionNumber: string) => {
    // First check if parent has other children
    adminApi.checkStudentDeletion(admissionNumber)
      .then((response) => {
        if (response.success && response.data) {
          const { hasOtherChildren, otherChildrenCount, parentEmail, studentName } = response.data;
          
          let message = `Are you sure you want to delete ${studentName}? This action cannot be undone.`;
          
          if (hasOtherChildren) {
            message += `\n\nWarning: Parent account (${parentEmail}) still has ${otherChildrenCount} other child(ren) registered.`;
          } else {
            message += `\n\nNote: Parent account will have no registered children.`;
          }
          
          if (window.confirm(message)) {
            deleteStudentMutation.mutate(admissionNumber);
          }
        }
      })
      .catch((error) => {
        console.error('Error checking student deletion:', error);
        // If check fails, proceed with normal confirmation
        if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
          deleteStudentMutation.mutate(admissionNumber);
        }
      });
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Students</h1>
            <p className="text-sm text-muted-foreground">Manage student registrations and enrollments</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/admin/students/add")}>
            <Plus className="size-4" /> Add Student
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>All Students</CardTitle>
            </div>
            <AdvancedSearch
              onSearch={handleSearch}
              onClear={handleClear}
              filterConfig={filterConfig}
              initialFilters={searchFilters}
              showHistory={true}
            />
            {sessionError && (
              <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive">{sessionError}</p>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {sessionError ? (
              <div className="text-center py-8 text-destructive">
                {sessionError}
              </div>
            ) : isLoading ? (
              <ListTableSkeleton rows={6} />
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Failed to load students. Please try again.
              </div>
            ) : students.length === 0 ? (
              <ListEmptyState
                icon={Users}
                title="No students found"
                message={
                  isSearching || searchFilters.q
                    ? "No students match your current search. Try adjusting or clearing the filters."
                    : "Get started by registering your first student."
                }
                action={
                  isSearching || searchFilters.q ? (
                    <Button variant="outline" onClick={handleClear}>
                      <SearchX className="size-4" /> Clear Filters
                    </Button>
                  ) : (
                    <Button onClick={() => navigate("/admin/students/add")}>
                      <Plus className="size-4" /> Add Student
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Student</TableHead>
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Gender</TableHead>
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Class</TableHead>
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="h-11 text-right text-xs uppercase tracking-wider">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow
                          key={student.admissionNumber}
                          className="cursor-pointer even:bg-muted/30 hover:bg-primary/5"
                          onClick={() => handleView(student.admissionNumber)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <EntityAvatar name={`${student.firstName} ${student.lastName}`} />
                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {student.admissionNumber}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{student.gender}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {student.class?.name || "Not enrolled"}
                          </TableCell>
                          <TableCell>
                            <StatusDotBadge status={student.status} />
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
                                <DropdownMenuItem onClick={() => handleView(student.admissionNumber)}>
                                  <Eye className="mr-2 size-4" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(student.admissionNumber)}>
                                  <Pencil className="mr-2 size-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(student.admissionNumber)} className="text-destructive">
                                  <Trash2 className="mr-2 size-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {pagination && (
                  <NumberedPagination
                    page={page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    limit={limit}
                    onPageChange={setPage}
                    itemLabel="students"
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}