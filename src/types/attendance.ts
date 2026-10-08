export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE';

export interface AttendanceRecord {
  admissionNumber: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceSubmission {
  date: string; // YYYY-MM-DD format
  records: AttendanceRecord[];
}

export interface AttendanceData {
  id: string;
  studentId: string;
  student: {
    id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
  };
  date: string;
  status: AttendanceStatus;
  note: string | null;
  createdAt: string;
  markedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface AttendanceResponse {
  date: string;
  class: string;
  section: string;
  role: string;
  records: AttendanceData[];
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  presentPercentage: number;
  absentPercentage: number;
  latePercentage: number;
  excusedPercentage: number;
}

export interface AttendanceSummaryResponse {
  class: string;
  section: string;
  role: string;
  summary: AttendanceSummary;
}
