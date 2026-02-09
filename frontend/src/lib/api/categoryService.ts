import apiClient from './client';
import { API_ENDPOINTS } from '@/constants';
import { Category, PaginatedResponse, ApiResponse } from '@/types';

export const categoryService = {
  list: async (active?: boolean, page?: number, pageSize?: number): Promise<PaginatedResponse<Category>> => {
    const params = new URLSearchParams();
    if (active !== undefined) params.append('active', active.toString());
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());

    const response = await apiClient.get<PaginatedResponse<Category>>(
      `${API_ENDPOINTS.CATEGORIES.LIST}?${params.toString()}`
    );
    return response.data;
  },

  create: async (data: Omit<Category, 'id' | 'created_at'>): Promise<ApiResponse<Category>> => {
    const response = await apiClient.post<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.CREATE, data);
    return response.data;
  },

  update: async (id: number, data: Partial<Category>): Promise<ApiResponse<Category>> => {
    const response = await apiClient.put<ApiResponse<Category>>(API_ENDPOINTS.CATEGORIES.UPDATE(id), data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.CATEGORIES.DELETE(id));
    return response.data;
  },
};

