import { useQuery } from "@tanstack/react-query";
import { ParentLayout } from "@/components/layout/ParentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parentApi } from "@/lib/api/parent";
import { useNavigate } from "react-router-dom";
import { WalletCards, UsersRound, ArrowRight, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function FeesOverview() {
  const navigate = useNavigate();

  const { data: childrenData, isLoading: childrenLoading } = useQuery({
    queryKey: ["parent-children"],
    queryFn: () => parentApi.getMyChildren(),
  });

  const children = childrenData?.data || [];

  return (
    <ParentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">School Fees</h1>
          <p className="text-muted-foreground mt-1">View and manage your children's school fees</p>
        </div>

        {childrenLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : children.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              No children linked to your account
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {children.map((child: any) => (
              <ChildFeeCard 
                key={child.id} 
                child={child} 
                onPayNow={() => navigate(`/parent/fees/${child.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </ParentLayout>
  );
}

function ChildFeeCard({ child, onPayNow }: { child: any; onPayNow: () => void }) {
  const { data: feeData, isLoading } = useQuery({
    queryKey: ["child-fee-overview", child.id],
    queryFn: () => parentApi.getFeeOverview(child.id),
    enabled: !!child.id,
  });

  const feeOverview = feeData?.data;
  const totalOutstanding = feeOverview?.totalOutstanding || 0;
  const totalPaid = feeOverview?.totalPaid || 0;
  const totalFees = feeOverview?.totalFees || 0;

  const hasOutstanding = totalOutstanding > 0;
  const isFullyPaid = totalOutstanding === 0 && totalFees > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{child.firstName} {child.lastName}</CardTitle>
            <p className="text-sm text-muted-foreground">{child.class?.name || "N/A"}</p>
            <p className="text-xs text-muted-foreground">{child.admissionNumber}</p>
          </div>
          {isFullyPaid ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : hasOutstanding ? (
            <AlertCircle className="h-5 w-5 text-orange-500" />
          ) : (
            <Clock className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Fees</span>
                <span className="font-medium">₦{totalFees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount Paid</span>
                <span className="font-medium text-green-600">₦{totalPaid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Outstanding</span>
                <span className={`font-medium ${hasOutstanding ? 'text-red-600' : 'text-green-600'}`}>
                  ₦{totalOutstanding.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isFullyPaid ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Fully Paid
                </Badge>
              ) : hasOutstanding ? (
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                  Outstanding
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                  No Fees
                </Badge>
              )}
            </div>

            <Button 
              className="w-full" 
              onClick={onPayNow}
            >
              <UsersRound className="mr-2 h-4 w-4" />
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}