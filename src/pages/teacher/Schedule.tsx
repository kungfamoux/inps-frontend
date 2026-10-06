import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeacherSchedule() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground mt-2">View your teaching schedule.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teaching Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Schedule feature coming soon.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
