import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parentApi } from "@/lib/api/parent";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, WalletCards, AlertCircle, CheckCircle, Loader2, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function PaymentFlow() {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();
  const location = useLocation();
  const invoiceIds = location.state?.invoiceIds || [];
  const [paymentStep, setPaymentStep] = useState<'review' | 'processing' | 'success' | 'failed'>('review');
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  const { data: feeData, isLoading } = useQuery({
    queryKey: ["child-fee-overview", studentId],
    queryFn: () => parentApi.getFeeOverview(studentId),
    enabled: !!studentId,
  });

  const initializeMutation = useMutation({
    mutationFn: (ids: string[]) => parentApi.initializePayment(studentId, ids),
    onSuccess: (data) => {
      setPaymentReference(data.data.reference);
      // Redirect to Paystack
      window.location.href = data.data.authorizationUrl;
    },
    onError: (error) => {
      setPaymentStep('failed');
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (reference: string) => parentApi.verifyPayment(reference),
    onSuccess: (data) => {
      setPaymentStep('success');
    },
    onError: (error) => {
      setPaymentStep('failed');
    },
  });

  const feeOverview = feeData?.data;
  const invoices = feeOverview?.breakdown || [];
  const selectedInvoices = invoices.filter((inv: any) => invoiceIds.includes(inv.id));
  const totalAmount = selectedInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  // Check for payment reference in URL query params (Paystack callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    
    if (reference && paymentStep === 'review') {
      setPaymentStep('processing');
      verifyMutation.mutate(reference);
    }
  }, []);

  const handleInitializePayment = () => {
    if (invoiceIds.length > 0) {
      setPaymentStep('processing');
      initializeMutation.mutate(invoiceIds);
    }
  };

  const handleGoBack = () => {
    navigate(`/parent/fees/${studentId}`);
  };

  const handleDownloadReceipt = () => {
    if (paymentReference) {
      navigate(`/parent/fees/${studentId}/receipt/${paymentReference}`);
    }
  };

  const handleViewHistory = () => {
    navigate(`/parent/fees/${studentId}/history`);
  };

  if (isLoading) {
    return (
      <ParentLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Payment</h1>
              <p className="text-muted-foreground mt-1">Complete your payment</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-12">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </ParentLayout>
    );
  }

  return (
    <ParentLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleGoBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payment</h1>
            <p className="text-muted-foreground mt-1">Complete your payment securely</p>
          </div>
        </div>

        {paymentStep === 'review' && (
          <>
            {/* Review Section */}
            <Card>
              <CardHeader>
                <CardTitle>Review Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="text-sm text-blue-700">Total Amount to Pay</p>
                    <p className="text-3xl font-bold text-blue-900">₦{totalAmount.toLocaleString()}</p>
                  </div>
                  <WalletCards className="h-8 w-8 text-blue-500" />
                </div>

                <div>
                  <h3 className="font-medium mb-3">Invoices to Pay</h3>
                  <div className="space-y-3">
                    {selectedInvoices.map((invoice: any) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{invoice.billName || invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">{invoice.term} - {invoice.academicYear}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₦{invoice.balance.toLocaleString()}</p>
                          <Badge variant="outline" className="text-xs">
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Online payments are currently unavailable. Please contact the school bursary to make manual payments or pay directly at the school office.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleGoBack}>
                    Back to Fees
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {paymentStep === 'processing' && (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
              <p className="text-muted-foreground">Please wait while we process your payment...</p>
            </CardContent>
          </Card>
        )}

        {paymentStep === 'success' && (
          <Card>
            <CardContent className="p-12 text-center space-y-6">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
                <p className="text-muted-foreground">Your payment has been processed successfully.</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleDownloadReceipt}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </Button>
                <Button onClick={handleViewHistory}>
                  <WalletCards className="mr-2 h-4 w-4" />
                  View Payment History
                </Button>
              </div>
              <Button variant="ghost" onClick={handleGoBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Fees
              </Button>
            </CardContent>
          </Card>
        )}

        {paymentStep === 'failed' && (
          <Card>
            <CardContent className="p-12 text-center space-y-6">
              <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h3>
                <p className="text-muted-foreground">
                  There was an error processing your payment. Please try again or contact support if the problem persists.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleGoBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Fees
                </Button>
                <Button onClick={handleInitializePayment}>
                  <WalletCards className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ParentLayout>
  );
}