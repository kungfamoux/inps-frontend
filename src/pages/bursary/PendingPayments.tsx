import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BursaryLayout } from "@/components/layout/BursaryLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bursaryApi } from "@/lib/api/bursary";
import { AlertCircle, CheckCircle, XCircle, Loader2, Eye, Download, Calendar, User, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PendingPayments() {
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const { data: pendingData, isLoading, refetch } = useQuery({
    queryKey: ["pending-payments"],
    queryFn: () => bursaryApi.getPendingPayments(),
  });

  const approveMutation = useMutation({
    mutationFn: (data: { paymentId: string; notes?: string }) => bursaryApi.approvePayment(data),
    onSuccess: () => {
      setApproveDialogOpen(false);
      setApproveNotes("");
      setSelectedPayment(null);
      refetch();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (data: { paymentId: string; reason: string }) => bursaryApi.rejectPayment(data),
    onSuccess: () => {
      setRejectDialogOpen(false);
      setRejectReason("");
      setSelectedPayment(null);
      refetch();
    },
  });

  const handleApprove = () => {
    if (selectedPayment) {
      approveMutation.mutate({
        paymentId: selectedPayment.id,
        notes: approveNotes,
      });
    }
  };

  const handleReject = () => {
    if (selectedPayment) {
      rejectMutation.mutate({
        paymentId: selectedPayment.id,
        reason: rejectReason,
      });
    }
  };

  const pendingPayments = pendingData?.data || [];
  const meta = pendingData?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };

  return (
    <BursaryLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pending Payments</h1>
            <p className="text-muted-foreground mt-1">Review and approve parent payment uploads</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {meta.total} Pending
          </Badge>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pendingPayments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending payments to review</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingPayments.map((payment: any) => (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {payment.student.firstName} {payment.student.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {payment.student.admissionNumber}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Invoice</p>
                          <p className="font-medium">{payment.invoice.invoiceNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bill</p>
                          <p className="font-medium">{payment.invoice.bill.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="font-semibold">₦{payment.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Payment Date</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {payment.referenceNumber && (
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground">Reference Number</p>
                          <p className="font-medium">{payment.referenceNumber}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          PENDING
                        </Badge>
                        {payment.proofOfPaymentId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Proof
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setApproveDialogOpen(true);
                        }}
                        disabled={approveMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setRejectDialogOpen(true);
                        }}
                        disabled={rejectMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will update the invoice balance and mark the payment as completed.
              </AlertDescription>
            </Alert>
            {selectedPayment && (
              <div className="space-y-2 text-sm">
                <p><strong>Student:</strong> {selectedPayment.student.firstName} {selectedPayment.student.lastName}</p>
                <p><strong>Amount:</strong> ₦{selectedPayment.amount.toLocaleString()}</p>
                <p><strong>Invoice:</strong> {selectedPayment.invoice.invoiceNumber}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this approval..."
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={approveMutation.isPending}>
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will mark the payment as failed. The invoice balance will not be updated.
              </AlertDescription>
            </Alert>
            {selectedPayment && (
              <div className="space-y-2 text-sm">
                <p><strong>Student:</strong> {selectedPayment.student.firstName} {selectedPayment.student.lastName}</p>
                <p><strong>Amount:</strong> ₦{selectedPayment.amount.toLocaleString()}</p>
                <p><strong>Invoice:</strong> {selectedPayment.invoice.invoiceNumber}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this payment is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={rejectMutation.isPending || !rejectReason}>
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proof Viewer Dialog */}
      <Dialog open={!!selectedPayment && !approveDialogOpen && !rejectDialogOpen} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <p><strong>Student:</strong> {selectedPayment.student.firstName} {selectedPayment.student.lastName}</p>
                <p><strong>Amount:</strong> ₦{selectedPayment.amount.toLocaleString()}</p>
                {selectedPayment.referenceNumber && (
                  <p><strong>Reference:</strong> {selectedPayment.referenceNumber}</p>
                )}
                <p><strong>Date:</strong> {new Date(selectedPayment.paymentDate).toLocaleDateString()}</p>
              </div>
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm text-muted-foreground mb-2">Proof of Payment</p>
                {selectedPayment.proofOfPaymentId ? (
                  <img
                    src={`https://res.cloudinary.com/${selectedPayment.proofOfPaymentId}`}
                    alt="Payment Proof"
                    className="max-w-full max-h-96 mx-auto rounded"
                  />
                ) : (
                  <p className="text-center text-muted-foreground">No proof uploaded</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedPayment(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BursaryLayout>
  );
}
