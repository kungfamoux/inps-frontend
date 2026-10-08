import { useState } from 'react';
import { AttendanceStatus, AttendanceRecord } from '@/types/attendance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, X } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
}

interface AttendanceFormProps {
  students: Student[];
  date: string;
  onSubmit: (records: AttendanceRecord[]) => Promise<void>;
  isSubmitting: boolean;
}

export function AttendanceForm({ students, date, onSubmit, isSubmitting }: AttendanceFormProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>(
    students.map((student) => ({
      admissionNumber: student.admissionNumber,
      status: 'PRESENT' as AttendanceStatus,
      note: '',
    }))
  );

  const handleStatusChange = (admissionNumber: string, status: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.admissionNumber === admissionNumber ? { ...record, status } : record
      )
    );
  };

  const handleNoteChange = (admissionNumber: string, note: string) => {
    setRecords((prev) =>
      prev.map((record) =>
        record.admissionNumber === admissionNumber ? { ...record, note } : record
      )
    );
  };

  const markAllPresent = () => {
    setRecords((prev) =>
      prev.map((record) => ({ ...record, status: 'PRESENT' as AttendanceStatus }))
    );
  };

  const clearAll = () => {
    setRecords((prev) =>
      prev.map((record) => ({ ...record, status: 'PRESENT' as AttendanceStatus, note: '' }))
    );
  };

  const handleSubmit = async () => {
    // Validate all students have status
    const invalidRecords = records.filter((r) => !r.status);
    if (invalidRecords.length > 0) {
      alert('Please select status for all students');
      return;
    }

    // Validate notes for ABSENT and EXCUSED
    const missingNotes = records.filter(
      (r) => (r.status === 'ABSENT' || r.status === 'EXCUSED') && !r.note?.trim()
    );
    if (missingNotes.length > 0) {
      alert('Please provide notes for absent and excused students');
      return;
    }

    await onSubmit(records);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mark Attendance - {date}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllPresent}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark All Present
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Admission No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead className="w-[180px]">Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const record = records.find((r) => r.admissionNumber === student.admissionNumber);
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.admissionNumber}</TableCell>
                    <TableCell>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={record?.status || 'PRESENT'}
                        onValueChange={(value: AttendanceStatus) =>
                          handleStatusChange(student.admissionNumber, value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRESENT">Present</SelectItem>
                          <SelectItem value="ABSENT">Absent</SelectItem>
                          <SelectItem value="LATE">Late</SelectItem>
                          <SelectItem value="EXCUSED">Excused</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Add note..."
                        value={record?.note || ''}
                        onChange={(e) => handleNoteChange(student.admissionNumber, e.target.value)}
                        className={
                          (record?.status === 'ABSENT' || record?.status === 'EXCUSED')
                            ? 'border-red-300 dark:border-red-700'
                            : ''
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Attendance'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
