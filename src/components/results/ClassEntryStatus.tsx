import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface ClassEntryStatusProps {
  classStatus: Array<{
    classId: string;
    className: string;
    totalStudents: number;
    completionPercentage: number;
    entryStatus: 'complete' | 'in_progress' | 'not_started';
  }>;
  onClassClick?: (classId: string) => void;
}

export default function ClassEntryStatus({
  classStatus,
  onClassClick,
}: ClassEntryStatusProps) {
  console.log(
    '📊 [ClassEntryStatus] Component rendering with classStatus:',
    classStatus,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'not_started':
        return 'bg-gray-300';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
      case 'in_progress':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
        );
      case 'not_started':
        return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Entry Status</CardTitle>
      </CardHeader>
      <CardContent className="h-96 overflow-y-auto">
        <div className="space-y-4">
          {classStatus.map((cls) => (
            <div
              key={cls.classId}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{cls.className}</span>
                  {getStatusBadge(cls.entryStatus)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{cls.totalStudents} students</span>
                  <span>{cls.completionPercentage}% complete</span>
                </div>
                <Progress
                  value={cls.completionPercentage}
                  className="mt-2 h-2"
                />
              </div>
              {onClassClick && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onClassClick(cls.classId)}
                  className="ml-4"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
