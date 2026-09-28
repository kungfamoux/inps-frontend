import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/contexts/session-context";
import AdvancedSearch, { FilterConfig, SearchFilters } from "@/components/admin/AdvancedSearch";
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
    onSuccess: () => {
      toast.success("Student deleted successfully");
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete student");
    },
  });

  const handleDelete = (admissionNumber: string) => {
    if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      deleteStudentMutation.mutate(admissionNumber);
    }
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
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Failed to load students. Please try again.
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No students found
              </div>
            ) : (
              <>
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
                      {students.map((student) => (
                        <TableRow key={student.admissionNumber}>
                          <TableCell className="font-medium">{student.admissionNumber}</TableCell>
                          <TableCell>
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>{student.gender}</TableCell>
                          <TableCell>
                            {student.class?.name || "Not enrolled"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
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

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} students
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}