import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoreHorizontal, Eye, Pencil, Users } from 'lucide-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import AdvancedSearch, {
  FilterConfig,
  SearchFilters,
} from '@/components/admin/AdvancedSearch';

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

  const { data, isLoading, error } = useQuery({
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
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Failed to load parents. Please try again.
              </div>
            ) : parents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No parents found
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Children</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parents.map((parent) => (
                        <TableRow key={parent.id}>
                          <TableCell className="font-medium">
                            {parent.primaryGuardian?.firstName}{' '}
                            {parent.primaryGuardian?.lastName}
                          </TableCell>
                          <TableCell>{parent.accountEmail}</TableCell>
                          <TableCell>{parent.accountPhone}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="size-4 text-muted-foreground" />
                              <span>{parent.students?.length || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                parent.status === 'ACTIVE'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {parent.status}
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
                      Showing {(page - 1) * limit + 1} to{' '}
                      {Math.min(page * limit, pagination.total)} of{' '}
                      {pagination.total} parents
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
                        onClick={() =>
                          setPage((p) => Math.min(pagination.totalPages, p + 1))
                        }
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
