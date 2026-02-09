import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError } from '@/types';
import { isTokenExpired } from '@/lib/utils/jwt';
import { deleteCookie } from '@/lib/utils/cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to headers
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (or httpOnly cookie in production)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      
      // Check if token is expired
      if (token && isTokenExpired(token)) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        deleteCookie('auth_token');
        if (config.url !== '/auth/login' && config.url !== '/auth/register') {
          window.location.href = '/login?expired=true';
        }
        return Promise.reject(new Error('Token expired'));
      }
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      let errorMessage = errorData?.detail || error.message || 'Ocorreu um erro';

      // Handle specific HTTP status codes
      switch (status) {
        case 400:
          // Bad Request - Validation errors
          errorMessage = errorData?.detail || 'Dados inválidos. Verifique as informações fornecidas.';
          break;
        
        case 401:
          // Unauthorized - Handle differently for login vs other requests
          const isLoginRequest = error.config?.url?.includes('/auth/login');
          const isRegisterRequest = error.config?.url?.includes('/auth/register');
          
          if (isLoginRequest || isRegisterRequest) {
            // For login/register, show the actual error message from backend
            errorMessage = errorData?.detail || 'Credenciais inválidas. Verifique seu email e senha.';
          } else {
            // For other requests, it's a session expiration
            if (typeof window !== 'undefined') {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
              deleteCookie('auth_token');
              const currentPath = window.location.pathname;
              if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register')) {
                window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
              }
            }
            errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
          }
          break;
        
        case 403:
          // Forbidden
          errorMessage = errorData?.detail || 'Você não tem permissão para realizar esta ação.';
          break;
        
        case 404:
          // Not Found
          errorMessage = errorData?.detail || 'Recurso não encontrado.';
          break;
        
        case 422:
          // Unprocessable Entity - Validation errors
          if (Array.isArray(errorData?.detail)) {
            // FastAPI validation errors format
            const validationErrors = errorData.detail
              .map((err: any) => {
                if (typeof err === 'string') return err;
                if (err?.msg) {
                  const field = err.loc && err.loc.length > 1 ? err.loc[err.loc.length - 1] : 'campo';
                  return `${field}: ${err.msg}`;
                }
                return JSON.stringify(err);
              })
              .join(', ');
            errorMessage = `Erro de validação: ${validationErrors}`;
          } else if (typeof errorData?.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = 'Erro de validação. Verifique os dados fornecidos.';
          }
          break;
        
        case 429:
          // Too Many Requests - Rate limiting
          const retryAfter = error.response.headers['retry-after'];
          errorMessage = retryAfter
            ? `Muitas tentativas. Tente novamente em ${retryAfter} segundos.`
            : 'Muitas tentativas. Por favor, aguarde um momento antes de tentar novamente.';
          break;
        
        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          errorMessage = 'Erro no servidor. Por favor, tente novamente mais tarde.';
          break;
        
        default:
          if (Array.isArray(errorData?.detail)) {
            const validationErrors = errorData.detail
              .map((err: any) => {
                if (typeof err === 'string') return err;
                if (err?.msg) {
                  const field = err.loc && err.loc.length > 1 ? err.loc[err.loc.length - 1] : 'campo';
                  return `${field}: ${err.msg}`;
                }
                return JSON.stringify(err);
              })
              .join(', ');
            errorMessage = `Erro: ${validationErrors}`;
          } else if (typeof errorData?.detail === 'string') {
            errorMessage = errorData.detail;
          } else {
            errorMessage = 'Ocorreu um erro inesperado.';
          }
      }

      // Return error with message (always a string)
      return Promise.reject({
        status,
        message: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
        data: errorData,
      });
    }

    // Network error or other issues
    return Promise.reject({
      status: 0,
      message: error.message || 'Erro de conexão. Verifique sua internet e tente novamente.',
      data: null,
    });
  }
);

export default apiClient;

