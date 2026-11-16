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

export default function AnnualReportCards() {
  const navigate = useNavigate();
  const { currentSession } = useSession();
  const { showAlert, showSuccess } = useAlert();

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedSessionName, setSelectedSessionName] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [sessions, setSessions] = useState([]);
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
    if (selectedSession) {
      loadClasses();
    }
  }, [selectedSession]);

  useEffect(() => {
    if (selectedClass && selectedSession) {
      loadStudents();
    }
  }, [selectedClass, selectedSession]);

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
      });
      if (response.success) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handlePreview = async () => {
    if (!selectedSession || !selectedStudent) {
      showAlert('Please select session and student', 'error');
      return;
    }

    setGenerating(true);
    try {
      const response = await adminApi.getAnnualReportCardPreview(
        selectedStudent,
        selectedSession,
      );
      if (response.success) {
        setPreviewData(response.data);
        setShowPreview(true);
      } else {
        throw new Error(response.message || 'Failed to load preview');
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      showAlert(`Failed to load preview data: ${error.message}`, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedSession) {
      showAlert('Please select session', 'error');
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
        // Generate single annual report card PDF
        const blob = await adminApi.getAnnualReportCardPDF(
          selectedStudent,
          selectedSession,
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AnnualReportCard_${selectedStudent}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showSuccess('Annual report card generated successfully');
      } else {
        // Generate batch annual report cards (ZIP)
        const blob = await adminApi.generateBatchAnnualReportCards(
          selectedClass,
          selectedSession,
          'zip',
        );
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AnnualReportCards_Class_${selectedClass}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showSuccess('Annual report cards generated successfully');
      }
    } catch (error) {
      console.error('Error generating report card:', error);
      showAlert('Failed to generate report card. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Annual Report Cards
            </h1>
            <p className="text-gray-600 mt-1">
              Generate and download annual student report cards (cumulative across all terms)
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
            <CardTitle>Select Annual Report Card Parameters</CardTitle>
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
                    <h3 className="text-xl font-bold">Annual Report Card Preview</h3>
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
                        ANNUAL REPORT CARD
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
                          {previewData.sessionName || previewData.sessionId}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-700">
                            Age:
                          </span>{' '}
                          {previewData.student?.age || 'N/A'}
                        </p>
                        {previewData.classStats && (
                          <>
                            <p>
                              <span className="font-semibold text-gray-700">
                                Class Age Average:
                              </span>{' '}
                              {previewData.classStats.ageAverage}
                            </p>
                            <p>
                              <span className="font-semibold text-gray-700">
                                No. in Class:
                              </span>{' '}
                              {previewData.classStats.classSize}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Academic Performance Table */}
                    {previewData.results && previewData.results.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase">
                          Academic Performance (Annual)
                        </h3>
                        <div className="border-2 border-blue-300 rounded-lg overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead className="bg-blue-600 text-white">
                              <tr>
                                <th className="text-left p-2 border-b border-blue-400 font-semibold">
                                  Subject
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  Test1
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  Test2
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  Exam
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  Total
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  2nd
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  1st
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  Cumul
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  Avg
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  Grade
                                </th>
                                <th className="text-center p-2 border-b border-blue-400 font-semibold">
                                  Pos
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
                                      {result.subjectName || 'N/A'}
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200">
                                      -
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200">
                                      -
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200">
                                      -
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200 font-semibold text-blue-900">
                                      {result.thirdTerm?.toFixed(0) || '-'}
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200">
                                      {result.secondTerm?.toFixed(0) || '-'}
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200">
                                      {result.firstTerm?.toFixed(0) || '-'}
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200 font-bold text-blue-900">
                                      {result.cumulative?.toFixed(0) || '-'}
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200 font-semibold">
                                      {result.weightedAverage?.toFixed(1) || '-'}
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200 font-bold text-blue-900">
                                      {result.annualGrade || '-'}
                                    </td>
                                    <td className="text-center p-2 border-b border-blue-200">
                                      {result.annualPosition?.toString() || '-'}
                                    </td>
                                    <td className="text-left p-2 border-b border-blue-200 text-xs">
                                      {result.remark || '-'}
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
                              Total Cumulative:
                            </span>{' '}
                            {previewData.summary.totalCumulative?.toFixed(0)}
                          </p>
                          <p>
                            <span className="font-semibold text-gray-700">
                              Average Cumulative:
                            </span>{' '}
                            {previewData.summary.averageCumulative?.toFixed(2)}
                          </p>
                          <p>
                            <span className="font-semibold text-gray-700">
                              Overall Percentage:
                            </span>{' '}
                            {previewData.summary.overallPercentage?.toFixed(2)}%
                          </p>
                          <p>
                            <span className="font-semibold text-gray-700">
                              Subjects Passed:
                            </span>{' '}
                            {previewData.summary.passedSubjects}/
                            {previewData.summary.totalSubjects}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Remarks */}
                    {previewData.remarks && (
                      <div className="mb-6 p-4 border-2 border-blue-300 rounded-lg bg-yellow-50">
                        <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase">
                          Remarks
                        </h3>
                        <div className="space-y-2 text-sm">
                          {previewData.remarks.classTeacherRemarks &&
                            previewData.remarks.classTeacherRemarks.length > 0 && (
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">
                                  Class Teacher Remarks:
                                </p>
                                {previewData.remarks.classTeacherRemarks.map(
                                  (remark: any, idx: number) => (
                                    <p key={idx} className="ml-2">
                                      {remark.term}: {remark.remark}
                                    </p>
                                  ),
                                )}
                              </div>
                            )}
                          {previewData.remarks.headTeacherRemarks &&
                            previewData.remarks.headTeacherRemarks.length > 0 && (
                              <div className="mt-2">
                                <p className="font-semibold text-gray-700 mb-1">
                                  Head Teacher Remarks:
                                </p>
                                {previewData.remarks.headTeacherRemarks.map(
                                  (remark: any, idx: number) => (
                                    <p key={idx} className="ml-2">
                                      {remark.term}: {remark.remark}
                                    </p>
                                  ),
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    )}

                    {/* Annual Grading Scale */}
                    <div className="mb-6 p-4 border-2 border-blue-300 rounded-lg bg-purple-50">
                      <h3 className="text-sm font-bold text-blue-900 mb-3 uppercase">
                        Annual Grading Scale
                      </h3>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <p>
                          <span className="font-bold text-green-700">A:</span>{' '}
                          270-300 - Distinction (90%+)
                        </p>
                        <p>
                          <span className="font-bold text-blue-700">C:</span>{' '}
                          210-269 - Credit (70-89%)
                        </p>
                        <p>
                          <span className="font-bold text-yellow-700">P:</span>{' '}
                          165-209 - Pass (55-69%)
                        </p>
                        <p>
                          <span className="font-bold text-red-700">F:</span>{' '}
                          0-164 - Fail (Below 55%)
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t-2 border-blue-300">
                      <p className="text-center text-xs text-gray-600 mb-4">
                        This is an official annual report card from International
                        Nursery and Primary School
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
              <p>• Annual report cards aggregate results across all three terms.</p>
              <p>• Single mode generates one PDF for the selected student.</p>
              <p>
                • Batch mode generates a ZIP file containing all student annual
                report cards for the selected class.
              </p>
              <p>
                • Ensure students have verified results for all terms before
                generating annual report cards.
              </p>
              <p>
                • Annual grading scale: A=270+, C=210-269, P=165-209, F=&lt;165
                (out of 300 cumulative points).
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    
  );
}
