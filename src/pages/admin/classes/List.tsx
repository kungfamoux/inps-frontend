import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Plus, Users, ChevronRight, School, SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import AdvancedSearch, { FilterConfig, SearchFilters } from "@/components/admin/AdvancedSearch";
import { StatusDotBadge } from "@/components/admin/lists/StatusDotBadge";
import { ListEmptyState } from "@/components/admin/lists/ListEmptyState";

export default function ClassesList() {
  const navigate = useNavigate();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [isSearching, setIsSearching] = useState(false);

  // Filter configuration for classes
  const filterConfig: FilterConfig[] = [
    {
      field: 'status',
      type: 'chip',
      label: 'Status',
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
      ]
    },
    {
      field: 'level',
      type: 'select',
      label: 'Level',
      options: [
        { value: 'PRIMARY', label: 'Primary' },
        { value: 'SECONDARY', label: 'Secondary' },
        { value: 'KINDERGARTEN', label: 'Kindergarten' },
      ]
    },
  ];

  const { data, isLoading, error } = useQuery({
    queryKey: ["classes", searchFilters, isSearching],
    queryFn: () => {
      console.log('[DEBUG ClassesList] Starting query with filters:', searchFilters);
      
      // Use search endpoint if there's a search query
      if (searchFilters.q && searchFilters.q.trim()) {
        console.log('[DEBUG ClassesList] Using search endpoint');
        setIsSearching(true);
        const result = adminApi.searchClasses({
          q: searchFilters.q,
          status: searchFilters.status,
          level: searchFilters.level
        });
        console.log('[DEBUG ClassesList] Search result:', result);
        return result;
      }

      // Otherwise use regular getAllClasses
      console.log('[DEBUG ClassesList] Using getAllClasses endpoint');
      setIsSearching(false);
      const result = adminApi.getAllClasses({
        status: searchFilters.status,
        level: searchFilters.level
      });
      console.log('[DEBUG ClassesList] getAllClasses result:', result);
      return result;
    },
  });

  // Log class data structure when it arrives
  if (data?.data && data.data.length > 0) {
    console.log('[DEBUG ClassesList] Class data structure sample:', data.data[0]);
    console.log('[DEBUG ClassesList] Checking for student count fields:', {
      currentEnrollment: data.data[0].currentEnrollment,
      totalStudents: data.data[0].totalStudents,
      studentCount: data.data[0].studentCount,
      students: data.data[0].students,
      _count: data.data[0]._count
    });
  }

  const classes = data?.data || data || [];

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  const handleClear = () => {
    setSearchFilters({});
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Classes</h1>
            <p className="text-sm text-muted-foreground">Manage class sections and student assignments</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/admin/classes/add")}>
            <Plus className="size-4" /> Add Class
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle>All Classes</CardTitle>
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Failed to load classes. Please try again.
              </div>
            ) : classes.length === 0 ? (
              <ListEmptyState
                icon={School}
                title="No classes found"
                message={
                  isSearching || searchFilters.q
                    ? "No classes match your current search. Try adjusting or clearing the filters."
                    : "Get started by creating your first class."
                }
                action={
                  isSearching || searchFilters.q ? (
                    <Button variant="outline" onClick={handleClear}>
                      <SearchX className="size-4" /> Clear Filters
                    </Button>
                  ) : (
                    <Button onClick={() => navigate("/admin/classes/add")}>
                      <Plus className="size-4" /> Add Class
                    </Button>
                  )
                }
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls) => (
                  <Card
                    key={cls.id}
                    onClick={() => navigate(`/admin/classes/${cls.id}`)}
                    className="group cursor-pointer gap-0 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <School className="size-5" />
                          </span>
                          <div className="min-w-0">
                            <CardTitle className="truncate text-base leading-snug">
                              {cls.className || cls.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">{cls.level}</p>
                          </div>
                        </div>
                        <StatusDotBadge status={cls.status} />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Users className="size-4" /> Students
                          </span>
                          <span className="font-semibold">
                            {cls._count?.enrollments || cls.currentEnrollment || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                          View Details
                          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </div>
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
