import { apiClient } from "./client";
import { ApiResponse } from "@/lib/types/common";

export interface DrugRequest {
  id: string;
  nurseId: string;
  requestDate: string;
  listImage: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  nurse: {
    id: string;
    staffId: string;
    firstName?: string;
    lastName?: string;
  };
  purchases?: DrugPurchase[];
}

export interface DrugPurchase {
  id: string;
  requestId: string;
  purchaseDate: string;
  invoiceImage: string;
  receiptImage: string;
  amount?: number;
  supplier?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SickbayVisit {
  id: string;
  studentId: string;
  nurseId: string;
  visitDate: string;
  symptoms: string;
  treatment: string;
  medication?: string;
  notes?: string;
  dailyImage?: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    admissionNumber: string;
    firstName: string;
    middleName?: string;
    lastName: string;
  };
  nurse: {
    id: string;
    staffId: string;
    firstName?: string;
    lastName?: string;
  };
}

export const healthApi = {
  // Drug Requests
  async submitDrugRequest(data: FormData): Promise<ApiResponse<DrugRequest>> {
    return apiClient.upload<ApiResponse<DrugRequest>>("/api/health/drug-requests", data);
  },

  async getDrugRequests(): Promise<ApiResponse<DrugRequest[]>> {
    return apiClient.get<ApiResponse<DrugRequest[]>>("/api/health/drug-requests");
  },

  async getDrugRequest(id: string): Promise<ApiResponse<DrugRequest>> {
    return apiClient.get<ApiResponse<DrugRequest>>(`/api/health/drug-requests/${id}`);
  },

  async updateDrugRequestStatus(id: string, status: "PENDING" | "COMPLETED" | "CANCELLED"): Promise<ApiResponse<DrugRequest>> {
    return apiClient.patch<ApiResponse<DrugRequest>>(`/api/health/drug-requests/${id}/status`, { status });
  },

  // Drug Purchases
  async recordDrugPurchase(data: FormData): Promise<ApiResponse<DrugPurchase>> {
    return apiClient.upload<ApiResponse<DrugPurchase>>("/api/health/drug-purchases", data);
  },

  async getDrugPurchases(requestId: string): Promise<ApiResponse<DrugPurchase[]>> {
    return apiClient.get<ApiResponse<DrugPurchase[]>>(`/api/health/drug-purchases/${requestId}`);
  },

  // Sickbay Visits
  async recordSickbayVisit(data: {
    studentId: string;
    symptoms: string;
    treatment: string;
    medication?: string;
    notes?: string;
  }): Promise<ApiResponse<SickbayVisit>> {
    return apiClient.post<ApiResponse<SickbayVisit>>("/api/health/sickbay-visits", data);
  },

  async getSickbayVisits(params?: {
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<SickbayVisit[]>> {
    return apiClient.get<ApiResponse<SickbayVisit[]>>("/api/health/sickbay-visits", params);
  },

  async getSickbayVisit(id: string): Promise<ApiResponse<SickbayVisit>> {
    return apiClient.get<ApiResponse<SickbayVisit>>(`/api/health/sickbay-visits/${id}`);
  },

  async updateSickbayVisit(id: string, data: {
    symptoms?: string;
    treatment?: string;
    medication?: string;
    notes?: string;
  }): Promise<ApiResponse<SickbayVisit>> {
    return apiClient.patch<ApiResponse<SickbayVisit>>(`/api/health/sickbay-visits/${id}`, data);
  },

  // Daily Visitor Log
  async uploadDailyVisitorLog(data: FormData): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.upload<ApiResponse<{ success: boolean; message: string }>>("/api/health/daily-visitor-log", data);
  },

  async getDailyVisitorLog(date: string): Promise<ApiResponse<string | null>> {
    return apiClient.get<ApiResponse<string | null>>("/api/health/daily-visitor-log", { date });
  },

  async getDailyVisits(date: string): Promise<ApiResponse<SickbayVisit[]>> {
    return apiClient.get<ApiResponse<SickbayVisit[]>>("/api/health/daily-visits", { date });
  },
};
