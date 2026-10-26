import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { parentApi } from "@/lib/api/parent";
import { useNavigate, useParams } from "react-router-dom";
import { WalletCards, ArrowLeft, ArrowRight, AlertCircle, CheckCircle, Clock, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ChildFees() {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const { data: feeData, isLoading } = useQuery({
    queryKey: ["child-fee-overview", studentId],
    queryFn: () => parentApi.getFeeOverview(studentId),
    enabled: !!studentId,
  });

  const feeOverview = feeData?.data;
  const invoices = feeOverview?.breakdown || [];
  const totalOutstanding = feeOverview?.totalOutstanding || 0;
  const totalPaid = feeOverview?.totalPaid || 0;
  const totalFees = feeOverview?.totalFees || 0;

  const outstandingInvoices = invoices.filter((inv: any) => inv.balance > 0);
  const selectedTotal = selectedInvoices.reduce((sum, id) => {
    const invoice = invoices.find((inv: any) => inv.id === id);
    return sum + (invoice?.balance || 0);
  }, 0);

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvoices([...selectedInvoices, invoiceId]);
    } else {
      setSelectedInvoices(selectedInvoices.filter(id => id !== invoiceId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvoices(outstandingInvoices.map((inv: any) => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const handlePaySelected = () => {
    if (selectedInvoices.length > 0) {
      navigate(`/parent/fees/${studentId}/pay`, { 
        state: { invoiceIds: selectedInvoices } 
      });
    }
  };

  const handlePayAll = () => {
    const allOutstandingIds = outstandingInvoices.map((inv: any) => inv.id);
    navigate(`/parent/fees/${studentId}/pay`, { 
      state: { invoiceIds: allOutstandingIds } 
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'PARTIAL':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Partial</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'OVERDUE':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <ParentLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/parent/fees")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fee Details</h1>
            <p className="text-muted-foreground mt-1">View and pay school fees</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
                  <span className="text-muted-foreground">₦</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₦{totalFees.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">₦{totalPaid.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ₦{totalOutstanding.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Actions */}
            {outstandingInvoices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Make payments via bank transfer to the school account. After transferring, upload your payment proof for verification.
                    </AlertDescription>
                  </Alert>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Outstanding</p>
                      <p className="text-2xl font-bold">₦{totalOutstanding.toLocaleString()}</p>
                    </div>
                    <Button
                      onClick={() => handlePayAll()}
                      disabled={outstandingInvoices.length === 0}
                    >
                      Pay All Outstanding
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Invoice List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Invoice Breakdown</CardTitle>
                  {outstandingInvoices.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="select-all"
                        checked={selectedInvoices.length === outstandingInvoices.length && outstandingInvoices.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <Label htmlFor="select-all" className="text-sm">Select All Outstanding</Label>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No fee invoices found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice: any) => (
                      <div
                        key={invoice.id}
                        className={`p-4 rounded-lg border ${invoice.balance > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {invoice.balance > 0 && (
                              <Checkbox
                                checked={selectedInvoices.includes(invoice.id)}
                                onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked as boolean)}
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-medium">{invoice.billName || invoice.invoiceNumber}</p>
                                {getStatusBadge(invoice.status)}
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Invoice Number</p>
                                  <p className="font-medium">{invoice.invoiceNumber}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Amount</p>
                                  <p className="font-medium">₦{invoice.amount.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Paid</p>
                                  <p className="font-medium text-green-600">₦{invoice.amountPaid.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Balance</p>
                                  <p className={`font-medium ${invoice.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    ₦{invoice.balance.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Due Date</p>
                                  <p className="font-medium flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(invoice.dueDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">Term</p>
                                  <p className="font-medium">{invoice.term}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History Link */}
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/parent/fees/${studentId}/history`)}
                >
                  <WalletCards className="mr-2 h-4 w-4" />
                  View Payment History
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </ParentLayout>
  );
}