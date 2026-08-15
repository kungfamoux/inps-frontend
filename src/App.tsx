import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth-context';
import { SessionProvider } from '@/contexts/session-context';
import { queryClient } from '@/lib/query-client';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
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
import ResultsDashboard from './pages/admin/results/Dashboard';
import ResultsEntry from './pages/admin/results/Entry';
import ResultsVerification from './pages/admin/results/Verification';
import ReportCards from './pages/admin/results/ReportCards';
import Analytics from './pages/admin/results/Analytics';
import ParentDashboard from './pages/parent/Dashboard';
import ParentChildren from './pages/parent/Children';
import ChildProfile from './pages/parent/ChildProfile';
import ParentResults from './pages/parent/Results';
import ParentSettings from './pages/parent/Settings';
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
} from './pages/bursary';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <SessionProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/students" element={<StudentsList />} />
                <Route path="/admin/students/add" element={<AddStudent />} />
                <Route
                  path="/admin/students/:admissionNumber"
                  element={<StudentDetails />}
                />
                <Route
                  path="/admin/students/:admissionNumber/edit"
                  element={<EditStudent />}
                />
                <Route path="/admin/staff" element={<StaffList />} />
                <Route path="/admin/staff/add" element={<AddStaff />} />
                <Route
                  path="/admin/staff/:staffId"
                  element={<StaffDetails />}
                />
                <Route
                  path="/admin/staff/:staffId/edit"
                  element={<EditStaff />}
                />
                <Route path="/admin/parents" element={<ParentsList />} />
                <Route path="/admin/parents/:id" element={<ParentDetails />} />
                <Route
                  path="/admin/parents/:id/edit"
                  element={<EditParent />}
                />
                <Route path="/admin/classes" element={<ClassesList />} />
                <Route path="/admin/classes/add" element={<AddClass />} />
                <Route
                  path="/admin/classes/:classId/edit"
                  element={<EditClass />}
                />
                <Route
                  path="/admin/classes/:classId"
                  element={<ClassDetails />}
                />
                <Route
                  path="/admin/classes/:classId/subjects"
                  element={<ClassSubjects />}
                />
                <Route
                  path="/admin/classes/:classId/bulk-transfer"
                  element={<BulkTransfer />}
                />
                <Route path="/admin/subjects" element={<SubjectsList />} />
                <Route
                  path="/admin/subjects/:subjectId"
                  element={<SubjectDetails />}
                />
                <Route
                  path="/admin/subjects/:subjectId/edit"
                  element={<EditSubject />}
                />
                <Route
                  path="/admin/assignments"
                  element={
                    <Navigate
                      to="/admin/assignments/subject-teachers"
                      replace
                    />
                  }
                />
                <Route
                  path="/admin/assignments/class-teachers"
                  element={<ClassTeachers />}
                />
                <Route
                  path="/admin/assignments/subject-teachers"
                  element={<SubjectTeachers />}
                />
                <Route
                  path="/admin/assignments/add"
                  element={<AddAssignment />}
                />
                <Route
                  path="/admin/assignments/:assignmentId/edit"
                  element={<EditAssignment />}
                />
                <Route
                  path="/admin/academic-years"
                  element={<AcademicYearsList />}
                />
                <Route
                  path="/admin/academic-years/add"
                  element={<AddSession />}
                />
                <Route
                  path="/admin/academic-years/:id"
                  element={<SessionDetails />}
                />
                <Route
                  path="/admin/academic-years/:id/edit"
                  element={<AddSession />}
                />
                <Route
                  path="/admin/academic-years/:id/add-term"
                  element={<AddTerm />}
                />
                <Route path="/admin/results" element={<ResultsDashboard />} />
                <Route path="/admin/results/entry" element={<ResultsEntry />} />
                <Route
                  path="/admin/results/verification"
                  element={<ResultsVerification />}
                />
                <Route
                  path="/admin/results/report-cards"
                  element={<ReportCards />}
                />
                <Route
                  path="/admin/results/analytics"
                  element={<Analytics />}
                />

                {/* Parent Routes */}
                <Route path="/parent/dashboard" element={<ParentDashboard />} />
                <Route path="/parent/children" element={<ParentChildren />} />
                <Route
                  path="/parent/children/:studentId"
                  element={<ChildProfile />}
                />
                <Route path="/parent/results" element={<ParentResults />} />
                <Route path="/parent/settings" element={<ParentSettings />} />
                <Route path="/parent/fees" element={<FeesOverview />} />
                <Route path="/parent/fees/:studentId" element={<ChildFees />} />
                <Route
                  path="/parent/fees/:studentId/pay"
                  element={<PaymentFlow />}
                />
                <Route
                  path="/parent/fees/:studentId/history"
                  element={<PaymentHistory />}
                />
                <Route
                  path="/parent/fees/:studentId/receipt/:paymentId"
                  element={<ReceiptDownload />}
                />

                {/* Bursary Routes */}
                <Route
                  path="/bursary/dashboard"
                  element={<BursaryDashboard />}
                />
                <Route path="/bursary/bills" element={<BillsList />} />
                <Route path="/bursary/bills/add" element={<AddBill />} />
                <Route path="/bursary/bills/edit/:id" element={<EditBill />} />
                <Route
                  path="/bursary/fee-collections"
                  element={<FeeCollections />}
                />
                <Route path="/bursary/invoices" element={<InvoiceList />} />
                <Route
                  path="/bursary/invoices/generate"
                  element={<GenerateInvoice />}
                />
                <Route path="/bursary/expenses" element={<Expenses />} />
                <Route path="/bursary/income" element={<IncomeRecords />} />
                <Route
                  path="/bursary/payments/reconciliation"
                  element={<PaymentReconciliation />}
                />
                <Route
                  path="/bursary/payments/reports"
                  element={<PaymentReports />}
                />
                <Route path="/bursary/book-prices" element={<BookPrices />} />
                <Route path="/bursary/settings" element={<BursarySettings />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </SessionProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
