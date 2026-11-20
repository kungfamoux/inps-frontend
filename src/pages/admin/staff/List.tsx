import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { staffApi } from "@/lib/api/staff";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Eye, Pencil, ShieldCheck, ShieldX, Users, SearchX } from "lucide-react";
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
import AdvancedSearch, { FilterConfig, SearchFilters } from "@/components/admin/AdvancedSearch";
import { EntityAvatar } from "@/components/admin/lists/EntityAvatar";
import { StatusDotBadge } from "@/components/admin/lists/StatusDotBadge";
import { NumberedPagination } from "@/components/admin/lists/NumberedPagination";
import { ListEmptyState } from "@/components/admin/lists/ListEmptyState";
import { ListTableSkeleton } from "@/components/admin/lists/ListTableSkeleton";

export default function StaffList() {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [page, setPage] = useState(1);
  const limit = 20;
  const [isSearching, setIsSearching] = useState(false);

  // Filter configuration for staff
  const filterConfig: FilterConfig[] = [
    {
      field: 'role',
      type: 'select',
      label: 'Role',
      options: [
        { value: 'ADMIN', label: 'Admin' },
        { value: 'TEACHER', label: 'Teacher' },
        { value: 'NON_TEACHING', label: 'Non-Teaching' },
      ]
    },
    {
      field: 'status',
      type: 'chip',
      label: 'Status',
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
      ]
    },
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ["staff", page, searchFilters, isSearching],
    queryFn: () => {
      // Use search endpoint if there's a search query
      if (searchFilters.q && searchFilters.q.trim()) {
        setIsSearching(true);
        return adminApi.searchStaff({
          q: searchFilters.q,
          page,
          limit,
          status: searchFilters.status,
          role: searchFilters.role
        });
      }

      // Otherwise use regular getAllStaff
      setIsSearching(false);
      return staffApi.getAllStaff({ page, limit });
    },
  });

  const staff = data?.data || [];
  const pagination = data?.meta || data?.pagination;

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setPage(1);
  };

  const handleClear = () => {
    setSearchFilters({});
    setPage(1);
  };

  const handleEdit = (staffId: string) => {
    navigate(`/admin/staff/${staffId}/edit`);
  };

  const handleView = (staffId: string) => {
    navigate(`/admin/staff/${staffId}`);
  };

  const handleToggleStatus = async (staffId: string, currentStatus: string) => {
    try {
      if (currentStatus === "ACTIVE") {
        await staffApi.deactivateStaff(staffId);
      } else {
        await staffApi.reactivateStaff(staffId);
      }
      // Invalidate query to refresh data
      window.location.reload();
    } catch (error) {
      console.error("Failed to toggle staff status:", error);
    }
  };

  return (
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Staff</h1>
            <p className="text-sm text-muted-foreground">Manage staff accounts and permissions</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/admin/staff/add")}>
            <Plus className="size-4" /> Add Staff
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>All Staff</CardTitle>
              {staff.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  {pagination?.total || staff.length} total staff
                </span>
              )}
            </div>
            <AdvancedSearch
              onSearch={handleSearch}
              onClear={handleClear}
              filterConfig={filterConfig}
              initialFilters={searchFilters}
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ListTableSkeleton rows={6} />
            ) : error ? (
              <div className="flex h-[200px] flex-col items-center justify-center gap-3 text-destructive">
                <div className="grid size-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                  <SearchX className="size-8" />
                </div>
                <p className="text-sm font-medium">Failed to load staff. Please try again.</p>
              </div>
            ) : staff.length === 0 ? (
              <ListEmptyState
                icon={Users}
                title="No staff found"
                message={
                  isSearching || searchFilters.q
                    ? "No staff match your current search. Try adjusting or clearing the filters."
                    : "Get started by adding your first staff member."
                }
                action={
                  isSearching || searchFilters.q ? (
                    <Button variant="outline" onClick={handleClear}>
                      <SearchX className="size-4" /> Clear Filters
                    </Button>
                  ) : (
                    <Button onClick={() => navigate("/admin/staff/add")}>
                      <Plus className="size-4" /> Add Staff
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-border/50 shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-foreground">Staff</TableHead>
                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-foreground">Phone</TableHead>
                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-foreground">Role</TableHead>
                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-foreground">Type</TableHead>
                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-foreground">Status</TableHead>
                        <TableHead className="h-12 text-right text-xs font-semibold uppercase tracking-wider text-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff.map((member) => (
                        <TableRow
                          key={member.id}
                          className="cursor-pointer hover:bg-primary/5 transition-colors"
                          onClick={() => handleView(member.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <EntityAvatar
                                name={`${member.firstName} ${member.middleName || ""} ${member.lastName}`}
                              />
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-foreground">
                                  {member.firstName} {member.middleName && member.middleName + " "}{member.lastName}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-medium">{member.phone}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs rounded-lg">{member.role}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-medium">{member.type}</TableCell>
                          <TableCell>
                            <StatusDotBadge status={member.status} />
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Open actions"
                                  className="size-8 rounded-xl border border-transparent text-muted-foreground hover:border-border hover:bg-background hover:text-foreground"
                                >
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuItem onClick={() => handleView(member.id)} className="rounded-lg">
                                  <Eye className="mr-2 size-4" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(member.id)} className="rounded-lg">
                                  <Pencil className="mr-2 size-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleToggleStatus(member.id, member.status)}
                                  className="rounded-lg"
                                >
                                  {member.status === "ACTIVE" ? (
                                    <>
                                      <ShieldX className="mr-2 size-4" /> Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <ShieldCheck className="mr-2 size-4" /> Reactivate
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
                    itemLabel="staff"
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
