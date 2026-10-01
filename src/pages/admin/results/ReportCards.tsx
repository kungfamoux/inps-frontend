import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/shared/LoadingButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, FileText, Users, Eye, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api/admin';
import { useSession } from '@/contexts/session-context';
import { useAlert } from '@/contexts/alert-context';
import { ResultsTable } from '@/components/results/ResultsTable';
import { ResultsSummary } from '@/components/results/ResultsSummary';
import { ReportCardLayout } from '@/components/results/ReportCardLayout';
import { transformAdminToUnified } from '@/lib/types/results';
import { downloadReportCardPDF } from '@/lib/utils/reactPdfReportCard';

export default function ReportCards() {
  const navigate = useNavigate();
  const { currentSession, currentTerm } = useSession();
  const { showAlert, showSuccess } = useAlert();

  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<'preview' | 'generate' | null>(null);
  const generating = activeAction !== null;
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
    if (generating) return;
    if (!selectedSession || !selectedTerm || !selectedStudent) {
      showAlert('Please select session, term, and student', 'error');
      return;
    }

    setActiveAction('preview');
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
      setActiveAction(null);
    }
  };

  const handleGenerate = async () => {
    if (generating) return;
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

    setActiveAction('generate');
    try {
      if (mode === 'single') {
        // Generate single report card using html2pdf.js for WYSIWYG output
        // Fetch preview data if not already loaded
        let reportCardData = previewData;

        if (!reportCardData) {
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
            reportCardData = data.data;
          } else {
            const errorData = await response
              .json()
              .catch(() => ({ message: 'Failed to load preview' }));
            throw new Error(errorData.message || 'Failed to load preview');
          }
        }

        setPreviewData(reportCardData);
        setShowPreview(true);
        showSuccess(
          'Report card preview is ready. Use Download PDF to save it.',
        );
      } else {
        // Generate batch report cards (ZIP) - keep backend approach for batch
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
      setActiveAction(null);
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
              <div className="flex flex-col gap-2 sm:flex-row">
                <LoadingButton
                  onClick={handlePreview}
                  loading={activeAction === 'preview'}
                  loadingText="Loading preview..."
                  disabled={
                    generating ||
                    !selectedSession ||
                    !selectedTerm ||
                    !selectedStudent
                  }
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </LoadingButton>
                <LoadingButton
                  onClick={handleGenerate}
                  loading={activeAction === 'generate'}
                  loadingText="Generating..."
                  disabled={
                    generating ||
                    !selectedSession ||
                    !selectedTerm ||
                    !selectedStudent
                  }
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </LoadingButton>
              </div>
            ) : (
              <LoadingButton
                onClick={handleGenerate}
                loading={activeAction === 'generate'}
                loadingText="Generating..."
                disabled={
                  generating ||
                  !selectedSession ||
                  !selectedTerm ||
                  !selectedClass
                }
                className="w-full md:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                Generate Report Cards
              </LoadingButton>
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

                  {/* PDF-style Preview using unified ReportCardLayout */}
                  <div className="overflow-x-auto">
                    <div className="w-[794px]">
                      <ReportCardLayout
                        data={transformAdminToUnified(previewData)}
                        showAsPreview={true}
                        showControls={true}
                        pdfFilename={`ReportCard_${selectedStudent}.pdf`}
                        onGeneratePDF={async (filename) => {
                          try {
                            await downloadReportCardPDF(
                              transformAdminToUnified(previewData),
                              filename,
                            );
                            showSuccess('Report card generated successfully');
                          } catch (error) {
                            showAlert(
                              'Failed to generate PDF. Please try again.',
                              'error',
                            );
                          }
                        }}
                      />
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