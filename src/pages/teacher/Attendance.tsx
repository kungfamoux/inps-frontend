import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeacherAttendance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground mt-2">Mark and manage student attendance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Attendance feature coming soon.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
