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
  CreditCard,
  IndianRupee,
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
  const [paymentMethod, setPaymentMethod] = useState('');
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
      paymentMethod,
      status,
      page,
      limit,
    ],
    queryFn: () =>
      bursaryApi.getFeeCollections({
        academicYear: selectedSessionName || undefined,
        term: selectedTerm || undefined,
        classFilter: classFilter || undefined,
        paymentMethod: paymentMethod || undefined,
        status: status || undefined,
        search: search || undefined,
        page,
        limit,
      }),
  });

  const collections = collectionsData?.data || [];
  const total = collectionsData?.pagination?.total || 0;
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
            <div className="grid gap-4 md:grid-cols-5">
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
                <Label>Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="All methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="POS">POS</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
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
            <CardTitle>Collections ({total})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No fee collections found.
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Admission No</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Bill</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collections.map((collection: any) => {
                        const paidAmount = collection.paidAmount || 0;
                        const balance =
                          collection.balance || collection.amount - paidAmount;
                        const isFullyPaid = balance <= 0;
                        const hasPayments =
                          collection.payments && collection.payments.length > 0;

                        return (
                          <TableRow key={collection.id}>
                            <TableCell className="font-medium">
                              {collection.student?.firstName}{' '}
                              {collection.student?.lastName}
                            </TableCell>
                            <TableCell>
                              {collection.student?.admissionNumber}
                            </TableCell>
                            <TableCell>
                              {collection.student?.class?.name}
                            </TableCell>
                            <TableCell>{collection.bill?.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <IndianRupee className="h-4 w-4" />
                                <span className="font-semibold">
                                  {collection.amount.toLocaleString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-green-600 font-semibold">
                              <div className="flex items-center gap-1">
                                <IndianRupee className="h-4 w-4" />
                                <span>{paidAmount.toLocaleString()}</span>
                              </div>
                            </TableCell>
                            <TableCell
                              className={
                                balance > 0
                                  ? 'text-red-600 font-semibold'
                                  : 'text-green-600 font-semibold'
                              }
                            >
                              <div className="flex items-center gap-1">
                                <IndianRupee className="h-4 w-4" />
                                <span>{balance.toLocaleString()}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {collection.paymentMethod}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(
                                collection.paymentDate,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  isFullyPaid
                                    ? 'default'
                                    : collection.status === 'PENDING'
                                      ? 'secondary'
                                      : 'destructive'
                                }
                              >
                                {isFullyPaid ? 'PAID' : collection.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {hasPayments && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="View Payments"
                                  >
                                    <CreditCard className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  title="View Details"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                {!isFullyPaid && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Record Payment"
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
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {(page - 1) * limit + 1} to{' '}
                      {Math.min(page * limit, total)} of {total} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1,
                        ).map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? 'default' : 'outline'}
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
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
