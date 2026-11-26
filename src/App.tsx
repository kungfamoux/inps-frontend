import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth-context';
import { SessionProvider } from '@/contexts/session-context';
import { ErrorProvider } from '@/contexts/error-context';
import { AlertProvider } from '@/contexts/alert-context';
import { queryClient } from '@/lib/query-client';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useGlobalErrorHandler } from '@/hooks/useGlobalErrorHandler';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import { StaffRole } from '@/lib/types/common';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { TeacherLayout } from '@/components/layout/TeacherLayout';
import { BursaryLayout } from '@/components/layout/BursaryLayout';
import Dashboard from './pages/admin/Dashboard';
import StudentsList from './pages/admin/students/List';
import AddStudent from './pages/admin/students/Add';
import EditStudent from './pages/admin/students/Edit';
import StudentDetails from './pages/admin/students/Details';
import StaffList from './pages/admin/staff/List';
import AddStaff from './pages/admin/staff/Add';
import EditStaff from './pages/admin/staff/Edit';
import StaffDetails from './pages/admin/staff/Details';
import ParentsList from './pages/admin/parents/List';
import ParentDetails from './pages/admin/parents/Details';
import EditParent from './pages/admin/parents/Edit';
import ClassesList from './pages/admin/classes/List';
import AddClass from './pages/admin/classes/Add';
import EditClass from './pages/admin/classes/Edit';
import ClassDetails from './pages/admin/classes/Details';
import BulkTransfer from './pages/admin/classes/BulkTransfer';
import ClassSubjects from './pages/admin/classes/Subjects';
import SubjectsList from './pages/admin/subjects/List';
import EditSubject from './pages/admin/subjects/Edit';
import SubjectDetails from './pages/admin/subjects/Details';
import AssignmentsList from './pages/admin/assignments/List';
import AddAssignment from './pages/admin/assignments/Add';
import EditAssignment from './pages/admin/assignments/Edit';
import ClassTeachers from './pages/admin/assignments/ClassTeachers';
import SubjectTeachers from './pages/admin/assignments/SubjectTeachers';
import AcademicYearsList from './pages/admin/academic-years/List';
import AddSession from './pages/admin/academic-years/Add';
import SessionDetails from './pages/admin/academic-years/Details';
import AddTerm from './pages/admin/academic-years/AddTerm';
import Promotion from './pages/admin/promotion/Promotion';
import ResultsDashboard from './pages/admin/results/Dashboard';
import ResultsEntry from './pages/admin/results/Entry';
import ResultsVerification from './pages/admin/results/Verification';
import ReportCards from './pages/admin/results/ReportCards';
import AnnualReportCards from './pages/admin/results/AnnualReportCards';
import Analytics from './pages/admin/results/Analytics';
import AdminSettings from './pages/admin/Settings';
import CommunicationsList from './pages/admin/communications/List';
import CommunicationForm from './pages/admin/communications/Form';
import CommunicationDetails from './pages/admin/communications/Details';
import ParentDashboard from './pages/parent/Dashboard';
import ParentChildren from './pages/parent/Children';
import ChildProfile from './pages/parent/ChildProfile';
import ParentResults from './pages/parent/Results';
import ParentSettings from './pages/parent/Settings';
import ParentAnnouncements from './pages/parent/Announcements';
import {
  FeesOverview,
  ChildFees,
  PaymentFlow,
  PaymentHistory,
  ReceiptDownload,
} from './pages/parent/fees';
import {
  Dashboard as BursaryDashboard,
  BillsList,
  AddBill,
  EditBill,
  FeeCollections,
  GenerateInvoice,
  InvoiceList,
  Expenses,
  IncomeRecords,
  BookPrices,
  BursarySettings,
  PaymentReconciliation,
  PaymentReports,
  PendingPayments,
} from './pages/bursary';
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherStudents from './pages/teacher/Students';
import TeacherResults from './pages/teacher/Results';
import TeacherSubjects from './pages/teacher/Subjects';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherSchedule from './pages/teacher/Schedule';
import TeacherSettings from './pages/teacher/Settings';
import { HealthLayout } from '@/components/layout/HealthLayout';
import HealthDashboard from './pages/health/Dashboard';
import HealthDrugRequests from './pages/health/DrugRequests';
import HealthDrugRequestForm from './pages/health/DrugRequestForm';
import HealthDrugRequestDetails from './pages/health/DrugRequestDetails';
import HealthSickbayVisits from './pages/health/SickbayVisits';
import HealthSickbayVisitForm from './pages/health/SickbayVisitForm';
import HealthSickbayVisitDetails from './pages/health/SickbayVisitDetails';
import HealthDailyVisitorLog from './pages/health/DailyVisitorLog';
import HealthSettings from './pages/health/Settings';
import { ProprietorLayout } from '@/components/layout/ProprietorLayout';
import ProprietorDashboard from './pages/proprietor/Dashboard';
import ProprietorFinancialAnalytics from './pages/proprietor/FinancialAnalytics';
import ProprietorStaffOverview from './pages/proprietor/StaffOverview';
import ProprietorStaffStatistics from './pages/proprietor/StaffStatistics';
import ProprietorStudentsOverview from './pages/proprietor/StudentsOverview';
import ProprietorStudentsList from './pages/proprietor/StudentsList';
import ProprietorParentsList from './pages/proprietor/ParentsList';
import ProprietorAcademicPerformance from './pages/proprietor/AcademicPerformance';
import ProprietorSettings from './pages/proprietor/Settings';

