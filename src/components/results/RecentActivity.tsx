import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, BookOpen, CheckCircle } from 'lucide-react';

interface RecentActivityProps {
  activities: Array<{
    type: 'entry' | 'verification';
    action: string;
    time: string;
    studentId?: string;
    subjectId?: string;
  }>;
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  console.log(
    '📝 [RecentActivity] Component rendering with activities:',
    activities,
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return BookOpen;
      case 'verification':
        return CheckCircle;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'entry':
        return 'text-blue-600 bg-blue-100';
      case 'verification':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No recent activity
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);

              return (
                <div key={index} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
