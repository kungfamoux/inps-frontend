import { apiClient } from "./client";
import type { ApiResponse, PaginatedResponse } from "@/lib/types/common";
import type { BursaryStats, Bill, FeeCollection, Invoice, Expense, IncomeRecord, BookPrice } from "../types/bursary";

export const bursaryApi = {
  // Classes (bursary-specific endpoint)
  async getAllClasses(params?: { level?: string; status?: string }): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>("/api/finance/classes", params);
  },

  // Students (bursary-specific endpoint)
  async getAllStudents(params?: { status?: string; page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<any>> {
    return apiClient.get<PaginatedResponse<any>>("/api/finance/students", params);
  },

  // Sessions (for invoice generation)
  async getAllSessions(): Promise<ApiResponse<any[]>> {
    return apiClient.get<ApiResponse<any[]>>("/api/finance/sessions");
  },

  // Stats
  async getStats(): Promise<ApiResponse<BursaryStats>> {
    return apiClient.get<ApiResponse<BursaryStats>>("/api/finance/stats");
  },

  // Bills
  async getAllBills(params?: { academicYear?: string; term?: string; scope?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Bill>> {
    return apiClient.get<PaginatedResponse<Bill>>("/api/finance/bills", params);
  },

  async getBillById(billId: string): Promise<ApiResponse<Bill>> {
    return apiClient.get<ApiResponse<Bill>>(`/api/finance/bills/${billId}`);
  },

  async createBill(data: Partial<Bill>): Promise<ApiResponse<Bill>> {
    return apiClient.post<ApiResponse<Bill>>("/api/finance/bills", data);
  },

  async updateBill(billId: string, data: Partial<Bill>): Promise<ApiResponse<Bill>> {
    return apiClient.put<ApiResponse<Bill>>(`/api/finance/bills/${billId}`, data);
  },

  async deleteBill(billId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/finance/bills/${billId}`);
  },

  async getFeeStructureByClass(classId: string): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>(`/api/finance/bills/class/${classId}`);
  },

  // Book Prices (currently not implemented in backend)
  async getAllBookPrices(): Promise<ApiResponse<BookPrice[]>> {
    return apiClient.get<ApiResponse<BookPrice[]>>("/api/finance/books");
  },

  async createBookPrice(data: Partial<BookPrice>): Promise<ApiResponse<BookPrice>> {
    return apiClient.post<ApiResponse<BookPrice>>("/api/finance/books", data);
  },

  async updateBookPrice(id: string, data: Partial<BookPrice>): Promise<ApiResponse<BookPrice>> {
    return apiClient.put<ApiResponse<BookPrice>>(`/api/finance/books/${id}`, data);
  },

  async deleteBookPrice(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/api/finance/books/${id}`);
  },

  // Expenses
  async getAllExpenses(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Expense>> {
    return apiClient.get<PaginatedResponse<Expense>>("/api/finance/expenses", params);
  },

  async addExpense(data: Partial<Expense>): Promise<ApiResponse<Expense>> {
    return apiClient.post<ApiResponse<Expense>>("/api/finance/expenses", data);
  },

  // Income Records
  async getAllIncomeRecords(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<IncomeRecord>> {
    return apiClient.get<PaginatedResponse<IncomeRecord>>("/api/finance/income", params);
  },

  async addIncomeRecord(data: Partial<IncomeRecord>): Promise<ApiResponse<IncomeRecord>> {
    return apiClient.post<ApiResponse<IncomeRecord>>("/api/finance/income", data);
  },

  // Fee Collections
  async getFeeCollections(params?: {
    status?: string;
    search?: string;
    academicYear?: string;
    term?: string;
    classFilter?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<FeeCollection>> {
    return apiClient.get<PaginatedResponse<FeeCollection>>("/api/finance/collections", params);
  },

  // Financial Summary
  async getFinancialSummary(): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/finance/summary");
  },

  async getRecentPayments(params?: { limit?: number }): Promise<ApiResponse<any>> {
    return apiClient.get<ApiResponse<any>>("/api/finance/payments", params);
  },

  // Invoices
  async generateInvoices(data: { academicYear: string; term: string }): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>("/api/finance/invoices/generate", data);
  },

  async getAllInvoices(params?: {
    academicYear?: string;
    term?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> {
    return apiClient.get<PaginatedResponse<any>>("/api/finance/invoices", params);
  },

  // Payments
  async getPayments(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> {
    return apiClient.get<PaginatedResponse<any>>("/api/finance/payments", params);
  },

  async recordManualPayment(data: {
    studentId: string;
    invoiceIds: string[];
    amount: number;
    paymentDate: string;
    paymentChannel: string;
    referenceNumber?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>("/api/finance/payments/manual", data);
  },

  async reconcilePayment(paymentId: string, feeCollectionId: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/finance/payments/${paymentId}/reconcile`, { feeCollectionId });
  },

  async rejectPayment(paymentId: string): Promise<ApiResponse<any>> {
    return apiClient.post<ApiResponse<any>>(`/api/finance/payments/${paymentId}/reject`, {});
  },

  async getPaymentReports(params?: {
    dateRange?: string;
    paymentMethod?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    return apiClient.get<any>("/api/finance/payments/reports", params);
  },
};
