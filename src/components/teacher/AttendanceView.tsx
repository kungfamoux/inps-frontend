import { AttendanceData } from '@/types/attendance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from './StatusBadge';

interface AttendanceViewProps {
  data: AttendanceData[];
  date: string;
}

export function AttendanceView({ data, date }: AttendanceViewProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Attendance for {date}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No attendance records found for this date.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance for {date}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Marked by {data[0].markedBy.firstName} {data[0].markedBy.lastName}
        </p>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Admission No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead className="w-[140px]">Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.student.admissionNumber}
                  </TableCell>
                  <TableCell>
                    {record.student.firstName} {record.student.lastName}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={record.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {record.note || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
