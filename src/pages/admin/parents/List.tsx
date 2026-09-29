import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, Eye, Pencil, Users, Trash2, SearchX } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';
import AdvancedSearch, {
  FilterConfig,
  SearchFilters,
} from '@/components/admin/AdvancedSearch';
import { EntityAvatar } from '@/components/admin/lists/EntityAvatar';
import { StatusDotBadge } from '@/components/admin/lists/StatusDotBadge';
import { NumberedPagination } from '@/components/admin/lists/NumberedPagination';
import { ListEmptyState } from '@/components/admin/lists/ListEmptyState';
import { ListTableSkeleton } from '@/components/admin/lists/ListTableSkeleton';
import { toast } from 'sonner';

export default function ParentsList() {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);
  const limit = 20;
  const [isSearching, setIsSearching] = useState(false);

  // Filter configuration for parents
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

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parents', page, searchFilters, isSearching],
    queryFn: () => {
      // Use search endpoint if there's a search query
      if (searchFilters.q && searchFilters.q.trim()) {
        setIsSearching(true);
        return adminApi.searchParents({
          q: searchFilters.q,
          page,
          limit,
          status: searchFilters.status,
        });
      }

      // Otherwise use regular getAllParents
      setIsSearching(false);
      return adminApi.getAllParents({ page, limit });
    },
  });

  const parents = data?.data || [];
  const pagination = data?.meta || data?.pagination;

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setPage(1);
  };

  const handleClear = () => {
    setSearchFilters({});
    setPage(1);
  };

  const handleView = (parentId: string) => {
    navigate(`/admin/parents/${parentId}`);
  };

  const handleEdit = (parentId: string) => {
    navigate(`/admin/parents/${parentId}/edit`);
  };

  const deleteParentMutation = useMutation({
    mutationFn: async (parentId: string) => {
      return adminApi.deleteParent(parentId);
    },
    onSuccess: (result: any) => {
      toast.success(result.message || "Parent deleted successfully");
      if (result.warning) {
        toast.warning(result.warning);
      }
      refetch();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete parent");
    },
  });

  const handleDelete = (parentId: string, parentName: string, studentCount: number) => {
    let message = `Are you sure you want to delete ${parentName}? This action cannot be undone.`;
    
    if (studentCount > 0) {
      message += `\n\nWarning: This parent has ${studentCount} registered child(ren). Deleting the parent will also delete their Firebase account.`;
    } else {
      message += `\n\nThis will delete the parent account from both the database and Firebase.`;
    }
    
    if (window.confirm(message)) {
      deleteParentMutation.mutate(parentId);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Parents</h1>
            <p className="text-sm text-muted-foreground">
              Manage parent accounts and student associations
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>All Parents</CardTitle>
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
                Failed to load parents. Please try again.
              </div>
            ) : parents.length === 0 ? (
              <ListEmptyState
                icon={Users}
                title="No parents found"
                message={
                  isSearching || searchFilters.q
                    ? 'No parents match your current search. Try adjusting or clearing the filters.'
                    : 'Parent accounts appear here once students are registered and linked to them.'
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
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Parent</TableHead>
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Phone</TableHead>
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Children</TableHead>
                        <TableHead className="h-11 text-xs uppercase tracking-wider">Status</TableHead>
                        <TableHead className="h-11 text-right text-xs uppercase tracking-wider">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parents.map((parent) => (
                        <TableRow
                          key={parent.id}
                          className="cursor-pointer even:bg-muted/30 hover:bg-primary/5"
                          onClick={() => handleView(parent.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <EntityAvatar
                                name={`${parent.primaryGuardian?.firstName || ''} ${parent.primaryGuardian?.lastName || ''}`}
                              />
                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {parent.primaryGuardian?.firstName}{' '}
                                  {parent.primaryGuardian?.lastName}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {parent.accountEmail}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{parent.accountPhone}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Users className="size-4" />
                              <span className="font-medium text-foreground">
                                {parent.students?.length || 0}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusDotBadge status={parent.status} />
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
                                  onClick={() => handleView(parent.id)}
                                >
                                  <Eye className="mr-2 size-4" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(parent.id)}
                                >
                                  <Pencil className="mr-2 size-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(
                                    parent.id,
                                    `${parent.primaryGuardian?.firstName} ${parent.primaryGuardian?.lastName}`,
                                    parent.students?.length || 0
                                  )}
                                  className="text-destructive"
                                >
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
                    itemLabel="parents"
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
