import { apiClient } from "./client";
import { Student, CreateStudentRequest, UpdateStudentRequest, Parent, CreateParentRequest, UpdateParentRequest } from "@/lib/types/student";
import { UpdateStaffRequest } from "@/lib/types/staff";
import { ApiResponse, PaginatedResponse, CreateClassRequest, UpdateClassRequest, CreateSectionRequest, UpdateSectionRequest, SubjectAssignment, CreateAssignmentRequest, BulkCreateAssignmentRequest, UpdateAssignmentRequest, AssignmentFilters, Term, Enrollment, CreateEnrollmentRequest, TransferRequest, EnrollmentFilters, EnrollmentStatus, AcademicSession, AcademicTerm, CreateSessionRequest, CreateTermRequest, UpdateTermStatusRequest, Subject, CreateSubjectRequest, UpdateSubjectRequest, SchoolLevel, DashboardStats } from "@/lib/types/common";

export const adminApi = {
  // Students
  async getAllStudents(params?: { status?: string; page?: number; limit?: number; academicYear?: string; term?: string }): Promise<PaginatedResponse<Student>> {
    return apiClient.get<PaginatedResponse<Student>>("/api/admin/students", params);
  },

  async getStudentByAdmissionNumber(admissionNumber: string): Promise<ApiResponse<Student>> {
    return apiClient.get<ApiResponse<Student>>(`/api/admin/students/${admissionNumber}`);
  },

  async createStudent(data: FormData): Promise<ApiResponse<Student>> {
    return apiClient.upload<ApiResponse<Student>>("/api/admin/students", data);
  },

  async updateStudent(admissionNumber: string, data: FormData): Promise<ApiResponse<Student>> {
    return apiClient.patchUpload<ApiResponse<Student>>(`/api/admin/students/${admissionNumber}`, data);
  },

  async deleteStudent(admissionNumber: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/admin/students/${admissionNumber}`);
  },

  async checkStudentDeletion(admissionNumber: string): Promise<ApiResponse<{ hasOtherChildren: boolean; otherChildrenCount: number; parentEmail: string; studentName: string }>> {
    return apiClient.get<ApiResponse<{ hasOtherChildren: boolean; otherChildrenCount: number; parentEmail: string; studentName: string }>>(`/api/admin/students/${admissionNumber}?check=true`);
  },

  async createStudentWithEnrollment(
    studentData: FormData,
    enrollmentData: { classId: string; sectionId?: string; academicYear: string; term: string }
  ): Promise<ApiResponse<{ student: Student; enrollment: Enrollment }>> {
    // First create the student
    const studentResponse = await this.createStudent(studentData);
    if (!studentResponse.success) {
      return {
        success: false,
        message: studentResponse.message || "Failed to create student",
      } as ApiResponse<{ student: Student; enrollment: Enrollment }>;
    }

    // Then enroll the student
    const studentId = studentResponse.data?.admissionNumber;
    if (!studentId) {
      return {
        success: false,
        message: "Student created but failed to get student ID for enrollment",
      } as ApiResponse<{ student: Student; enrollment: Enrollment }>;
    }

    try {
      const enrollmentResponse = await this.enrollStudent({
        studentId,
        classId: enrollmentData.classId,
        sectionId: enrollmentData.sectionId,
        academicYear: enrollmentData.academicYear,
        term: enrollmentData.term as any,
      });

      if (!enrollmentResponse.success) {
        // Rollback: Delete the student
        await this.deleteStudent(studentId);
        return {
          success: false,
          message: enrollmentResponse.message || "Enrollment failed",
        } as ApiResponse<{ student: Student; enrollment: Enrollment }>;
      }

      return {
        success: true,
        data: {
          student: studentResponse.data as Student,
          enrollment: enrollmentResponse.data as Enrollment,
        },
      } as ApiResponse<{ student: Student; enrollment: Enrollment }>;
    } catch (error) {
      // Rollback: Delete the student
      try {
        await this.deleteStudent(studentId);
      } catch (deleteError) {
        console.error("Failed to rollback student creation:", deleteError);
      }
      return {
        success: false,
        message: "Failed to enroll student. Student creation was rolled back.",
      } as ApiResponse<{ student: Student; enrollment: Enrollment }>;
    }
  },

  // Classes
  async getAllClasses(params?: { level?: string; status?: string }): Promise<ApiResponse<any[]>> {
    // Add cache-busting timestamp to prevent 304 responses
    const cacheBuster = Date.now();
    console.log('[DEBUG getAllClasses] Fetching classes with params:', { ...params, _t: cacheBuster });
    const result = await apiClient.get<ApiResponse<any[]>>("/api/admin/classes", { ...params, _t: cacheBuster });
    console.log('[DEBUG getAllClasses] API response:', result);
    return result;
  },

  async getAllClassesWithSections(params?: { level?: string; status?: string }): Promise<ApiResponse<any[]>> {
    // Use the existing /api/admin/classes endpoint which already includes sections
    return this.getAllClasses(params);
  },

  async getClassById(classId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/admin/classes/${classId}`);
  },

  async createClass(data: CreateClassRequest): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>("/api/admin/classes", data);
  },

  async updateClass(classId: string, data: UpdateClassRequest): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/admin/classes/${classId}`, data);
  },

  async getStudentsByClass(classId: string, params?: { status?: string; academicYear?: string; term?: string }): Promise<ApiResponse<any[]>> {
    // Add cache-busting timestamp to prevent 304 responses
    const cacheBuster = Date.now();
    console.log('[DEBUG getStudentsByClass] Fetching students for class:', classId, 'with params:', { ...params, _t: cacheBuster });
    const result = await apiClient.get<ApiResponse<any[]>>(`/api/admin/classes/${classId}/students`, { ...params, _t: cacheBuster });
    console.log('[DEBUG getStudentsByClass] API response:', result);
    return result;
  },

  async deleteClass(classId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/admin/classes/${classId}`);
  },

  // Sections
  async getAllSections(params?: { status?: string }): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>("/api/admin/classes/sections", params);
  },

  async getSectionsByClass(classId: string, params?: { status?: string }): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>(`/api/admin/classes/${classId}/sections`, params);
  },

  async createSection(classId: string, data: CreateSectionRequest): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/admin/classes/${classId}/sections`, data);
  },

  async updateSection(sectionId: string, data: UpdateSectionRequest): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/admin/classes/sections/${sectionId}`, data);
  },

  async deleteSection(sectionId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/admin/classes/sections/${sectionId}`);
  },

  // Subjects
  async getAllSubjects(): Promise<ApiResponse<Subject[]>> {
    return apiClient.get<ApiResponse<Subject[]>>("/api/admin/subjects");
  },

  async getSubjectById(subjectId: string): Promise<ApiResponse<Subject>> {
    return apiClient.get<ApiResponse<Subject>>(`/api/admin/subjects/${subjectId}`);
  },

  async createSubject(data: CreateSubjectRequest): Promise<ApiResponse<Subject>> {
    return apiClient.post<ApiResponse<Subject>>("/api/admin/subjects", data);
  },

  async updateSubject(subjectId: string, data: UpdateSubjectRequest): Promise<ApiResponse<Subject>> {
    return apiClient.patch<ApiResponse<Subject>>(`/api/admin/subjects/${subjectId}`, data);
  },

  async deleteSubject(subjectId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/admin/subjects/${subjectId}`);
  },

  async toggleSubjectActive(subjectId: string): Promise<ApiResponse<Subject>> {
    return apiClient.patch<ApiResponse<Subject>>(`/api/admin/subjects/${subjectId}/toggle-active`);
  },

  async getSubjectsByClass(classId: string, termId?: string): Promise<ApiResponse<any[]>> {
    console.log("🔍 [API] getSubjectsByClass called with:", { classId, termId });
    return apiClient.get<ApiResponse<any[]>>(`/api/admin/subjects/classes/${classId}/subjects`, termId ? { termId } : {});
  },

  async assignSubjectsToClass(classId: string, data: { termId: string; subjectIds: string[] }): Promise<ApiResponse<{ added: number; skipped: number; curriculum: any[] }>> {
    return apiClient.post<ApiResponse<{ added: number; skipped: number; curriculum: any[] }>>(`/api/admin/subjects/classes/${classId}/subjects/bulk`, data);
  },

  async removeSubjectFromClass(classId: string, subjectId: string, termId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/admin/subjects/classes/${classId}/subjects/${subjectId}`, { termId });
  },

  // Results
  async getAllResults(params?: { sessionId?: string; termId?: string; page?: number; limit?: number }): Promise<PaginatedResponse<any>> {
    return apiClient.get<PaginatedResponse<any>>("/api/admin/students/results", params);
  },

  // Search
  async search(query: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/search", { q: query });
  },

  async searchStudents(params: { q: string; page?: number; limit?: number; status?: string; classId?: string; academicYear?: string; term?: string }): Promise<any> {
    return apiClient.get<any>("/api/search/students", params);
  },

  async searchStaff(params: { q: string; page?: number; limit?: number; status?: string; role?: string }): Promise<any> {
    return apiClient.get<any>("/api/search/staff", params);
  },

  async searchParents(params: { q: string; page?: number; limit?: number; status?: string }): Promise<any> {
    return apiClient.get<any>("/api/search/parents", params);
  },

  async searchClasses(params: { q: string; page?: number; limit?: number; status?: string; level?: string }): Promise<any> {
    return apiClient.get<any>("/api/search/classes", params);
  },

  async searchSubjects(params: { q: string; page?: number; limit?: number; status?: string }): Promise<any> {
    return apiClient.get<any>("/api/search/subjects", params);
  },

  // Staff (for teacher dropdowns)
  async getAllStaff(): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>("/api/admin/staff");
  },

  async getStaffById(staffId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/admin/staff/${staffId}`);
  },

  async updateStaff(staffId: string, data: UpdateStaffRequest): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/admin/staff/${staffId}`, data);
  },

  // Parents (using dedicated backend endpoints)
  async getAllParents(params?: { search?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Parent>> {
    return apiClient.get<PaginatedResponse<Parent>>("/api/admin/parents", params);
  },

  async getParentById(parentId: string): Promise<ApiResponse<Parent>> {
    return apiClient.get<ApiResponse<Parent>>(`/api/admin/parents/${parentId}`);
  },

  async createParent(data: CreateParentRequest): Promise<ApiResponse<Parent>> {
    return apiClient.post<ApiResponse<Parent>>("/api/admin/parents", data);
  },

  async updateParent(parentId: string, data: UpdateParentRequest): Promise<ApiResponse<Parent>> {
    return apiClient.patch<ApiResponse<Parent>>(`/api/admin/parents/${parentId}`, data);
  },

  async deleteParent(parentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/admin/parents/${parentId}`);
  },

  // Assignments
  async getAllAssignments(filters?: AssignmentFilters): Promise<ApiResponse<SubjectAssignment[]>> {
    // Filter out empty values to avoid 400 errors
    const cleanFilters = Object.fromEntries(
      Object.entries(filters || {}).filter(([_, value]) => value !== "" && value !== undefined && value !== null)
    );
    return apiClient.get<ApiResponse<SubjectAssignment[]>>("/api/admin/assignments", cleanFilters);
  },

  async getAssignmentById(assignmentId: string): Promise<ApiResponse<SubjectAssignment>> {
    return apiClient.get<ApiResponse<SubjectAssignment>>(`/api/admin/assignments/${assignmentId}`);
  },

  async getAssignmentsByTeacher(teacherId: string): Promise<ApiResponse<SubjectAssignment[]>> {
    return apiClient.get<ApiResponse<SubjectAssignment[]>>(`/api/admin/assignments/teacher/${teacherId}`);
  },

  async getAssignmentsByClass(classId: string, academicYear: string, term: Term): Promise<ApiResponse<SubjectAssignment[]>> {
    return apiClient.get<ApiResponse<SubjectAssignment[]>>("/api/admin/assignments", { classId, academicYear, term });
  },

  async createAssignment(data: CreateAssignmentRequest): Promise<ApiResponse<SubjectAssignment>> {
    return apiClient.post<ApiResponse<SubjectAssignment>>("/api/admin/assignments", data);
  },

  async bulkCreateAssignment(data: BulkCreateAssignmentRequest): Promise<ApiResponse<{ added: number; skipped: number; assignments: SubjectAssignment[] }>> {
    return apiClient.post<ApiResponse<{ added: number; skipped: number; assignments: SubjectAssignment[] }>>("/api/admin/assignments/bulk", data);
  },

  async removeAssignment(assignmentId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/admin/assignments/${assignmentId}`);
  },

  // Class Teacher Assignments
  async getAllClassTeachers(): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>("/api/admin/classes");
  },

  async assignClassTeacher(classId: string, teacherId: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/admin/classes/${classId}/class-teacher`, { teacherId });
  },

  async removeClassTeacher(classId: string): Promise<ApiResponse<any>> {
    return apiClient.delete<ApiResponse<any>>(`/api/admin/classes/${classId}/class-teacher`);
  },

  async updateAssignment(assignmentId: string, data: UpdateAssignmentRequest): Promise<ApiResponse<SubjectAssignment>> {
    return apiClient.patch<ApiResponse<SubjectAssignment>>(`/api/admin/assignments/${assignmentId}`, data);
  },

  // Enrollment
  async enrollStudent(data: CreateEnrollmentRequest): Promise<ApiResponse<Enrollment>> {
    return apiClient.post<ApiResponse<Enrollment>>("/api/admin/enrollment", data);
  },

  async getStudentEnrollment(studentId: string): Promise<ApiResponse<Enrollment>> {
    return apiClient.get<ApiResponse<Enrollment>>(`/api/admin/enrollment/${studentId}`);
  },

  async getEnrollmentsByClass(classId: string, academicYear: string, term: Term, status?: EnrollmentStatus): Promise<ApiResponse<Enrollment[]>> {
    return apiClient.get<ApiResponse<Enrollment[]>>("/api/admin/enrollment/class", { classId, academicYear, term, status });
  },

  async getEnrollmentsBySection(sectionId: string, academicYear: string, term: Term, status?: EnrollmentStatus): Promise<ApiResponse<Enrollment[]>> {
    return apiClient.get<ApiResponse<Enrollment[]>>("/api/admin/enrollment/section", { sectionId, academicYear, term, status });
  },

  async transferStudent(enrollmentId: string, newSectionId: string): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/admin/enrollment/${enrollmentId}/transfer`, { newSectionId });
  },

  async transferStudentWithClass(enrollmentId: string, newClassId: string, newSectionId: string): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/admin/enrollment/${enrollmentId}/transfer-with-class`, { newClassId, newSectionId });
  },

  async bulkTransferStudentsWithClass(transfers: Array<{ enrollmentId: string; newClassId: string; newSectionId: string }>): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>("/api/admin/enrollment/bulk-transfer-with-class", { transfers });
  },

  async bulkTransferStudents(data: { transfers: Array<{ enrollmentId: string; newSectionId: string }> }): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>("/api/admin/enrollment/bulk-transfer", data);
  },

  async assignFromPool(data: { sectionId: string; studentIds: string[] }): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>("/api/admin/enrollment/assign", data);
  },

  // Promotion
  async verifyResultsForPromotion(sessionId: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>("/api/admin/promotion/verify", { sessionId });
  },

  async runPromotion(sessionId: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>("/api/admin/promotion/run", { sessionId });
  },

  // Academic Sessions/Terms
  async getAllSessions(): Promise<ApiResponse<AcademicSession[]>> {
    // Add cache-busting timestamp to prevent 304 responses
    const cacheBuster = Date.now();
    return apiClient.get<ApiResponse<AcademicSession[]>>("/api/admin/config/sessions", { _t: cacheBuster });
  },

  async createSession(data: CreateSessionRequest): Promise<ApiResponse<AcademicSession>> {
    return apiClient.post<ApiResponse<AcademicSession>>("/api/admin/config/sessions", data);
  },

  async getSessionById(sessionId: string): Promise<ApiResponse<AcademicSession>> {
    return apiClient.get<ApiResponse<AcademicSession>>(`/api/admin/config/sessions/${sessionId}`);
  },

  async updateSession(sessionId: string, data: { session?: string }): Promise<ApiResponse<AcademicSession>> {
    return apiClient.patch<ApiResponse<AcademicSession>>(`/api/admin/config/sessions/${sessionId}`, data);
  },

  async deleteSession(sessionId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/admin/config/sessions/${sessionId}`);
  },

  async createTerm(data: CreateTermRequest): Promise<ApiResponse<AcademicTerm>> {
    return apiClient.post<ApiResponse<AcademicTerm>>("/api/admin/config/terms", data);
  },

  async getAllTerms(): Promise<ApiResponse<AcademicTerm[]>> {
    return apiClient.get<ApiResponse<AcademicTerm[]>>("/api/admin/config/terms");
  },

  async getTermsBySession(sessionId: string): Promise<ApiResponse<AcademicTerm[]>> {
    return apiClient.get<ApiResponse<AcademicTerm[]>>(`/api/admin/config/sessions/${sessionId}/terms`);
  },

  async updateTermStatus(termId: string, data: UpdateTermStatusRequest): Promise<ApiResponse<AcademicTerm>> {
    return apiClient.patch<ApiResponse<AcademicTerm>>(`/api/admin/config/terms/${termId}/status`, data);
  },

  async updateTerm(termId: string, data: { startDate?: string; endDate?: string }): Promise<ApiResponse<AcademicTerm>> {
    return apiClient.patch<ApiResponse<AcademicTerm>>(`/api/admin/config/terms/${termId}`, data);
  },

  async deleteTerm(termId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/admin/config/terms/${termId}`);
  },

  async getCurrentTerm(): Promise<ApiResponse<AcademicTerm>> {
    return apiClient.get<ApiResponse<AcademicTerm>>("/api/admin/config/terms/current");
  },

  async getCurrentSession(): Promise<ApiResponse<AcademicSession>> {
    return apiClient.get<ApiResponse<AcademicSession>>("/api/admin/config/sessions/current");
  },

  async setCurrentSessionAndTerm(sessionId: string, termId: string): Promise<ApiResponse<{ session: AcademicSession; term: AcademicTerm }>> {
    return apiClient.put<ApiResponse<{ session: AcademicSession; term: AcademicTerm }>>("/api/admin/config/current", { sessionId, termId });
  },

  // Dashboard Statistics
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<ApiResponse<DashboardStats>>("/api/admin/dashboard/stats");
  },

  // Results Management
  async bulkEntryScores(data: {
    classId?: string;
    sectionId?: string;
    subjectId: string;
    termId: string;
    sessionId: string;
    staffId?: string;
    scores: Array<{
      studentId: string;
      ca1Score?: number;
      ca2Score?: number;
      examScore?: number;
    }>;
  }): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>("/api/admin/results/bulk-entry", data);
  },

  async getEntryStatus(params?: {
    sectionId?: string;
    subjectId?: string;
    termId?: string;
    sessionId?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/admin/results/entry-status", params);
  },

  async getUnverifiedResults(params?: {
    termId?: string;
    sessionId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> {
    return apiClient.get<PaginatedResponse<any>>("/api/admin/results/unverified", params);
  },

  async verifyResult(resultId: string): Promise<ApiResponse<any>> {
    return apiClient.patch<ApiResponse<any>>(`/api/admin/results/${resultId}/verify`);
  },

  async verifyAllResultsForStudent(studentId: string, data: { termId: string; sessionId: string }): Promise<ApiResponse<{ verified: number }>> {
    return apiClient.patch<ApiResponse<{ verified: number }>>(`/api/admin/results/student/${studentId}/verify-all`, data);
  },

  async verifyAllResultsForSection(sectionId: string, data: { termId: string; sessionId: string }): Promise<ApiResponse<{ verified: number; students?: string[] }>> {
    return apiClient.patch<ApiResponse<{ verified: number; students?: string[] }>>(`/api/admin/results/section/${sectionId}/verify-all`, data);
  },

  async getResultsStatistics(params?: {
    termId?: string;
    sessionId?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/admin/results/statistics", params);
  },

  async getEntryStatusByClass(params?: {
    termId?: string;
    sessionId?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/admin/results/entry-status-by-class", params);
  },

  async getRecentActivity(params?: {
    termId?: string;
    sessionId?: string;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/admin/results/recent-activity", params);
  },

  async getResultsByClass(params?: {
    classId?: string;
    termId?: string;
    sessionId?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/admin/results/by-class", params);
  },

  // Annual Results
  async getAnnualReportCard(studentId: string, sessionId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/admin/results/annual-report-card/${studentId}`, { sessionId });
  },

  async getAnnualReportCardPreview(studentId: string, sessionId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/admin/results/annual-report-card/${studentId}/preview`, { sessionId });
  },

  async getAnnualReportCardPDF(studentId: string, sessionId: string): Promise<Blob> {
    return apiClient.getBlob(`/api/admin/results/annual-report-card-pdf/${studentId}`, { sessionId });
  },

  async generateBatchAnnualReportCards(classId: string, sessionId: string, format: 'zip' | 'individual' = 'zip'): Promise<Blob | ApiResponse<any>> {
    if (format === 'zip') {
      return apiClient.postBlob('/api/admin/results/annual-report-cards-pdf/batch', { classId, sessionId, format });
    } else {
      return apiClient.post<ApiResponse<any>>('/api/admin/results/annual-report-cards/batch', { classId, sessionId, format });
    }
  },

  async getAnnualStatistics(classId: string, sessionId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/admin/results/annual-statistics', { classId, sessionId });
  },

  async getAnnualResultsByClass(classId: string, sessionId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>('/api/admin/results/annual-by-class', { classId, sessionId });
  },
};
