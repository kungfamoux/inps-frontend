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
  X,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

  // Dialog states
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

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
  const total = collectionsData?.meta?.total || 0;
  const totalPages = collectionsData?.meta?.totalPages || 1;

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const handleExport = () => {
    // Export functionality - to be implemented
    console.log('Exporting fee collections...');
  };

  const handleViewDetails = (collection: any) => {
    setSelectedInvoice(collection);
    setShowDetailsDialog(true);
  };

  const handleRecordPayment = (collection: any) => {
    setSelectedInvoice(collection);
    setPaymentAmount(collection.balance?.toString() || '');
    setShowPaymentDialog(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedInvoice || !paymentAmount || !paymentMethod) {
      alert('Please fill in all required fields');
      return;
    }

    setIsRecordingPayment(true);
    try {
      await bursaryApi.recordManualPayment({
        studentId: selectedInvoice.studentId,
        invoiceIds: [selectedInvoice.invoiceId],
        amount: parseFloat(paymentAmount),
        paymentDate: new Date().toISOString().split('T')[0],
        paymentChannel: paymentMethod,
        referenceNumber: referenceNumber || undefined,
        notes: notes || undefined,
      });

      setShowPaymentDialog(false);
      setPaymentAmount('');
      setPaymentMethod('');
      setReferenceNumber('');
      setNotes('');
      refetch();
      alert('Payment recorded successfully');
    } catch (error) {
      console.error('Failed to record payment:', error);
      alert('Failed to record payment. Please try again.');
    } finally {
      setIsRecordingPayment(false);
    }
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
                                  onClick={() => handleViewDetails(collection)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                {!isFullyPaid && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Record Payment"
                                    className="h-8 w-8 text-primary hover:text-primary"
                                    onClick={() => handleRecordPayment(collection)}
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

        {/* View Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                Full details for invoice {selectedInvoice?.invoiceNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Student Name</Label>
                    <p className="font-semibold">{selectedInvoice.studentName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Admission Number</Label>
                    <p className="font-mono">{selectedInvoice.admissionNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Class</Label>
                    <p>{selectedInvoice.class || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Invoice Number</Label>
                    <p className="font-mono">{selectedInvoice.invoiceNumber}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Bill</Label>
                    <p>{selectedInvoice.feeType || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <Badge variant={selectedInvoice.balance === 0 ? 'default' : 'secondary'}>
                      {selectedInvoice.balance === 0 ? 'PAID' : selectedInvoice.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Amount</Label>
                    <p className="font-semibold">₦{selectedInvoice.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Amount Paid</Label>
                    <p className="text-green-600 font-semibold">₦{(selectedInvoice.amountPaid || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Balance</Label>
                    <p className={`font-semibold ${selectedInvoice.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₦{selectedInvoice.balance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Due Date</Label>
                    <p>{selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Record Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a manual payment for {selectedInvoice?.studentName}
              </DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-4 py-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground">Balance Due:</span>
                    <span className="font-semibold text-red-600">₦{selectedInvoice.balance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Invoice:</span>
                    <span className="font-mono text-sm">{selectedInvoice.invoiceNumber}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="POS">POS</SelectItem>
                      <SelectItem value="FORM_OF_TRANSFER">Form of Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    placeholder="Receipt number or transfer reference"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handlePaymentSubmit} disabled={isRecordingPayment}>
                {isRecordingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recording...
                  </>
                ) : (
                  'Record Payment'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BursaryLayout>
  );
}
