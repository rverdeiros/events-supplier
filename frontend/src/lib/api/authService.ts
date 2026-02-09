import apiClient from './client';
import { API_ENDPOINTS } from '@/constants';
import { RegisterRequest, LoginRequest, AuthResponse, User, ApiResponse } from '@/types';
import { decodeJWT, getUserIdFromToken } from '@/lib/utils/jwt';
import { setCookie, deleteCookie } from '@/lib/utils/cookies';

export const authService = {
  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, data);
    
    // Store token in localStorage and cookie
    if (typeof window !== 'undefined' && response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
      // Cookie will be set by authStore.setAuth, but set it here too for immediate middleware access
      setCookie('auth_token', response.data.access_token, 7);
    }
    
    return response.data;
  },

  /**
   * Get current user data
   * Tries /auth/me endpoint first, falls back to decoding token
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Try to get from /auth/me endpoint if it exists
      const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
      return response.data.data;
    } catch (error: any) {
      // If endpoint doesn't exist, decode token for basic info
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const payload = decodeJWT(token);
          if (payload) {
            // Return minimal user object from token
            // Note: This is a fallback. Backend should implement /auth/me
            return {
              id: parseInt(payload.sub, 10),
              name: '', // Will be empty, needs to be fetched
              email: '', // Will be empty, needs to be fetched
              type: (payload.type as 'client' | 'supplier' | 'admin') || 'client',
              created_at: '',
            };
          }
        }
      }
      return null;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      deleteCookie('auth_token');
    }
  },

  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get<ApiResponse<User[]>>(API_ENDPOINTS.AUTH.USERS);
    return response.data;
  },

  deleteUser: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(API_ENDPOINTS.AUTH.USER(id));
    return response.data;
  },

  getStats: async (): Promise<ApiResponse<{
    users: {
      total: number;
      by_type: {
        client: number;
        supplier: number;
        admin: number;
      };
    };
    suppliers: {
      total: number;
      active: number;
    };
    reviews: {
      total: number;
      pending: number;
      approved: number;
    };
    categories: {
      total: number;
      active: number;
    };
    submissions: {
      total: number;
      unread: number;
    };
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      users: {
        total: number;
        by_type: {
          client: number;
          supplier: number;
          admin: number;
        };
      };
      suppliers: {
        total: number;
        active: number;
      };
      reviews: {
        total: number;
        pending: number;
        approved: number;
      };
      categories: {
        total: number;
        active: number;
      };
      submissions: {
        total: number;
        unread: number;
      };
    }>>(API_ENDPOINTS.AUTH.STATS);
    return response.data;
  },
};

