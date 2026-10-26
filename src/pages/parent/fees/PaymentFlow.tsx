import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parentApi } from "@/lib/api/parent";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, WalletCards, AlertCircle, CheckCircle, Loader2, Download, Copy, Check, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PaymentFlow() {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();
  const location = useLocation();
  const invoiceIds = location.state?.invoiceIds || [];
  const [paymentStep, setPaymentStep] = useState<'review' | 'upload' | 'processing' | 'success' | 'failed'>('review');
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const BANK_DETAILS = {
    accountNumber: '1011077261',
    bank: 'Zenith Bank',
    accountName: 'INTERNATIONAL NUR/PRIMARY SCHOOL'
  };

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

  const uploadProofMutation = useMutation({
    mutationFn: async (data: { proof: File; referenceNumber: string; paymentDate: string }) => {
      return parentApi.uploadPaymentProof(studentId, {
        proof: data.proof,
        referenceNumber: data.referenceNumber,
        paymentDate: data.paymentDate,
        invoiceIds,
      });
    },
    onSuccess: () => {
      setPaymentStep('success');
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
    setPaymentStep('upload');
  };

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleUploadProof = () => {
    if (proofFile) {
      setPaymentStep('processing');
      uploadProofMutation.mutate({
        proof: proofFile,
        referenceNumber: referenceNumber || undefined,
        paymentDate
      });
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
                <CardTitle>Payment Instructions</CardTitle>
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

                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Bank Transfer Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Bank Name</Label>
                      <p className="font-semibold">{BANK_DETAILS.bank}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Account Number</Label>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-lg">{BANK_DETAILS.accountNumber}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCopyAccountNumber}
                          className="h-8 w-8"
                        >
                          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Account Name</Label>
                      <p className="font-semibold">{BANK_DETAILS.accountName}</p>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please transfer the total amount to the bank account above. After making the transfer, click "Upload Payment Proof" to upload your receipt/reference number for verification.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleGoBack}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleInitializePayment}
                    className="flex-1"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Payment Proof
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {paymentStep === 'upload' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Upload Payment Proof</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please upload your payment receipt or transfer confirmation. The school bursary will verify your payment and update your account.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="proof">Payment Receipt/Proof *</Label>
                    <Input
                      id="proof"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground">Accepted formats: JPG, PNG, PDF</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference/Transaction Number *</Label>
                    <Input
                      id="reference"
                      placeholder="e.g., UTR123456789"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentDate">Payment Date</Label>
                    <Input
                      id="paymentDate"
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setPaymentStep('review')}>
                    Back
                  </Button>
                  <Button
                    onClick={handleUploadProof}
                    disabled={!proofFile || uploadProofMutation.isPending}
                    className="flex-1"
                  >
                    {uploadProofMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Submit Payment Proof
                      </>
                    )}
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