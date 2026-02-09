import apiClient from './client';
import { API_ENDPOINTS } from '@/constants';
import {
  ContactForm,
  ContactFormSubmission,
  ContactFormSubmissionRequest,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export const contactFormService = {
  getDefaultTemplate: async (): Promise<ApiResponse<{ questions: any[]; description: string }>> => {
    const response = await apiClient.get<ApiResponse<{ questions: any[]; description: string }>>(
      API_ENDPOINTS.CONTACT_FORMS.DEFAULT_TEMPLATE
    );
    return response.data;
  },

  create: async (data: Omit<ContactForm, 'id' | 'supplier_id'>): Promise<ApiResponse<ContactForm>> => {
    const response = await apiClient.post<ApiResponse<ContactForm>>(API_ENDPOINTS.CONTACT_FORMS.CREATE, data);
    return response.data;
  },

  getBySupplier: async (supplierId: number): Promise<ApiResponse<ContactForm>> => {
    const response = await apiClient.get<ApiResponse<ContactForm>>(
      API_ENDPOINTS.CONTACT_FORMS.SUPPLIER(supplierId)
    );
    return response.data;
  },

  update: async (id: number, data: Partial<ContactForm>): Promise<ApiResponse<ContactForm>> => {
    const response = await apiClient.put<ApiResponse<ContactForm>>(API_ENDPOINTS.CONTACT_FORMS.UPDATE(id), data);
    return response.data;
  },

  resetToDefault: async (id: number): Promise<ApiResponse<ContactForm>> => {
    const response = await apiClient.post<ApiResponse<ContactForm>>(API_ENDPOINTS.CONTACT_FORMS.RESET(id));
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.CONTACT_FORMS.DELETE(id));
    return response.data;
  },

  submit: async (id: number, data: ContactFormSubmissionRequest): Promise<ApiResponse<ContactFormSubmission>> => {
    const response = await apiClient.post<ApiResponse<ContactFormSubmission>>(
      API_ENDPOINTS.CONTACT_FORMS.SUBMIT(id),
      data
    );
    return response.data;
  },

  getSubmissions: async (
    id: number,
    page?: number,
    pageSize?: number,
    read?: boolean
  ): Promise<PaginatedResponse<ContactFormSubmission> & { unread_count?: number }> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (read !== undefined) params.append('read', read.toString());

    const response = await apiClient.get<PaginatedResponse<ContactFormSubmission> & { unread_count?: number }>(
      `${API_ENDPOINTS.CONTACT_FORMS.SUBMISSIONS(id)}?${params.toString()}`
    );
    return response.data;
  },

  markAsRead: async (id: number, submissionId: number): Promise<ApiResponse<{ id: number; read: boolean }>> => {
    const response = await apiClient.put<ApiResponse<{ id: number; read: boolean }>>(
      API_ENDPOINTS.CONTACT_FORMS.MARK_READ(id, submissionId)
    );
    return response.data;
  },
};

