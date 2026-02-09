import apiClient from './client';
import { API_ENDPOINTS } from '@/constants';
import {
  Supplier,
  SupplierFilters,
  PaginatedResponse,
  ApiResponse,
  Media,
  MediaRequest,
} from '@/types';

export const supplierService = {
  list: async (filters?: SupplierFilters): Promise<PaginatedResponse<Supplier>> => {
    const params = new URLSearchParams();
    
    if (filters?.city) params.append('city', filters.city);
    if (filters?.state) params.append('state', filters.state);
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    if (filters?.price_range) params.append('price_range', filters.price_range);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.random) params.append('random', 'true');
    if (filters?.order_by) params.append('order_by', filters.order_by);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());

    const response = await apiClient.get<PaginatedResponse<Supplier>>(
      `${API_ENDPOINTS.SUPPLIERS.LIST}?${params.toString()}`
    );
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Supplier>> => {
    const response = await apiClient.get<ApiResponse<Supplier>>(API_ENDPOINTS.SUPPLIERS.DETAIL(id));
    return response.data;
  },

  create: async (data: Omit<Supplier, 'id' | 'user_id' | 'status' | 'created_at'>): Promise<ApiResponse<Supplier>> => {
    const response = await apiClient.post<ApiResponse<Supplier>>(API_ENDPOINTS.SUPPLIERS.CREATE, data);
    return response.data;
  },

  update: async (id: number, data: Partial<Supplier>): Promise<ApiResponse<Supplier>> => {
    const response = await apiClient.put<ApiResponse<Supplier>>(API_ENDPOINTS.SUPPLIERS.UPDATE(id), data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.SUPPLIERS.DELETE(id));
    return response.data;
  },

  getMedia: async (supplierId: number, typeFilter?: string, page?: number, pageSize?: number): Promise<PaginatedResponse<Media>> => {
    const params = new URLSearchParams();
    if (typeFilter) params.append('type_filter', typeFilter);
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());

    const response = await apiClient.get<PaginatedResponse<Media>>(
      `${API_ENDPOINTS.MEDIA.SUPPLIER(supplierId)}?${params.toString()}`
    );
    return response.data;
  },

  addMedia: async (data: MediaRequest): Promise<ApiResponse<Media>> => {
    const response = await apiClient.post<ApiResponse<Media>>(API_ENDPOINTS.MEDIA.CREATE, data);
    return response.data;
  },

  uploadMedia: async (supplierId: number, file: File, type: 'image' | 'video' | 'document'): Promise<ApiResponse<Media>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('supplier_id', supplierId.toString());
    formData.append('media_type', type);

    const response = await apiClient.post<ApiResponse<Media>>(API_ENDPOINTS.MEDIA.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteMedia: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.MEDIA.DELETE(id));
    return response.data;
  },

  getMySupplier: async (): Promise<ApiResponse<{
    supplier: Supplier;
    metrics: {
      average_rating: number | null;
      approved_reviews_count: number;
      total_reviews_count: number;
      total_submissions: number;
      unread_submissions: number;
      completeness_score: number;
      completeness_is_complete: boolean;
      media_counts: {
        images: number;
        videos: number;
        documents: number;
      };
    };
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      supplier: Supplier;
      metrics: {
        average_rating: number | null;
        approved_reviews_count: number;
        total_reviews_count: number;
        total_submissions: number;
        unread_submissions: number;
        completeness_score: number;
        completeness_is_complete: boolean;
        media_counts: {
          images: number;
          videos: number;
          documents: number;
        };
      };
    }>>(API_ENDPOINTS.SUPPLIERS.ME);
    return response.data;
  },
};

