import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import ValidatedScoreInput from './ValidatedScoreInput';

interface StudentScore {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  ca1Score: number | null;
  ca2Score: number | null;
  examScore: number | null;
  total: number;
  grade: string;
  isComplete: boolean;
  remarks?: string;
}

interface ScoreEntrySheetProps {
  students: StudentScore[];
  onScoreChange: (
    studentId: string,
    field: 'ca1Score' | 'ca2Score' | 'examScore',
    value: number | null,
  ) => void;
  onRemarkChange?: (studentId: string, remark: string) => void;
  showRemarks?: boolean;
  readOnly?: boolean;
}

export default function ScoreEntrySheet({
  students,
  onScoreChange,
  onRemarkChange,
  showRemarks = false,
  readOnly = false,
}: ScoreEntrySheetProps) {
  const calculateTotal = (
    ca1: number | null,
    ca2: number | null,
    exam: number | null,
  ) => {
    return (ca1 || 0) + (ca2 || 0) + (exam || 0);
  };

  const calculateGrade = (total: number): string => {
    if (total >= 90) return 'A';
    if (total >= 70) return 'C';
    if (total >= 55) return 'P';
    return 'F';
  };

  const getStatusIcon = (isComplete: boolean) => {
    if (isComplete) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    const hasAnyScore = students.some(
      (s) => s.ca1Score !== null || s.ca2Score !== null || s.examScore !== null,
    );
    if (hasAnyScore) {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
    return <XCircle className="h-4 w-4 text-gray-400" />;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'C':
        return 'bg-blue-100 text-blue-800';
      case 'P':
        return 'bg-yellow-100 text-yellow-800';
      case 'F':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium">#</th>
            <th className="text-left p-3 font-medium">Student Name</th>
            <th className="text-left p-3 font-medium">Admission Number</th>
            <th className="text-center p-3 font-medium">CA1 (30)</th>
            <th className="text-center p-3 font-medium">CA2 (30)</th>
            <th className="text-center p-3 font-medium">Exam (40)</th>
            <th className="text-center p-3 font-medium">Total</th>
            <th className="text-center p-3 font-medium">Grade</th>
            <th className="text-center p-3 font-medium">Status</th>
            {showRemarks && (
              <th className="text-left p-3 font-medium">Remarks</th>
            )}
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr key={student.studentId} className="border-t hover:bg-muted/50">
              <td className="p-3 text-center">{index + 1}</td>
              <td className="p-3">
                <div className="font-medium">{student.studentName}</div>
              </td>
              <td className="p-3 text-sm text-muted-foreground">
                {student.admissionNumber}
              </td>
              <td className="p-3">
                <ValidatedScoreInput
                  value={student.ca1Score}
                  onChange={(value) =>
                    onScoreChange(student.studentId, 'ca1Score', value)
                  }
                  type="CA1"
                  disabled={readOnly}
                  className="w-20"
                />
              </td>
              <td className="p-3">
                <ValidatedScoreInput
                  value={student.ca2Score}
                  onChange={(value) =>
                    onScoreChange(student.studentId, 'ca2Score', value)
                  }
                  type="CA2"
                  disabled={readOnly}
                  className="w-20"
                />
              </td>
              <td className="p-3">
                <ValidatedScoreInput
                  value={student.examScore}
                  onChange={(value) =>
                    onScoreChange(student.studentId, 'examScore', value)
                  }
                  type="Exam"
                  disabled={readOnly}
                  className="w-24"
                />
              </td>
              <td className="p-3 text-center font-medium">{student.total}</td>
              <td className="p-3 text-center">
                <Badge className={getGradeColor(student.grade)}>
                  {student.grade}
                </Badge>
              </td>
              <td className="p-3 text-center">
                {getStatusIcon(student.isComplete)}
              </td>
              {showRemarks && onRemarkChange && (
                <td className="p-3">
                  <Textarea
                    placeholder="Enter remarks..."
                    value={student.remarks || ''}
                    onChange={(e) =>
                      onRemarkChange(student.studentId, e.target.value)
                    }
                    disabled={readOnly}
                    className="min-h-[60px] resize-none"
                  />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
