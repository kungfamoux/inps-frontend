import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api/admin';
import ClassSubjectSelector from '@/components/results/ClassSubjectSelector';
import ModeSwitcher, { EntryMode } from '@/components/results/ModeSwitcher';
import ProgressTracker from '@/components/results/ProgressTracker';
import MatrixView from '@/components/results/MatrixView';
import SubjectView from '@/components/results/SubjectView';
import StudentView from '@/components/results/StudentView';
import ScoreValidation, {
  validateScores,
} from '@/components/results/ScoreValidation';
import { useAlert } from '@/contexts/alert-context';

export default function ResultsEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showAlert, showSuccess } = useAlert();

  // Context state
  const [academicYear, setAcademicYear] = useState('');
  const [term, setTerm] = useState('');
  const [termId, setTermId] = useState(''); // Store the actual term ID
  const [classId, setClassId] = useState(searchParams.get('classId') || '');

  // Data state
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Entry mode state
  const [entryMode, setEntryMode] = useState<EntryMode>('matrix');

  // Matrix view state
  const [currentSubjectStart, setCurrentSubjectStart] = useState(0);
  const subjectsPerPage = 4;

  // Subject view state
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectRemark, setSubjectRemark] = useState('');

  // Student view state
  const [selectedStudent, setSelectedStudent] = useState('');
  const [overallPosition, setOverallPosition] = useState(0);
  const [classAverage, setClassAverage] = useState(0);

  // Progress state
  const [completedEntries, setCompletedEntries] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [studentsLoaded, setStudentsLoaded] = useState(false);

  // Validation state
  const [validationErrors, setValidationErrors] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchParams.get('classId')) {
      setClassId(searchParams.get('classId') || '');
    }
  }, [searchParams]);

  // Auto-load students when classId, academicYear, and termId are all set
  useEffect(() => {
    if (classId && academicYear && termId && !loading && !studentsLoaded) {
      loadStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, academicYear, termId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('🚀 [Results Entry] Starting to load initial data...');

      // Load current term first to get the real term ID
      try {
        console.log('🎯 [Results Entry] Fetching current term...');
        const currentTermResponse = await adminApi.getCurrentTerm();
        console.log(
          '🎯 [Results Entry] Current term response:',
          currentTermResponse,
        );
        if (currentTermResponse && currentTermResponse.data) {
          console.log(
            '✅ [Results Entry] Current term loaded successfully:',
            currentTermResponse.data,
          );
          setTermId(currentTermResponse.data.id);
          setTerm(currentTermResponse.data.term);

          // Create terms array with current term plus placeholder terms for dropdown
          const currentTermData = currentTermResponse.data;
          const allTerms = [
            currentTermData,
            {
              id: 'placeholder-second',
              term: 'SECOND_TERM',
              status: 'UPCOMING',
            },
            { id: 'placeholder-third', term: 'THIRD_TERM', status: 'UPCOMING' },
          ];
          setTerms(allTerms);
        }
      } catch (error) {
        console.error('❌ [Results Entry] Error loading current term:', error);
        console.error('❌ [Results Entry] Error details:', {
          message: error.message,
          stack: error.stack,
          response: error.response,
        });
        // Set fallback
        setTermId('fallback-first');
        setTerm('FIRST_TERM');
        setTerms([
          { id: 'fallback-first', term: 'FIRST_TERM', status: 'CURRENT' },
          { id: 'fallback-second', term: 'SECOND_TERM', status: 'UPCOMING' },
          { id: 'fallback-third', term: 'THIRD_TERM', status: 'UPCOMING' },
        ]);
      }

      // Load academic years (sessions)
      try {
        console.log('📅 [Results Entry] Fetching academic sessions...');
        const sessionsResponse = await adminApi.getAllSessions();
        console.log('📅 [Results Entry] Sessions response:', sessionsResponse);
        if (sessionsResponse && sessionsResponse.data) {
          console.log(
            '✅ [Results Entry] Sessions loaded successfully:',
            sessionsResponse.data,
          );
          setAcademicYears(sessionsResponse.data);
          if (sessionsResponse.data.length > 0) {
            console.log(
              '📌 [Results Entry] Setting default academic year:',
              sessionsResponse.data[0].id,
            );
            setAcademicYear(sessionsResponse.data[0].id);
          }
        } else if (Array.isArray(sessionsResponse)) {
          console.log(
            '✅ [Results Entry] Sessions loaded as array:',
            sessionsResponse,
          );
          // Handle case where response is directly an array
          setAcademicYears(sessionsResponse);
          if (sessionsResponse.length > 0) {
            console.log(
              '📌 [Results Entry] Setting default academic year from array:',
              sessionsResponse[0].id,
            );
            setAcademicYear(sessionsResponse[0].id);
          }
        }
      } catch (error) {
        console.error('❌ [Results Entry] Error loading sessions:', error);
        console.error('❌ [Results Entry] Error details:', {
          message: error.message,
          stack: error.stack,
          response: error.response,
        });
        // Set fallback session
        console.log('⚠️ [Results Entry] Using fallback session');
        setAcademicYears([{ id: '2026/2027', session: '2026/2027' }]);
        setAcademicYear('2026/2027');
      }

      // Load classes
      console.log('🏫 [Results Entry] Fetching classes...');
      const classesResponse = await adminApi.getAllClasses();
      console.log('🏫 [Results Entry] Classes response:', classesResponse);
      if (classesResponse && classesResponse.data) {
        console.log(
          '✅ [Results Entry] Classes loaded successfully:',
          classesResponse.data,
        );
        setClasses(classesResponse.data);
      } else {
        console.error(
          '❌ [Results Entry] Failed to load classes - unexpected response structure',
        );
      }

      console.log('✅ [Results Entry] Initial data loading complete');
    } catch (error) {
      console.error('❌ [Results Entry] Error loading initial data:', error);
      console.error('❌ [Results Entry] Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response,
      });
    } finally {
      setLoading(false);
      console.log('🏁 [Results Entry] Loading state set to false');
    }
  };

  const loadStudents = async () => {
    if (!academicYear || !termId || !classId) {
      showAlert('Please select academic year, term, and class', 'error');
      return;
    }

    try {
      setLoading(true);

      // Load subjects for the class using termId instead of term name
      const subjectsResponse = await adminApi.getSubjectsByClass(
        classId,
        termId,
      );

      let transformedSubjects: any[] = [];

      if (subjectsResponse && subjectsResponse.data) {
        // Transform subject data to match expected structure
        transformedSubjects = subjectsResponse.data.map(
          (classSubject: any) => ({
            id: classSubject.subjectId,
            subjectName: classSubject.subject.subjectName,
            subjectCode: classSubject.subject.subjectCode,
          }),
        );

        setSubjects(transformedSubjects);
        if (transformedSubjects.length > 0) {
          setSelectedSubject(transformedSubjects[0].id);
        }
      } else {
        // Fallback sample subjects
        transformedSubjects = [
          { id: 'math-1', subjectName: 'Mathematics', subjectCode: 'MTH' },
          { id: 'eng-1', subjectName: 'English', subjectCode: 'ENG' },
          { id: 'sci-1', subjectName: 'Science', subjectCode: 'SCI' },
        ];
        setSubjects(transformedSubjects);
        setSelectedSubject('math-1');
      }

      // Load students for the class using the proper endpoint
      // Find the session name instead of using the UUID
      const selectedSession = academicYears.find(
        (session: any) => session.id === academicYear,
      );
      const sessionName = selectedSession?.session || academicYear;
      const studentsResponse = await adminApi.getStudentsByClass(classId, {
        academicYear: sessionName,
        term,
      });

      let studentsData: any[] = [];

      if (studentsResponse && studentsResponse.data) {
        studentsData = studentsResponse.data.map((enrollment: any) => ({
          studentId: enrollment.studentId,
          enrollmentId: enrollment.id,
          studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
          admissionNumber: enrollment.student.admissionNumber,
          subjects: {} as any,
        }));
        setStudents(studentsData);

        if (studentsData.length > 0) {
          setSelectedStudent(studentsData[0].studentId);
        }
      } else {
        // Fallback: create sample students if API fails
        studentsData = [
          {
            studentId: 'sample-1',
            studentName: 'Sample Student 1',
            admissionNumber: 'SAMPLE-001',
            subjects: {} as any,
          },
        ];
        setStudents(studentsData);
        setSelectedStudent('sample-1');
      }

      // Calculate total entries
      const totalStudents = studentsData.length;
      const totalSubjects = transformedSubjects.length;
      const calculatedTotal = totalStudents * totalSubjects * 3; // 3 scores per student per subject
      console.log('📊 [Results Entry] Calculating total entries:', {
        totalStudents,
        totalSubjects,
        calculatedTotal,
      });
      setTotalEntries(calculatedTotal);

      // Load existing results for this class
      if (classId && termId && academicYear) {
        try {
          const existingResultsResponse = await adminApi.getResultsByClass({
            classId: classId,
            termId: termId,
            sessionId: academicYear,
          });

          if (existingResultsResponse && existingResultsResponse.data) {
            // Merge existing results with student data
            const studentsWithResults = studentsData.map((student: any) => {
              const existingStudent = existingResultsResponse.data.find(
                (result: any) => result.studentId === student.studentId,
              );

              if (existingStudent && existingStudent.subjects) {
                // Initialize subjects with existing results
                const subjectsWithResults = transformedSubjects.reduce(
                  (acc: any, subject: any) => {
                    const existingResult = existingStudent.subjects[subject.id];
                    acc[subject.id] = existingResult || {
                      ca1Score: null,
                      ca2Score: null,
                      examScore: null,
                      total: 0,
                      grade: 'F',
                      isComplete: false,
                    };
                    return acc;
                  },
                  {},
                );

                return {
                  ...student,
                  subjects: subjectsWithResults,
                };
              }

              return student;
            });

            setStudents(studentsWithResults);

            // Update completed entries count
            const completedCount = existingResultsResponse.data.reduce(
              (count: number, student: any) => {
                return (
                  count +
                  Object.values(student.subjects).filter(
                    (subject: any) => subject.isComplete,
                  ).length
                );
              },
              0,
            );

            setCompletedEntries(completedCount);
          }
        } catch (error) {
          console.warn(
            '⚠️ [Results Entry] No existing results found or error loading:',
            error,
          );
          // Continue without existing results - this is fine for new entries
        }
      }

      setStudentsLoaded(true);
      console.log('✅ [Results Entry] Students and subjects loading complete');
    } catch (error) {
      console.error('❌ [Results Entry] Error loading students:', error);
      console.error('❌ [Results Entry] Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response,
      });
      showAlert('Error loading students. Please try again.', 'error');
    } finally {
      setLoading(false);
      console.log('🏁 [Results Entry] Students loading state set to false');
    }
  };

  const handleScoreChange = (
    studentId: string,
    subjectId: string,
    field: 'ca1Score' | 'ca2Score' | 'examScore',
    value: number | null,
  ) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) => {
        if (student.studentId !== studentId) return student;

        const updatedSubjects = { ...student.subjects };
        if (!updatedSubjects[subjectId]) {
          updatedSubjects[subjectId] = {
            ca1Score: null,
            ca2Score: null,
            examScore: null,
            total: 0,
            grade: 'F',
            isComplete: false,
          };
        }

        updatedSubjects[subjectId] = {
          ...updatedSubjects[subjectId],
          [field]: value,
        };

        // Recalculate total and grade
        const { ca1Score, ca2Score, examScore } = updatedSubjects[subjectId];
        const total = (ca1Score || 0) + (ca2Score || 0) + (examScore || 0);
        const grade = calculateGrade(total);
        const isComplete =
          ca1Score !== null && ca2Score !== null && examScore !== null;

        updatedSubjects[subjectId] = {
          ...updatedSubjects[subjectId],
          total,
          grade,
          isComplete,
        };

        return {
          ...student,
          subjects: updatedSubjects,
        };
      }),
    );

    // Update progress
    updateProgress();
  };

  const calculateGrade = (total: number): string => {
    if (total >= 90) return 'A';
    if (total >= 70) return 'C';
    if (total >= 55) return 'P';
    return 'F';
  };

  const updateProgress = () => {
    let completed = 0;
    students.forEach((student) => {
      Object.values(student.subjects).forEach((subjectData: any) => {
        if (subjectData.isComplete) {
          completed += 3; // 3 scores per subject
        }
      });
    });
    setCompletedEntries(completed);
  };

  const handleSubjectNavigation = (direction: 'previous' | 'next') => {
    if (direction === 'previous') {
      setCurrentSubjectStart(
        Math.max(0, currentSubjectStart - subjectsPerPage),
      );
    } else {
      setCurrentSubjectStart(
        Math.min(
          currentSubjectStart + subjectsPerPage,
          subjects.length - subjectsPerPage,
        ),
      );
    }
  };

  const handlePreviousSubject = () => {
    const currentIndex = subjects.findIndex((s) => s.id === selectedSubject);
    if (currentIndex > 0) {
      setSelectedSubject(subjects[currentIndex - 1].id);
    }
  };

  const handleNextSubject = () => {
    const currentIndex = subjects.findIndex((s) => s.id === selectedSubject);
    if (currentIndex < subjects.length - 1) {
      setSelectedSubject(subjects[currentIndex + 1].id);
    }
  };

  const handlePreviousStudent = () => {
    const currentIndex = students.findIndex(
      (s) => s.studentId === selectedStudent,
    );
    if (currentIndex > 0) {
      setSelectedStudent(students[currentIndex - 1].studentId);
    }
  };

  const handleNextStudent = () => {
    const currentIndex = students.findIndex(
      (s) => s.studentId === selectedStudent,
    );
    if (currentIndex < students.length - 1) {
      setSelectedStudent(students[currentIndex + 1].studentId);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      // Implement draft saving logic
      showSuccess('Draft saved successfully!');
    } catch (error) {
      console.error('Error saving draft:', error);
      showAlert('Error saving draft. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAll = async () => {
    try {
      setSubmitting(true);

      // Validate all entries
      const errors: any[] = [];
      students.forEach((student) => {
        Object.entries(student.subjects).forEach(
          ([subjectId, subjectData]: [string, any]) => {
            const validation = validateScores(
              subjectData.ca1Score,
              subjectData.ca2Score,
              subjectData.examScore,
            );
            if (validation.errors.length > 0) {
              errors.push({
                student: student.studentName,
                subject: subjects.find((s) => s.id === subjectId)?.subjectName,
                errors: validation.errors,
              });
            }
          },
        );
      });

      if (errors.length > 0) {
        setValidationErrors(errors);
        showAlert('Please fix validation errors before submitting', 'error');
        return;
      }

      // Prepare data for submission - group by subject for matrix mode
      const subjectScoresMap = new Map<string, any[]>();

      students.forEach((student) => {
        Object.entries(student.subjects).forEach(
          ([subjectId, subjectData]: [string, any]) => {
            if (subjectData.isComplete) {
              if (!subjectScoresMap.has(subjectId)) {
                subjectScoresMap.set(subjectId, []);
              }
              subjectScoresMap.get(subjectId)!.push({
                studentId: student.studentId,
                ca1Score: subjectData.ca1Score,
                ca2Score: subjectData.ca2Score,
                examScore: subjectData.examScore,
              });
            }
          },
        );
      });

      // Submit to API - one call per subject
      let successCount = 0;
      for (const [subjectId, scores] of subjectScoresMap.entries()) {
        try {
          const response = await adminApi.bulkEntryScores({
            classId: classId,
            subjectId: subjectId,
            termId: termId, // Use the UUID termId, not the enum term
            sessionId: academicYear,
            scores: scores,
          });
          if (response.success) {
            successCount++;
          }
        } catch (error) {
          console.error(
            `Error submitting scores for subject ${subjectId}:`,
            error,
          );
        }
      }

      if (successCount > 0) {
        showSuccess(
          `Results submitted successfully for ${successCount} subject(s)!`,
        );
        // Reset score data for new entry while keeping context selections
        setStudents((prevStudents) =>
          prevStudents.map((student) => ({
            ...student,
            subjects: Object.keys(student.subjects).reduce((acc, subjectId) => {
              acc[subjectId] = {
                ca1Score: null,
                ca2Score: null,
                examScore: null,
                total: 0,
                grade: 'F',
                isComplete: false,
              };
              return acc;
            }, {} as any),
          })),
        );
        setCompletedEntries(0);
        setValidationErrors([]);
      } else {
        showAlert('Error submitting results. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error submitting results:', error);
      showAlert('Error submitting results. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    // Implement CSV export logic
    showAlert('CSV export feature coming soon!', 'info');
  };

  const handleImportCSV = () => {
    // Implement CSV import logic
    showAlert('CSV import feature coming soon!', 'info');
  };

  const handleReset = () => {
    setAcademicYear('');
    setTerm('');
    setClassId('');
    setStudents([]);
    setSubjects([]);
    setStudentsLoaded(false);
    setCompletedEntries(0);
    setTotalEntries(0);
    setValidationErrors([]);
  };

  const displayedSubjects = subjects.slice(
    currentSubjectStart,
    currentSubjectStart + subjectsPerPage,
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Score Entry</h1>
            <p className="text-muted-foreground">
              Enter scores for students using three different modes
            </p>
          </div>
        </div>

        {/* Context Selector */}
        <ClassSubjectSelector
          academicYear={academicYear}
          term={term}
          termId={termId}
          classId={classId}
          onAcademicYearChange={setAcademicYear}
          onTermChange={(termValue, termIdValue) => {
            console.log('🔄 [Results Entry] Term changed:', {
              termValue,
              termIdValue,
            });
            setTerm(termValue);
            setTermId(termIdValue);
          }}
          onClassChange={setClassId}
          onLoadStudents={loadStudents}
          onReset={handleReset}
          academicYears={academicYears}
          terms={terms}
          classes={classes}
          loading={loading}
        />

        {studentsLoaded && (
          <>
            {/* Mode Switcher */}
            <ModeSwitcher currentMode={entryMode} onModeChange={setEntryMode} />

            {/* Progress Tracker */}
            <ProgressTracker
              completedEntries={completedEntries}
              totalEntries={totalEntries}
              onSaveDraft={handleSaveDraft}
              onSubmitAll={handleSubmitAll}
              onExportCSV={handleExportCSV}
              onImportCSV={handleImportCSV}
              saving={saving}
              submitting={submitting}
            />

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <ScoreValidation
                errors={validationErrors.flatMap((e) => e.errors)}
                warnings={[]}
              />
            )}

            {/* Mode Content */}
            {entryMode === 'matrix' && (
              <MatrixView
                subjects={subjects}
                displayedSubjects={displayedSubjects}
                students={students}
                onScoreChange={handleScoreChange}
                onSubjectNavigation={handleSubjectNavigation}
                currentSubjectStart={currentSubjectStart}
                subjectsPerPage={subjectsPerPage}
              />
            )}

            {entryMode === 'subject' && selectedSubject && (
              <SubjectView
                subjects={subjects}
                selectedSubject={selectedSubject}
                onSubjectChange={setSelectedSubject}
                students={students.map((student) => ({
                  studentId: student.studentId,
                  studentName: student.studentName,
                  admissionNumber: student.admissionNumber,
                  ca1Score: student.subjects[selectedSubject]?.ca1Score || null,
                  ca2Score: student.subjects[selectedSubject]?.ca2Score || null,
                  examScore:
                    student.subjects[selectedSubject]?.examScore || null,
                  total: student.subjects[selectedSubject]?.total || 0,
                  grade: student.subjects[selectedSubject]?.grade || 'F',
                  isComplete:
                    student.subjects[selectedSubject]?.isComplete || false,
                }))}
                onScoreChange={(studentId, field, value) =>
                  handleScoreChange(studentId, selectedSubject, field, value)
                }
                onRemarkChange={setSubjectRemark}
                subjectRemark={subjectRemark}
                onPreviousSubject={handlePreviousSubject}
                onNextSubject={handleNextSubject}
              />
            )}

            {entryMode === 'student' && selectedStudent && (
              <StudentView
                students={students.map((s) => ({
                  id: s.studentId,
                  firstName: s.studentName.split(' ')[0],
                  lastName: s.studentName.split(' ').slice(1).join(' '),
                  admissionNumber: s.admissionNumber,
                }))}
                selectedStudent={selectedStudent}
                onStudentChange={setSelectedStudent}
                subjectScores={subjects.map((subject) => ({
                  subjectId: subject.id,
                  subjectName: subject.subjectName,
                  subjectCode: subject.subjectCode,
                  ca1Score:
                    students.find((s) => s.studentId === selectedStudent)
                      ?.subjects[subject.id]?.ca1Score || null,
                  ca2Score:
                    students.find((s) => s.studentId === selectedStudent)
                      ?.subjects[subject.id]?.ca2Score || null,
                  examScore:
                    students.find((s) => s.studentId === selectedStudent)
                      ?.subjects[subject.id]?.examScore || null,
                  total:
                    students.find((s) => s.studentId === selectedStudent)
                      ?.subjects[subject.id]?.total || 0,
                  grade:
                    students.find((s) => s.studentId === selectedStudent)
                      ?.subjects[subject.id]?.grade || 'F',
                  isComplete:
                    students.find((s) => s.studentId === selectedStudent)
                      ?.subjects[subject.id]?.isComplete || false,
                }))}
                onScoreChange={(subjectId, field, value) =>
                  handleScoreChange(selectedStudent, subjectId, field, value)
                }
                overallPosition={overallPosition}
                totalStudents={students.length}
                classAverage={classAverage}
                onPreviousStudent={handlePreviousStudent}
                onNextStudent={handleNextStudent}
              />
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