function AppContent() {
  useGlobalErrorHandler();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SessionProvider>
          <AlertProvider>
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <Dashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <StudentsList />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students/add"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <AddStudent />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students/:admissionNumber"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <StudentDetails />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students/:admissionNumber/edit"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <EditStudent />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/staff"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <StaffList />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/staff/add"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <AddStaff />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/staff/:staffId"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <StaffDetails />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/staff/:staffId/edit"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <EditStaff />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/parents"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <ParentsList />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/parents/:id"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <ParentDetails />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/parents/:id/edit"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <EditParent />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classes"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <ClassesList />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classes/add"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <AddClass />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classes/:classId/edit"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <EditClass />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classes/:classId"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <ClassDetails />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classes/:classId/subjects"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <ClassSubjects />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classes/:classId/bulk-transfer"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <BulkTransfer />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/subjects"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <SubjectsList />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/subjects/:subjectId"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <SubjectDetails />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/subjects/:subjectId/edit"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <EditSubject />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assignments"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <Navigate to="/admin/assignments/subject-teachers" replace />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assignments/class-teachers"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <ClassTeachers />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assignments/subject-teachers"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <SubjectTeachers />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assignments/add"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <AddAssignment />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/assignments/:assignmentId/edit"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <EditAssignment />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/academic-years"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <AcademicYearsList />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/academic-years/add"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <AddSession />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/academic-years/:id"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <SessionDetails />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/academic-years/:id/edit"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <AddSession />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/academic-years/:id/add-term"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <AddTerm />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/promotion"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN]}>
                    <AdminLayout>
                      <Promotion />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/results"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER, StaffRole.TEACHER]}>
                    <AdminLayout>
                      <ResultsDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/results/entry"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER, StaffRole.TEACHER]}>
                    <AdminLayout>
                      <ResultsEntry />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/results/verification"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER, StaffRole.TEACHER]}>
                    <AdminLayout>
                      <ResultsVerification />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/results/report-cards"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <ReportCards />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/results/annual-report-cards"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <AnnualReportCards />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/results/analytics"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <Analytics />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <AdminSettings />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/communications"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <CommunicationsList />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/communications/add"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <CommunicationForm />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/communications/:id"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <CommunicationDetails />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/communications/:id/edit"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.ADMIN, StaffRole.HEAD_TEACHER]}>
                    <AdminLayout>
                      <CommunicationForm />
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Teacher Routes */}
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.TEACHER]}>
                    <TeacherLayout>
                      <TeacherDashboard />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/students"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.TEACHER]}>
                    <TeacherLayout>
                      <TeacherStudents />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/results"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.TEACHER]}>
                    <TeacherLayout>
                      <TeacherResults />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/subjects"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.TEACHER]}>
                    <TeacherLayout>
                      <TeacherSubjects />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/attendance"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.TEACHER]}>
                    <TeacherLayout>
                      <TeacherAttendance />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/schedule"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.TEACHER]}>
                    <TeacherLayout>
                      <TeacherSchedule />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/settings"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.TEACHER]}>
                    <TeacherLayout>
                      <TeacherSettings />
                    </TeacherLayout>
                  </ProtectedRoute>
                }
              />

              {/* Health Routes */}
              <Route
                path="/health/dashboard"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.NURSE]}>
                    <HealthLayout>
                      <HealthDashboard />
                    </HealthLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/health/drug-requests"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.NURSE]}>
                    <HealthLayout>
                      <HealthDrugRequests />
                    </HealthLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/health/drug-requests/new"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.NURSE]}>
                    <HealthLayout>
                      <HealthDrugRequestForm />
                    </HealthLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/health/drug-requests/:id"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.NURSE]}>
                    <HealthLayout>
                      <HealthDrugRequestDetails />
                    </HealthLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/health/sickbay-visits"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.NURSE]}>
                    <HealthLayout>
                      <HealthSickbayVisits />
                    </HealthLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/health/sickbay-visits/new"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.NURSE]}>
                    <HealthLayout>
                      <HealthSickbayVisitForm />
                    </HealthLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/health/sickbay-visits/:id"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.NURSE]}>
                    <HealthLayout>
                      <HealthSickbayVisitDetails />
                    </HealthLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/health/daily-log"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.NURSE]}>
                    <HealthLayout>
                      <HealthDailyVisitorLog />
                    </HealthLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/health/settings"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.NURSE]}>
                    <HealthLayout>
                      <HealthSettings />
                    </HealthLayout>
                  </ProtectedRoute>
                }
              />

              {/* Proprietor Routes */}
              <Route
                path="/proprietor/dashboard"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.PROPRIETOR]}>
                    <ProprietorLayout>
                      <ProprietorDashboard />
                    </ProprietorLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/proprietor/financial-analytics"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.PROPRIETOR]}>
                    <ProprietorLayout>
                      <ProprietorFinancialAnalytics />
                    </ProprietorLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/proprietor/staff"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.PROPRIETOR]}>
                    <ProprietorLayout>
                      <ProprietorStaffOverview />
                    </ProprietorLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/proprietor/staff/statistics"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.PROPRIETOR]}>
                    <ProprietorLayout>
                      <ProprietorStaffStatistics />
                    </ProprietorLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/proprietor/students/enrollment"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.PROPRIETOR]}>
                    <ProprietorLayout>
                      <ProprietorStudentsOverview />
                    </ProprietorLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/proprietor/students/list"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.PROPRIETOR]}>
                    <ProprietorLayout>
                      <ProprietorStudentsList />
                    </ProprietorLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/proprietor/parents/list"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.PROPRIETOR]}>
                    <ProprietorLayout>
                      <ProprietorParentsList />
                    </ProprietorLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/proprietor/academic-performance"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.PROPRIETOR]}>
                    <ProprietorLayout>
                      <ProprietorAcademicPerformance />
                    </ProprietorLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/proprietor/settings"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.PROPRIETOR]}>
                    <ProprietorLayout>
                      <ProprietorSettings />
                    </ProprietorLayout>
                  </ProtectedRoute>
                }
              />

              {/* Parent Routes */}
              <Route
                path="/parent/dashboard"
                element={
                  <ProtectedRoute userType="parent">
                    <ParentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/children"
                element={
                  <ProtectedRoute userType="parent">
                    <ParentChildren />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/children/:studentId"
                element={
                  <ProtectedRoute userType="parent">
                    <ChildProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/results"
                element={
                  <ProtectedRoute userType="parent">
                    <ParentResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/settings"
                element={
                  <ProtectedRoute userType="parent">
                    <ParentSettings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/announcements"
                element={
                  <ProtectedRoute userType="parent">
                    <ParentAnnouncements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/fees"
                element={
                  <ProtectedRoute userType="parent">
                    <FeesOverview />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/fees/:studentId"
                element={
                  <ProtectedRoute userType="parent">
                    <ChildFees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/fees/:studentId/pay"
                element={
                  <ProtectedRoute userType="parent">
                    <PaymentFlow />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/fees/:studentId/history"
                element={
                  <ProtectedRoute userType="parent">
                    <PaymentHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/parent/fees/:studentId/receipt/:paymentId"
                element={
                  <ProtectedRoute userType="parent">
                    <ReceiptDownload />
                  </ProtectedRoute>
                }
              />

              {/* Bursary Routes */}
              <Route
                path="/bursary/dashboard"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.BURSARY]}>
                    <BursaryLayout>
                      <BursaryDashboard />
                    </BursaryLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary/bills"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.BURSARY]}>
                    <BursaryLayout>
                      <BillsList />
                    </BursaryLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary/bills/add"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.BURSARY]}>
                    <BursaryLayout>
                      <AddBill />
                    </BursaryLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary/bills/edit/:id"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.BURSARY]}>
                    <BursaryLayout>
                      <EditBill />
                    </BursaryLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary/fee-collections"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.BURSARY]}>
                    <BursaryLayout>
                      <FeeCollections />
                    </BursaryLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary/invoices"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.BURSARY]}>
                    <BursaryLayout>
                      <InvoiceList />
                    </BursaryLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary/invoices/generate"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.BURSARY]}>
                    <BursaryLayout>
                      <GenerateInvoice />
                    </BursaryLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary/pending-payments"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.BURSARY]}>
                    <BursaryLayout>
                      <PendingPayments />
                    </BursaryLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary/expenses"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.BURSARY]}>
                    <BursaryLayout>
                      <Expenses />
                    </BursaryLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary/income"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.BURSARY]}>
                    <BursaryLayout>
                      <IncomeRecords />
                    </BursaryLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary/payments/reconciliation"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.BURSARY]}>
                    <BursaryLayout>
                      <PaymentReconciliation />
                    </BursaryLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary/payments/reports"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.BURSARY]}>
                    <BursaryLayout>
                      <PaymentReports />
                    </BursaryLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary/book-prices"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.BURSARY]}>
                    <BursaryLayout>
                      <BookPrices />
                    </BursaryLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bursary/settings"
                element={
                  <ProtectedRoute userType="staff" allowedRoles={[StaffRole.BURSARY]}>
                    <BursaryLayout>
                      <BursarySettings />
                    </BursaryLayout>
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AlertProvider>
        </SessionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <VercelAnalytics />
          <SpeedInsights />
          <ErrorProvider>
            <AppContent />
          </ErrorProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
