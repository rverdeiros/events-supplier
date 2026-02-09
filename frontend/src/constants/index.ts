// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    USERS: '/auth/users',
    USER: (id: number) => `/auth/users/${id}`,
    STATS: '/auth/stats',
  },
  // Suppliers
  SUPPLIERS: {
    LIST: '/fornecedores',
    DETAIL: (id: number) => `/fornecedores/${id}`,
    CREATE: '/fornecedores',
    UPDATE: (id: number) => `/fornecedores/${id}`,
    DELETE: (id: number) => `/fornecedores/${id}`,
    ME: '/fornecedores/me',
    COMPLETENESS: (id: number) => `/fornecedores/${id}/completeness`,
  },
  // Categories
  CATEGORIES: {
    LIST: '/categorias',
    CREATE: '/categorias',
    UPDATE: (id: number) => `/categorias/${id}`,
    DELETE: (id: number) => `/categorias/${id}`,
  },
  // Reviews
  REVIEWS: {
    CREATE: '/reviews',
    UPDATE: (id: number) => `/reviews/${id}`,
    DELETE: (id: number) => `/reviews/${id}`,
    SUPPLIER: (supplierId: number) => `/reviews/supplier/${supplierId}`,
    APPROVED: '/reviews/approved',
    PENDING: '/reviews/pending',
    ALL: '/reviews/all',
    APPROVE: (id: number) => `/reviews/${id}/approve`,
    REJECT: (id: number) => `/reviews/${id}/reject`,
  },
  // Media
  MEDIA: {
    CREATE: '/media',
    UPLOAD: '/media/upload',
    SUPPLIER: (supplierId: number) => `/media/supplier/${supplierId}`,
    DELETE: (id: number) => `/media/${id}`,
  },
  // Contact Forms
  CONTACT_FORMS: {
    DEFAULT_TEMPLATE: '/contact-forms/default-template',
    CREATE: '/contact-forms',
    SUPPLIER: (supplierId: number) => `/contact-forms/supplier/${supplierId}`,
    UPDATE: (id: number) => `/contact-forms/${id}`,
    RESET: (id: number) => `/contact-forms/${id}/reset-to-default`,
    DELETE: (id: number) => `/contact-forms/${id}`,
    SUBMIT: (id: number) => `/contact-forms/${id}/submit`,
    SUBMISSIONS: (id: number) => `/contact-forms/${id}/submissions`,
    MARK_READ: (id: number, submissionId: number) => `/contact-forms/${id}/submissions/${submissionId}/mark-read`,
  },
} as const;

// App Constants
export const APP_CONFIG = {
  TOKEN_STORAGE_KEY: 'auth_token',
  USER_STORAGE_KEY: 'user_data',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes before expiry
} as const;

// Validation Constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 120,
  COMMENT_MIN_LENGTH: 10,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  SUPPLIER_PAGE_SIZE: 10,
  REVIEW_PAGE_SIZE: 10,
  MEDIA_PAGE_SIZE: 20,
  CATEGORY_PAGE_SIZE: 50,
} as const;

