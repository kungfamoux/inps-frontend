import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText, Users, Loader2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import { useSession } from '@/contexts/session-context';
import { useAlert } from '@/contexts/alert-context';

export default function ReportCards() {
  const navigate = useNavigate();
  const { currentSession, currentTerm } = useSession();
  const { showAlert, showSuccess } = useAlert();

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSessionName, setSelectedSessionName] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (currentSession) {
      setSelectedSession(currentSession.id);
      setSelectedSessionName(currentSession.session || '');
    }
  }, [currentSession]);

  useEffect(() => {
    if (currentTerm) {
      setSelectedTerm(currentTerm.id);
    }
  }, [currentTerm]);

  useEffect(() => {
    if (selectedSession) {
      loadTerms();
    }
  }, [selectedSession]);

  useEffect(() => {
    if (selectedSession && selectedTerm) {
      loadClasses();
    }
  }, [selectedSession, selectedTerm]);

  useEffect(() => {
    if (selectedClass && selectedSession && selectedTerm) {
      loadStudents();
    }
  }, [selectedClass, selectedSession, selectedTerm]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllSessions();
      if (response.success) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTerms = async () => {
    try {
      // Terms are included in the sessions response
      const response = await adminApi.getAllSessions();
      if (response.success) {
        // Extract terms from the sessions
        const allTerms = response.data.flatMap(
          (session) => session.terms || [],
        );
        setTerms(allTerms);
      }
    } catch (error) {
      console.error('Error loading terms:', error);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await adminApi.getAllClasses();
      if (response.success) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await adminApi.getStudentsByClass(selectedClass, {
        academicYear: selectedSessionName,
        term: terms.find((t) => t.id === selectedTerm)?.term,
      });
      if (response.success) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handlePreview = async () => {
    if (!selectedSession || !selectedTerm || !selectedStudent) {
      showAlert('Please select session, term, and student', 'error');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/results/report-card/${selectedStudent}/preview?termId=${selectedTerm}&sessionId=${selectedSession}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data.data);
        setShowPreview(true);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Failed to load preview' }));
        throw new Error(errorData.message || 'Failed to load preview');
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      showAlert(`Failed to load preview data: ${error.message}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedSession || !selectedTerm) {
      showAlert('Please select session and term', 'error');
      return;
    }

    if (mode === 'single' && !selectedStudent) {
      showAlert('Please select a student', 'error');
      return;
    }

    if (mode === 'batch' && !selectedClass) {
      showAlert('Please select a class', 'error');
      return;
    }

    setGenerating(true);
    try {
      if (mode === 'single') {
        // Generate single report card
        const response = await fetch(
          `http://localhost:3000/api/admin/results/report-card/${selectedStudent}?termId=${selectedTerm}&sessionId=${selectedSession}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
          },
        );

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ReportCard_${selectedStudent}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          showSuccess('Report card generated successfully');
        } else {
          throw new Error('Failed to generate report card');
        }
      } else {
        // Generate batch report cards (ZIP)
        const response = await fetch(
          'http://localhost:3000/api/admin/results/report-cards/batch',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
            },
            body: JSON.stringify({
              classId: selectedClass,
              termId: selectedTerm,
              sessionId: selectedSession,
              format: 'zip',
            }),
          },
        );

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ReportCards_Class_${selectedClass}.zip`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          showSuccess('Report cards generated successfully');
        } else {
          throw new Error('Failed to generate batch report cards');
        }
      }
    } catch (error) {
      console.error('Error generating report card:', error);
      showAlert('Failed to generate report card. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Report Cards</h1>
            <p className="text-gray-600 mt-1">
              Generate and download student report cards
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/results')}>
            ← Back to Results
          </Button>
        </div>

        {/* Selection Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={mode === 'single' ? 'default' : 'outline'}
                onClick={() => setMode('single')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Single Student
              </Button>
              <Button
                variant={mode === 'batch' ? 'default' : 'outline'}
                onClick={() => setMode('batch')}
              >
                <Users className="mr-2 h-4 w-4" />
                Entire Class
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Selection Form */}
        <Card>
          <CardHeader>
            <CardTitle>Select Report Card Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Academic Session</label>
                <Select
                  value={selectedSession}
                  onValueChange={(value) => {
                    setSelectedSession(value);
                    const session = sessions.find((s) => s.id === value);
                    setSelectedSessionName(session?.session || '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.session}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Term</label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((term) => (
                      <SelectItem key={term.id} value={term.id}>
                        {term.term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {mode === 'single' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Class</label>
                    <Select
                      value={selectedClass}
                      onValueChange={setSelectedClass}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Student</label>
                    <Select
                      value={selectedStudent}
                      onValueChange={setSelectedStudent}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((enrollment) => (
                          <SelectItem
                            key={enrollment.student.id}
                            value={enrollment.student.id}
                          >
                            {enrollment.student.firstName}{' '}
                            {enrollment.student.lastName} (
                            {enrollment.student.admissionNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Class</label>
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {mode === 'single' ? (
              <div className="flex gap-2">
                <Button
                  onClick={handlePreview}
                  disabled={
                    generating ||
                    !selectedSession ||
                    !selectedTerm ||
                    !selectedStudent
                  }
                  variant="outline"
                  className="flex-1"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={
                    generating ||
                    !selectedSession ||
                    !selectedTerm ||
                    !selectedStudent
                  }
                  className="flex-1"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={
                  generating ||
                  !selectedSession ||
                  !selectedTerm ||
                  !selectedClass
                }
                className="w-full md:w-auto"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate Report Cards
                  </>
                )}
              </Button>
            )}

            {/* PDF-style Preview Modal */}
            {showPreview && previewData && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
                  <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
                    <h3 className="text-xl font-bold">Report Card Preview</h3>
                    <Button
                      onClick={() => setShowPreview(false)}
                      variant="outline"
                    >
                      Close
                    </Button>
                  </div>

                  {/* PDF-style Preview */}
                  <div
                    className="p-8 bg-white"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                  >
                    {/* School Header */}
                    <div className="text-center mb-6">
                      <img
                        src="https://res.cloudinary.com/dligmvsem/image/upload/v1786435836/logoo_ddwy4c.png"
                        alt="School Logo"
                        className="h-20 mx-auto mb-4"
                      />
                      <h1 className="text-2xl font-bold text-blue-900">
                        International Nursery and Primary School
                      </h1>
                      <p className="text-sm text-blue-700 font-semibold">
                        Trans-Ekulu Enugu
                      </p>
                    </div>

                    {/* Report Card Title */}
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900 bg-blue-100 py-2 px-4 rounded-lg inline-block">
                        STUDENT REPORT CARD
                      </h2>
                    </div>

                    {/* Student Information */}
                    <div className="mb-6 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
                      <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase">
                        Student Information
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p>
                          <span className="font-semibold text-gray-700">
                            Name:
                          </span>{' '}
                          {previewData.student?.firstName}{' '}
                          {previewData.student?.middleName || ''}{' '}
                          {previewData.student?.lastName}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-700">
                            Admission Number:
                          </span>{' '}
                          {previewData.student?.admissionNumber}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-700">
                            Class:
                          </span>{' '}
                          {previewData.student?.className || 'N/A'}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-700">
                            Academic Session:
                          </span>{' '}
                          {previewData.session}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-700">
                            Term:
                          </span>{' '}
                          {previewData.term}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-700">
                            Class Teacher:
                          </span>{' '}
                          {previewData.student?.classTeacher
                            ? `${previewData.student.classTeacher.firstName} ${previewData.student.classTeacher.lastName}`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Academic Performance Table */}
                    {previewData.results && previewData.results.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase">
                          Academic Performance
                        </h3>
                        <div className="border-2 border-blue-300 rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-blue-600 text-white">
                              <tr>
                                <th className="text-left p-2 border-b border-blue-400 font-semibold">
                                  Subject
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  CA1
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  CA2
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  Exam
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  Total
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  Grade
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  Position
                                </th>
                                <th className="text-left p-2 border-b border-blue-400 font-semibold">
                                  Remark
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {previewData.results.map(
                                (result: any, index: number) => (
                                  <tr
                                    key={index}
                                    className={
                                      index % 2 === 0
                                        ? 'bg-white'
                                        : 'bg-blue-50'
                                    }
                                  >
                                    <td className="p-2 border-b border-blue-200">
                                      {result.subject?.subjectName || 'N/A'}
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200">
                                      {result.ca1Score?.toFixed(0) || '-'}
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200">
                                      {result.ca2Score?.toFixed(0) || '-'}
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200">
                                      {result.examScore?.toFixed(0) || '-'}
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200 font-semibold text-blue-900">
                                      {result.total?.toFixed(0) || '-'}
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200 font-semibold text-blue-900">
                                      {result.grade || '-'}
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200">
                                      {result.position?.toString() || '-'}
                                    </td>
                                    <td className="text-left p-2 border-b border-blue-200 text-xs">
                                      {result.subjectTeacherRemark || '-'}
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Summary Statistics */}
                    {previewData.summary && (
                      <div className="mb-6 p-4 border-2 border-blue-300 rounded-lg bg-green-50">
                        <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase">
                          Summary Statistics
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p>
                            <span className="font-semibold text-gray-700">
                              Total Subjects:
                            </span>{' '}
                            {previewData.summary.totalSubjects}
                          </p>
                          <p>
                            <span className="font-semibold text-gray-700">
                              Average Score:
                            </span>{' '}
                            {previewData.summary.averageScore?.toFixed(2)}
                          </p>
                          <p>
                            <span className="font-semibold text-gray-700">
                              Subjects Passed:
                            </span>{' '}
                            {previewData.summary.passedSubjects}/
                            {previewData.summary.totalSubjects}
                          </p>
                          <p>
                            <span className="font-semibold text-gray-700">
                              Class Size:
                            </span>{' '}
                            {previewData.summary.classEnrollmentCount} students
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Remarks */}
                    {previewData.termRemarks && (
                      <div className="mb-6 p-4 border-2 border-blue-300 rounded-lg bg-yellow-50">
                        <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase">
                          Remarks
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-semibold text-gray-700">
                              Class Teacher:
                            </span>{' '}
                            {previewData.termRemarks.classTeacherRemark ||
                              'No remark'}
                          </p>
                          <p>
                            <span className="font-semibold text-gray-700">
                              Head Teacher:
                            </span>{' '}
                            {previewData.termRemarks.headTeacherRemark ||
                              'No remark'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Grading Scale */}
                    <div className="mb-6 p-4 border-2 border-blue-300 rounded-lg bg-purple-50">
                      <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase">
                        Grading Scale
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <p>
                          <span className="font-bold text-green-700">A:</span>{' '}
                          70-100 - Excellent
                        </p>
                        <p>
                          <span className="font-bold text-blue-700">C:</span>{' '}
                          55-59 - Good
                        </p>
                        <p>
                          <span className="font-bold text-yellow-700">D:</span>{' '}
                          50-54 - Fair
                        </p>
                        <p>
                          <span className="font-bold text-red-700">F:</span>{' '}
                          0-44 - Fail
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t-2 border-blue-300">
                      <p className="text-center text-xs text-gray-600 mb-4">
                        This is an official document from International Nursery
                        and Primary School
                      </p>
                      <p className="text-center text-xs text-gray-600 mb-6">
                        Generated on: {new Date().toLocaleDateString()}
                      </p>

                      {/* Signature placeholders */}
                      <div className="flex justify-between mt-8">
                        <div className="text-center">
                          <div className="border-b-2 border-blue-400 w-40 mb-2"></div>
                          <p className="text-sm font-semibold text-blue-900">
                            Class Teacher
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="border-b-2 border-blue-400 w-40 mb-2"></div>
                          <p className="text-sm font-semibold text-blue-900">
                            Head Teacher
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Report cards are generated for verified results only.</p>
              <p>• Single mode generates one PDF for the selected student.</p>
              <p>
                • Batch mode generates a ZIP file containing all student report
                cards for the selected class.
              </p>
              <p>
                • Ensure students have verified results before generating report
                cards.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
