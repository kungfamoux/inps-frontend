export interface Guardian {
  relationship: string; // Father, Mother, Guardian, Uncle, Aunt, Grandparent
  title?: string; // Mr., Mrs., Ms., Dr., Chief, Engr., Pastor, Imam
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  occupation?: string;
  address?: string;
}

export enum MaritalStatus {
  MARRIED = "MARRIED",
  SINGLE = "SINGLE",
  DIVORCED = "DIVORCED",
  WIDOWED = "WIDOWED",
  SEPARATED = "SEPARATED",
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  warning?: string;
  info?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta?: PaginationMeta;
}

export enum StaffRole {
  TEACHER = "TEACHER",
  ADMIN = "ADMIN",
  HEAD_TEACHER = "HEAD_TEACHER",
  BURSARY = "BURSARY",
  STOREKEEPER = "STOREKEEPER",
  NURSE = "NURSE",
  SUPERVISOR = "SUPERVISOR",
  ICT = "ICT",
  CLEANERS = "CLEANERS",
  SECURITY = "SECURITY",
  OTHERS = "OTHERS",
}

export enum StaffType {
  TEACHING = "TEACHING",
  NON_TEACHING = "NON_TEACHING",
}

export enum StaffStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum StudentStatus {
  ACTIVE = "ACTIVE",
  GRADUATED = "GRADUATED",
  WITHDRAWN = "WITHDRAWN",
}

export enum IntakeType {
  NEW = "NEW",
  CONTINUING = "CONTINUING",
}

export enum SchoolLevel {
  DAYCARE = "DAYCARE",
  PRENURSERY = "PRENURSERY",
  NURSERY_1 = "NURSERY_1",
  NURSERY_2 = "NURSERY_2",
  NURSERY_3 = "NURSERY_3",
  PRIMARY_1 = "PRIMARY_1",
  PRIMARY_2 = "PRIMARY_2",
  PRIMARY_3 = "PRIMARY_3",
  PRIMARY_4 = "PRIMARY_4",
  PRIMARY_5 = "PRIMARY_5",
  PRIMARY_6 = "PRIMARY_6",
}

export enum ClassColor {
  YELLOW = "YELLOW",
  BLUE = "BLUE",
  GREEN = "GREEN",
  RAINBOW = "RAINBOW",
}

export enum ClassStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  MERGED = "MERGED",
}

export enum SectionStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum Term {
  FIRST_TERM = "FIRST_TERM",
  SECOND_TERM = "SECOND_TERM",
  THIRD_TERM = "THIRD_TERM",
}

export enum SessionStatus {
  UPCOMING = "UPCOMING",
  CURRENT = "CURRENT",
  COMPLETED = "COMPLETED",
}

export enum TermStatus {
  UPCOMING = "UPCOMING",
  CURRENT = "CURRENT",
  COMPLETED = "COMPLETED",
}

export interface AcademicSession {
  id: string;
  session: string;
  status: SessionStatus;
  terms: AcademicTerm[];
  createdAt: string;
  updatedAt: string;
}

export interface AcademicTerm {
  id: string;
  sessionId: string;
  term: Term;
  status: TermStatus;
  startDate: string;
  endDate: string;
  session?: AcademicSession;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionRequest {
  session: string;
}

export interface CreateTermRequest {
  sessionId: string;
  term: Term;
  startDate: string;
  endDate: string;
}

export interface UpdateTermStatusRequest {
  status: TermStatus;
  sessionId?: string;
}

export enum EnrollmentStatus {
  ACTIVE = "ACTIVE",
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  sectionId: string | null;
  academicYear: string;
  term: Term;
  status: EnrollmentStatus;
  student?: {
    id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
  };
  class?: {
    id: string;
    name: string;
    level: SchoolLevel;
  };
  section?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnrollmentRequest {
  studentId: string;
  classId: string;
  sectionId?: string;
  academicYear: string;
  term: Term;
}

export interface CreateClassRequest {
  name: string;
  level: SchoolLevel;
}

export interface UpdateClassRequest {
  name?: string;
  level?: SchoolLevel;
  status?: ClassStatus;
}

export interface CreateSectionRequest {
  name: string;
  classId: string;
  classTeacherId?: string;
  assistantTeacherId?: string;
  capacity?: number;
}

export interface UpdateSectionRequest {
  name?: string;
  classTeacherId?: string;
  assistantTeacherId?: string;
  capacity?: number;
  status?: SectionStatus;
}

export interface TransferRequest {
  enrollmentId: string;
  newSectionId: string;
  reason?: string;
}

export interface EnrollmentFilters {
  classId?: string;
  sectionId?: string;
  academicYear?: string;
  term?: Term;
  status?: EnrollmentStatus;
}

export enum SubjectAssignmentStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum SubjectStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface Subject {
  id: string;
  subjectName: string;
  subjectCode: string;
  description?: string;
  levels: SchoolLevel[] | { level: SchoolLevel }[];
  isActive?: boolean;
  status?: SubjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectRequest {
  subjectName: string;
  subjectCode: string;
  description?: string;
  levels: SchoolLevel[];
}

export interface UpdateSubjectRequest {
  subjectName?: string;
  subjectCode?: string;
  description?: string;
  levels?: SchoolLevel[];
  status?: SubjectStatus;
  isActive?: boolean;
}

export interface SubjectAssignment {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  academicYear: string;
  term: Term;
  status: SubjectAssignmentStatus;
  class?: {
    id: string;
    name: string;
    level: SchoolLevel;
  };
  subject?: {
    id: string;
    subjectName: string;
    subjectCode: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  teachingStaff: number;
  activeEnrollments: number;
  classStats: Array<{
    id: string;
    name: string;
    level: string;
    studentCount: number;
  }>;
  updatedAt: string;
}

export interface CreateAssignmentRequest {
  classId: string;
  subjectId: string;
  teacherId: string;
  academicYear: string;
  term: Term;
  termId: string;
}

export interface BulkCreateAssignmentRequest {
  classIds: string[];
  subjectId: string;
  teacherId: string;
  academicYear: string;
  term: Term;
  termId: string;
}

export interface UpdateAssignmentRequest {
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  academicYear?: string;
  term?: Term;
  status?: SubjectAssignmentStatus;
}

export interface AssignmentFilters {
  classId?: string;
  subjectId?: string;
  teacherId?: string;
  academicYear?: string;
  term?: Term;
  status?: SubjectAssignmentStatus;
}
