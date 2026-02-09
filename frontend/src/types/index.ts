// User Types
export type UserType = 'client' | 'supplier' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  type: UserType;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  type?: UserType;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Supplier Types
export type PriceRange = 'low' | 'medium' | 'high';
export type SupplierStatus = 'active' | 'inactive';

export interface Supplier {
  id: number;
  user_id: number;
  supplier_type?: 'individual' | 'company'; // PF ou PJ
  fantasy_name: string;
  legal_name?: string; // Razão Social (apenas PJ)
  cnpj?: string; // CNPJ (apenas PJ)
  description?: string;
  category_id?: number;
  address?: string; // Endereço completo
  zip_code?: string; // CEP
  city: string;
  state: string;
  price_range?: PriceRange;
  phone: string;
  email: string;
  instagram_url?: string;
  whatsapp_url?: string;
  site_url?: string;
  status: SupplierStatus;
  created_at: string;
}

export interface SupplierFilters {
  city?: string;
  state?: string;
  category_id?: number;
  price_range?: PriceRange;
  search?: string;  // Search by name, description, or city
  random?: boolean;  // Return random suppliers
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Category Types
export type CategoryOrigin = 'fixed' | 'manual';

export interface Category {
  id: number;
  name: string;
  origin: CategoryOrigin;
  active: boolean;
  supplier_count?: number;  // Number of active suppliers in this category
  created_at: string;
}

// Review Types
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: number;
  user_id: number;
  supplier_id: number;
  rating: number;
  comment: string;
  status: ReviewStatus;
  created_at: string;
  user_name?: string;
  supplier_name?: string;  // Supplier name for homepage carousel
}

export interface ReviewRequest {
  supplier_id: number;
  rating: number;
  comment: string;
}

// Media Types
export type MediaType = 'image' | 'video' | 'document';

export interface Media {
  id: number;
  supplier_id: number;
  type: MediaType;
  url: string;
  upload_date: string;
}

export interface MediaRequest {
  supplier_id: number;
  type: MediaType;
  url: string;
}

// Contact Form Types
export type QuestionType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'phone'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'datetime';

export interface Question {
  question: string;
  type: QuestionType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min_value?: number;
  max_value?: number;
  min_length?: number;
  max_length?: number;
}

export interface ContactForm {
  id: number;
  supplier_id: number;
  questions: Question[];
  active: boolean;
}

export interface ContactFormSubmission {
  id: number;
  contact_form_id: number;
  answers: Record<string, string>;
  submitter_name: string;
  submitter_email: string;
  submitter_phone: string;
  read: boolean;
  created_at: string;
}

export interface ContactFormSubmissionRequest {
  answers: Record<string, string>;
  submitter_name: string;
  submitter_email: string;
  submitter_phone: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  detail: string;
}

