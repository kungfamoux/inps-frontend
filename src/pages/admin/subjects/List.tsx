import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, Eye, Pencil, Power, PowerOff, BookOpen, SearchX } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AdvancedSearch, {
  FilterConfig,
  SearchFilters,
} from '@/components/admin/AdvancedSearch';
import { EntityAvatar } from '@/components/admin/lists/EntityAvatar';
import { StatusDotBadge } from '@/components/admin/lists/StatusDotBadge';
import { NumberedPagination } from '@/components/admin/lists/NumberedPagination';
import { ListEmptyState } from '@/components/admin/lists/ListEmptyState';
import { ListTableSkeleton } from '@/components/admin/lists/ListTableSkeleton';

export default function SubjectsList() {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);
  const limit = 20;
  const [isSearching, setIsSearching] = useState(false);

  // Filter configuration for subjects
  const filterConfig: FilterConfig[] = [
    {
      field: 'status',
      type: 'chip',
      label: 'Status',
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
      ],
    },
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ['subjects', page, searchFilters, isSearching],
    queryFn: () => {
      // Use search endpoint if there's a search query
      if (searchFilters.q && searchFilters.q.trim()) {
        setIsSearching(true);
        return adminApi.searchSubjects({
          q: searchFilters.q,
          page,
          limit,
          status: searchFilters.status,
        });
      }

      // Otherwise use regular getAllSubjects
      setIsSearching(false);
      return adminApi.getAllSubjects();
    },
  });

  const subjects = data?.data || [];
  const pagination = data?.meta || data?.pagination;

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setPage(1);
  };

  const handleClear = () => {
    setSearchFilters({});
    setPage(1);
  };

  const handleEdit = (subjectId: string) => {
    navigate(`/admin/subjects/${subjectId}/edit`);
  };

  const handleView = (subjectId: string) => {
    navigate(`/admin/subjects/${subjectId}`);
  };

  const toggleActiveMutation = useMutation({
    mutationFn: (subjectId: string) => adminApi.toggleSubjectActive(subjectId),
    onSuccess: () => {
      toast.success('Subject status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subject status');
    },
  });

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
            <p className="text-sm text-muted-foreground">
              Manage curriculum and subject assignments
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>All Subjects</CardTitle>
            </div>
            <AdvancedSearch
              onSearch={handleSearch}
              onClear={handleClear}
              filterConfig={filterConfig}
              initialFilters={searchFilters}
              showHistory={true}
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ListTableSkeleton rows={6} />
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Failed to load subjects. Please try again.
              </div>
            ) : subjects.length === 0 ? (
              <ListEmptyState
                icon={BookOpen}
                title="No subjects found"
                message={
                  isSearching || searchFilters.q
                    ? 'No subjects match your current search. Try adjusting or clearing the filters.'
                    : 'Subjects appear here once they have been added to the curriculum.'
                }
                action={
                  isSearching || searchFilters.q ? (
                    <Button variant="outline" onClick={handleClear}>
                      <SearchX className="size-4" /> Clear Filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Subject</TableHead>
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Levels</TableHead>
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="h-11 text-right text-xs uppercase tracking-wider">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjects.map((subject) => (
                        <TableRow
                          key={subject.id}
                          className="cursor-pointer even:bg-muted/30 hover:bg-primary/5"
                          onClick={() => handleView(subject.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <EntityAvatar
                                shape="square"
                                name={subject.subjectName}
                                initials={subject.subjectCode?.slice(0, 3)}
                              />
                              <div className="min-w-0">
                                <p className="truncate font-medium">{subject.subjectName}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {subject.subjectCode}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {subject.levels?.map((level: any) => (
                                <Badge
                                  key={level.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {level.level}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusDotBadge
                              status={subject.isActive ? 'ACTIVE' : 'INACTIVE'}
                            />
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
                                <DropdownMenuItem
                                  onClick={() => handleView(subject.id)}
                                >
                                  <Eye className="mr-2 size-4" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(subject.id)}
                                >
                                  <Pencil className="mr-2 size-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    toggleActiveMutation.mutate(subject.id)
                                  }
                                  className={
                                    subject.isActive
                                      ? 'text-destructive'
                                      : 'text-green-600'
                                  }
                                  disabled={toggleActiveMutation.isPending}
                                >
                                  {subject.isActive ? (
                                    <>
                                      <PowerOff className="mr-2 size-4" />{' '}
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <Power className="mr-2 size-4" /> Activate
                                    </>
                                  )}
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
                    itemLabel="subjects"
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
