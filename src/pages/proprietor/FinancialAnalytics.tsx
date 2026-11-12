import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { proprietorApi } from "@/lib/api/proprietor";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Receipt } from "lucide-react";

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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-muted-foreground">Failed to load analytics</div>;
  }

  const financialSummary = [
    { name: 'Total Income', value: analytics.summary?.totalIncome || 0, icon: DollarSign, color: 'text-emerald-500' },
    { name: 'Total Expenses', value: analytics.summary?.totalExpenses || 0, icon: Wallet, color: 'text-red-500' },
    { name: 'Net Balance', value: analytics.summary?.netBalance || 0, icon: TrendingUp, color: analytics.summary?.netBalance >= 0 ? 'text-emerald-500' : 'text-red-500' },
  ];

  const incomeBreakdown = [
    { name: 'Fee Payments', value: analytics.summary?.totalFeePayments || 0 },
    { name: 'Other Income', value: analytics.summary?.totalOtherIncome || 0 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Financial Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Overview of school finances and transactions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {financialSummary.map((item) => (
          <Card key={item.name} className="shadow-lg border-2 hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <item.icon className={`h-4 w-4 ${item.color}`} />
                {item.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₦{item.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {item.name === 'Net Balance' && item.value >= 0 ? 'Profit' : item.name === 'Net Balance' ? 'Loss' : ''}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-xl">Income Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={incomeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `₦${value.toLocaleString()}`}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-xl">Financial Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Fee Collection Rate</span>
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {analytics.summary?.totalFeePayments && analytics.summary?.totalIncome
                      ? ((analytics.summary.totalFeePayments / analytics.summary.totalIncome) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Expense Ratio</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {analytics.summary?.totalExpenses && analytics.summary?.totalIncome
                      ? ((analytics.summary.totalExpenses / analytics.summary.totalIncome) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentExpenses?.length > 0 ? (
                analytics.recentExpenses.map((expense: any, index: number) => (
                  <div key={expense.id || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-500">-₦{expense.amount?.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No recent expenses</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Recent Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentIncome?.length > 0 ? (
                analytics.recentIncome.map((income: any, index: number) => (
                  <div key={income.id || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{income.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(income.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-500">+₦{income.amount?.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">No recent income</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
