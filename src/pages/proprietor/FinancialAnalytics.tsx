import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { proprietorApi } from "@/lib/api/proprietor";

export default function FinancialAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await proprietorApi.getFinancialAnalytics();
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (error) {
      console.error("Failed to load financial analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  if (!analytics) {
    return <div className="text-muted-foreground">Failed to load analytics</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Analytics</h1>
        <p className="text-muted-foreground">
          Overview of school finances
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{analytics.summary?.totalIncome?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Fee payments: ₦{analytics.summary?.totalFeePayments?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{analytics.summary?.totalExpenses?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Other income: ₦{analytics.summary?.totalOtherIncome?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{analytics.summary?.netBalance?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.summary?.netBalance >= 0 ? "Profit" : "Loss"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.recentExpenses?.length > 0 ? (
                analytics.recentExpenses.map((expense: any) => (
                  <div key={expense.id} className="flex justify-between text-sm">
                    <span>{expense.description}</span>
                    <span className="font-medium">₦{expense.amount?.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No recent expenses</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.recentIncome?.length > 0 ? (
                analytics.recentIncome.map((income: any) => (
                  <div key={income.id} className="flex justify-between text-sm">
                    <span>{income.description}</span>
                    <span className="font-medium">₦{income.amount?.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No recent income</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
