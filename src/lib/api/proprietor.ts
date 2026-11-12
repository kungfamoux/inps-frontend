import { apiClient } from "./client";
import { ApiResponse } from "@/lib/types/common";

export const proprietorApi = {
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/proprietor/dashboard");
  },

  async getFinancialAnalytics(params?: { limit?: number }): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/proprietor/financial-analytics", params);
  },

  async getStaffOverview(params?: { role?: string; type?: string }): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/proprietor/staff", params);
  },

  async getStaffStatistics(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/proprietor/staff/statistics");
  },

  async getStudentEnrollmentOverview(params?: { academicYear?: string; term?: string }): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/proprietor/students/enrollment", params);
  },

  async getAcademicPerformanceMetrics(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/proprietor/academic-performance");
  },

  async getSchoolConfiguration(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/proprietor/school-info");
  },
};
