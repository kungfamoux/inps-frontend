import { type AttendanceSummary } from '@/types/attendance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AttendanceSummaryProps {
  summary: AttendanceSummary;
}

export function AttendanceSummary({ summary }: AttendanceSummaryProps) {
  const stats = [
    { label: 'Total Students', value: summary.total, color: 'text-foreground' },
    { label: 'Present', value: summary.present, percentage: summary.presentPercentage, color: 'text-green-600 dark:text-green-400' },
    { label: 'Absent', value: summary.absent, percentage: summary.absentPercentage, color: 'text-red-600 dark:text-red-400' },
    { label: 'Late', value: summary.late, percentage: summary.latePercentage, color: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Excused', value: summary.excused, percentage: summary.excusedPercentage, color: 'text-blue-600 dark:text-blue-400' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-lg border">
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
              {stat.percentage !== undefined && (
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.percentage.toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
