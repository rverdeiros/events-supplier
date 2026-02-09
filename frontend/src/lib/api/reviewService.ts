import apiClient from './client';
import { API_ENDPOINTS } from '@/constants';
import { Review, ReviewRequest, PaginatedResponse, ApiResponse } from '@/types';

export const reviewService = {
  create: async (data: ReviewRequest): Promise<ApiResponse<Review>> => {
    const response = await apiClient.post<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS.CREATE, data);
    return response.data;
  },

  getBySupplier: async (supplierId: number, page?: number, pageSize?: number): Promise<PaginatedResponse<Review>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());

    const response = await apiClient.get<PaginatedResponse<Review>>(
      `${API_ENDPOINTS.REVIEWS.SUPPLIER(supplierId)}?${params.toString()}`
    );
    return response.data;
  },

  // Get approved reviews for homepage carousel
  getApproved: async (limit: number = 10): Promise<ApiResponse<Review[]>> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());

    const response = await apiClient.get<ApiResponse<Review[]>>(
      `${API_ENDPOINTS.REVIEWS.APPROVED}?${params.toString()}`
    );
    return response.data;
  },

  getPending: async (page?: number, pageSize?: number): Promise<PaginatedResponse<Review>> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());

    const response = await apiClient.get<PaginatedResponse<Review>>(
      `${API_ENDPOINTS.REVIEWS.PENDING}?${params.toString()}`
    );
    return response.data;
  },

  getAll: async (
    statusFilter?: 'pending' | 'approved' | 'rejected' | 'all',
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<Review>> => {
    const params = new URLSearchParams();
    if (statusFilter) params.append('status_filter', statusFilter);
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());

    const response = await apiClient.get<PaginatedResponse<Review>>(
      `${API_ENDPOINTS.REVIEWS.ALL}?${params.toString()}`
    );
    return response.data;
  },

  approve: async (id: number): Promise<ApiResponse<Review>> => {
    const response = await apiClient.put<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS.APPROVE(id));
    return response.data;
  },

  reject: async (id: number): Promise<ApiResponse<Review>> => {
    const response = await apiClient.put<ApiResponse<Review>>(API_ENDPOINTS.REVIEWS.REJECT(id));
    return response.data;
  },

  update: async (id: number, data: Partial<ReviewRequest>): Promise<ApiResponse<Review>> => {
    const response = await apiClient.put<ApiResponse<Review>>(
      API_ENDPOINTS.REVIEWS.UPDATE(id),
      data
    );
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.REVIEWS.DELETE(id));
    return response.data;
  },
};

