import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import ValidatedScoreInput from './ValidatedScoreInput';

interface Subject {
  id: string;
  subjectName: string;
  subjectCode: string;
  name?: string;
}

interface StudentScore {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  subjects: {
    [subjectId: string]: {
      ca1Score: number | null;
      ca2Score: number | null;
      examScore: number | null;
      total: number;
      grade: string;
      isComplete: boolean;
    };
  };
}

interface MatrixViewProps {
  subjects: Subject[];
  displayedSubjects: Subject[];
  students: StudentScore[];
  onScoreChange: (
    studentId: string,
    subjectId: string,
    field: 'ca1Score' | 'ca2Score' | 'examScore',
    value: number | null,
  ) => void;
  onSubjectNavigation: (direction: 'previous' | 'next') => void;
  currentSubjectStart: number;
  subjectsPerPage: number;
  readOnly?: boolean;
}

export default function MatrixView({
  subjects,
  displayedSubjects,
  students,
  onScoreChange,
  onSubjectNavigation,
  currentSubjectStart,
  subjectsPerPage,
  readOnly = false,
}: MatrixViewProps) {
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

  const getStatusIcon = (isComplete: boolean) => {
    if (isComplete) {
      return <CheckCircle className="h-3 w-3 text-green-600" />;
    }
    return <XCircle className="h-3 w-3 text-gray-400" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Matrix View - All Students × All Subjects</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSubjectNavigation('previous')}
              disabled={currentSubjectStart === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Subjects
            </Button>
            <span className="text-sm text-muted-foreground">
              Showing {currentSubjectStart + 1}-
              {Math.min(currentSubjectStart + subjectsPerPage, subjects.length)}{' '}
              of {subjects.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSubjectNavigation('next')}
              disabled={
                currentSubjectStart + subjectsPerPage >= subjects.length
              }
            >
              Next Subjects
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="text-left p-2 font-medium border min-w-[150px] sticky left-0 bg-muted z-10">
                  Student
                </th>
                {displayedSubjects.map((subject) => (
                  <th
                    key={subject.id}
                    className="text-center p-2 font-medium border min-w-[380px]"
                  >
                    <div className="font-medium">
                      {subject.subjectName || subject.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {subject.subjectCode}
                    </div>
                  </th>
                ))}
              </tr>
              <tr>
                <th className="text-center p-2 font-medium border min-w-[150px] sticky left-0 bg-muted z-10">
                  Admission #
                </th>
                {displayedSubjects.map((subject) => (
                  <th
                    key={`${subject.id}-ca`}
                    className="text-center p-2 font-medium border"
                  >
                    <div className="grid grid-cols-4 gap-1 text-xs">
                      <span>CA1</span>
                      <span>CA2</span>
                      <span>Exam</span>
                      <span className="font-bold">Total</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.studentId}
                  className="border-t hover:bg-muted/50"
                >
                  <td className="p-2 border sticky left-0 bg-background z-10">
                    <div className="font-medium text-sm">
                      {student.studentName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {student.admissionNumber}
                    </div>
                  </td>
                  {displayedSubjects.map((subject) => {
                    const subjectData = student.subjects[subject.id] || {
                      ca1Score: null,
                      ca2Score: null,
                      examScore: null,
                      total: 0,
                      grade: 'F',
                      isComplete: false,
                    };

                    const calculatedTotal =
                      (subjectData.ca1Score || 0) +
                      (subjectData.ca2Score || 0) +
                      (subjectData.examScore || 0);

                    return (
                      <td
                        key={`${student.studentId}-${subject.id}`}
                        className="p-2 border"
                      >
                        <div className="flex items-center gap-2">
                          <div className="grid grid-cols-4 gap-1 flex-1">
                            <ValidatedScoreInput
                              value={subjectData.ca1Score}
                              onChange={(value) =>
                                onScoreChange(
                                  student.studentId,
                                  subject.id,
                                  'ca1Score',
                                  value,
                                )
                              }
                              type="CA1"
                              disabled={readOnly}
                            />
                            <ValidatedScoreInput
                              value={subjectData.ca2Score}
                              onChange={(value) =>
                                onScoreChange(
                                  student.studentId,
                                  subject.id,
                                  'ca2Score',
                                  value,
                                )
                              }
                              type="CA2"
                              disabled={readOnly}
                            />
                            <ValidatedScoreInput
                              value={subjectData.examScore}
                              onChange={(value) =>
                                onScoreChange(
                                  student.studentId,
                                  subject.id,
                                  'examScore',
                                  value,
                                )
                              }
                              type="Exam"
                              disabled={readOnly}
                            />
                            <div className="flex items-center justify-center bg-muted/50 rounded p-1 h-8 font-bold text-sm">
                              {calculatedTotal}
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
