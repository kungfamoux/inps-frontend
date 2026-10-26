import { apiClient } from "./client";
import { ApiResponse, PaginatedResponse } from "@/lib/types/common";

export const parentApi = {
  // Auth
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; refreshToken?: string; user: any }>> {
    return apiClient.post<ApiResponse<{ token: string; refreshToken?: string; user: any }>>("/api/parent/login", { email, password });
  },

  async getMe(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/parent/me");
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.patch<ApiResponse<void>>("/api/parent/change-password", { currentPassword, newPassword });
  },

  // Children
  async getMyChildren(): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>("/api/parent/children");
  },

  async getChildProfile(studentId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/parent/children/${studentId}`);
  },

  // Results
  async getChildResults(studentId: string, params: { termId: string; sessionId: string; filter?: "detail" | "summary" }): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/parent/children/${studentId}/results`, params);
  },

  // Attendance
  async getChildAttendance(studentId: string, params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/parent/children/${studentId}/attendance`, params);
  },

  // Timetable
  async getChildTimetable(studentId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/parent/children/${studentId}/timetable`);
  },

  // Announcements
  async getAnnouncements(params?: { category?: string; page?: number; limit?: number }): Promise<PaginatedResponse<any>> {
    return apiClient.get<PaginatedResponse<any>>("/api/parent/announcements", params);
  },

  async getUnreadAnnouncementCount(): Promise<ApiResponse<{ unread: number; total: number }>> {
    return apiClient.get<ApiResponse<{ unread: number; total: number }>>("/api/parent/announcements/unread");
  },

  async markAnnouncementAsRead(announcementId: string): Promise<ApiResponse<void>> {
    return apiClient.patch<ApiResponse<void>>(`/api/parent/announcements/${announcementId}/read`);
  },

  // Fees
  async getChildOutstandingFees(studentId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/parent/children/${studentId}/fees`);
  },

  async getChildPaymentHistory(studentId: string, params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<PaginatedResponse<any>> {
    return apiClient.get<PaginatedResponse<any>>(`/api/parent/children/${studentId}/payments`, params);
  },

  // Fee Payment Methods
  async getFeeOverview(studentId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/parent/fees/${studentId}/overview`);
  },

  async getOutstandingInvoices(studentId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/parent/fees/${studentId}/outstanding`);
  },

  async initializePayment(studentId: string, invoiceIds: string[]): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/parent/fees/${studentId}/pay/initialize`, { invoiceIds });
  },

  async verifyPayment(reference: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>('/api/parent/fees/pay/verify', { reference });
  },

  async uploadPaymentProof(studentId: string, data: { proof: File; referenceNumber?: string; paymentDate: string; invoiceIds: string[] }): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('proof', data.proof);
    formData.append('paymentDate', data.paymentDate);
    formData.append('invoiceIds', JSON.stringify(data.invoiceIds));
    if (data.referenceNumber) {
      formData.append('referenceNumber', data.referenceNumber);
    }
    return apiClient.post<ApiResponse<any>>(`/api/parent/fees/${studentId}/upload-proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Config
  async getSessions(): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>("/api/parent/config/sessions");
  },

  async getCurrentTerm(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/parent/config/terms/current");
  },

  async getCurrentSession(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/parent/config/sessions/current");
  },
};