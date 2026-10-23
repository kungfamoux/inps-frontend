import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BursaryLayout } from '@/components/layout/BursaryLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { bursaryApi } from '@/lib/api/bursary';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SessionTermSelector } from '@/components/admin/SessionTermSelector';

export default function FeeCollections() {
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedSessionName, setSelectedSessionName] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const {
    data: collectionsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      'bursary-collections',
      selectedSessionName,
      selectedTerm,
      classFilter,
      status,
      page,
      limit,
    ],
    queryFn: () =>
      bursaryApi.getFeeCollections({
        academicYear: selectedSessionName || undefined,
        term: selectedTerm || undefined,
        classFilter: classFilter || undefined,
        status: status || undefined,
        search: search || undefined,
        page,
        limit,
      }),
  });

  const collections = collectionsData?.data || [];
  const total = collectionsData?.pagination?.totalItems || 0;
  const totalPages = collectionsData?.pagination?.totalPages || 1;

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleExport = () => {
    // Export functionality - to be implemented
    console.log('Exporting fee collections...');
  };

  return (
    <BursaryLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Fee Collections
            </h1>
            <p className="text-muted-foreground mt-1">
              View and manage fee payment records
            </p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <SessionTermSelector
                sessionId={selectedSessionId}
                termId={selectedTermId}
                onSessionChange={(id, name) => {
                  setSelectedSessionId(id);
                  setSelectedSessionName(name);
                }}
                onTermChange={(id, term) => {
                  setSelectedTermId(id);
                  setSelectedTerm(term);
                }}
                showBoth
              />
              <div className="space-y-2">
                <Label>Class</Label>
                <Input
                  placeholder="e.g., JSS 1A"
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Search</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button onClick={handleSearch} variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Collections ({total})</span>
              {total > 0 && (
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Total Due: ₦{collections.reduce((sum, c) => sum + (c.balance || 0), 0).toLocaleString()}</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No fee collections found</h3>
                <p className="text-muted-foreground">
                  {selectedSessionName || selectedTerm
                    ? 'Try adjusting your filters or generate invoices for the current term.'
                    : 'Select an academic session and term to view fee collections.'}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Student</TableHead>
                        <TableHead className="font-semibold">Admission No</TableHead>
                        <TableHead className="font-semibold">Class</TableHead>
                        <TableHead className="font-semibold">Bill</TableHead>
                        <TableHead className="font-semibold text-right">Total</TableHead>
                        <TableHead className="font-semibold text-right">Paid</TableHead>
                        <TableHead className="font-semibold text-right">Balance</TableHead>
                        <TableHead className="font-semibold">Due Date</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collections.map((collection: any) => {
                        const paidAmount = collection.amountPaid || 0;
                        const balance = collection.balance || 0;
                        const isFullyPaid = balance <= 0;
                        const isOverdue = collection.dueDate && new Date(collection.dueDate) < new Date() && !isFullyPaid;

                        return (
                          <TableRow
                            key={collection.invoiceId || collection.id}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                                  {collection.studentName?.charAt(0) || '?'}
                                </div>
                                <span>{collection.studentName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {collection.admissionNumber}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-normal">
                                {collection.class || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{collection.feeType || 'N/A'}</div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              ₦{collection.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-green-600 font-semibold">
                              ₦{paidAmount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`font-semibold ${
                                  balance > 0
                                    ? isOverdue
                                      ? 'text-red-600'
                                      : 'text-orange-600'
                                    : 'text-green-600'
                                }`}
                              >
                                ₦{balance.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {collection.dueDate ? (
                                  <>
                                    <span className="text-sm">
                                      {new Date(collection.dueDate).toLocaleDateString()}
                                    </span>
                                    {isOverdue && (
                                      <Badge variant="destructive" className="text-xs">
                                        Overdue
                                      </Badge>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-muted-foreground text-sm">N/A</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  isFullyPaid
                                    ? 'default'
                                    : isOverdue
                                      ? 'destructive'
                                      : collection.status === 'PENDING'
                                        ? 'secondary'
                                        : 'outline'
                                }
                                className="font-medium"
                              >
                                {isFullyPaid ? 'PAID' : collection.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="View Details"
                                  className="h-8 w-8"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                {!isFullyPaid && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Record Payment"
                                    className="h-8 w-8 text-primary hover:text-primary"
                                  >
                                    <ArrowRight className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Showing {(page - 1) * limit + 1} to{' '}
                      {Math.min(page * limit, total)} of {total} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (page <= 3) {
                              pageNum = i + 1;
                            } else if (page >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = page - 2 + i;
                            }
                            return (
                              <Button
                                key={pageNum}
                                variant={page === pageNum ? 'default' : 'outline'}
                                size="sm"
                                className="w-8 h-8"
                                onClick={() => setPage(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </BursaryLayout>
  );
}
