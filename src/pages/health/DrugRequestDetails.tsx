import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download } from "lucide-react";
import { healthApi, DrugRequest, DrugPurchase } from "@/lib/api/health";
import { toast } from "sonner";

export default function DrugRequestDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<DrugRequest | null>(null);
  const [purchases, setPurchases] = useState<DrugPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadRequestDetails(id);
    }
  }, [id]);

  const loadRequestDetails = async (requestId: string) => {
    try {
      const [reqRes, purchasesRes] = await Promise.all([
        healthApi.getDrugRequest(requestId),
        healthApi.getDrugPurchases(requestId),
      ]);

      if (reqRes.success && reqRes.data) {
        setRequest(reqRes.data);
      }
      if (purchasesRes.success && purchasesRes.data) {
        setPurchases(purchasesRes.data);
      }
    } catch (error) {
      console.error("Failed to load request details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: "COMPLETED" | "CANCELLED") => {
    if (!id) return;
    try {
      const res = await healthApi.updateDrugRequestStatus(id, status);
      if (res.success) {
        toast.success(`Request marked as ${status}`);
        loadRequestDetails(id);
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!request) {
    return <div className="text-muted-foreground">Request not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/health/drug-requests")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Drug Request #{request.id.slice(0, 8)}
          </h1>
          <p className="text-muted-foreground">
            {new Date(request.requestDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <span className="font-medium">Status:</span> {request.status}
            </p>
            <p>
              <span className="font-medium">Nurse:</span>{" "}
              {request.nurse.firstName} {request.nurse.lastName}
            </p>
            {request.notes && (
              <p>
                <span className="font-medium">Notes:</span> {request.notes}
              </p>
            )}
            {request.listImage && (
              <div>
                <span className="font-medium">Drug List:</span>
                <a
                  href={request.listImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-blue-600 hover:underline"
                >
                  View Image
                </a>
              </div>
            )}
            {request.status === "PENDING" && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate("COMPLETED")}
                >
                  Mark Completed
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate("CANCELLED")}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <p className="text-muted-foreground">No purchases recorded</p>
            ) : (
              <div className="space-y-2">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="border rounded p-3">
                    <p className="font-medium">
                      {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </p>
                    {purchase.amount && (
                      <p className="text-sm">Amount: ₦{purchase.amount}</p>
                    )}
                    {purchase.supplier && (
                      <p className="text-sm">Supplier: {purchase.supplier}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {purchase.invoiceImage && (
                        <a
                          href={purchase.invoiceImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Invoice
                        </a>
                      )}
                      {purchase.receiptImage && (
                        <a
                          href={purchase.receiptImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Receipt
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
