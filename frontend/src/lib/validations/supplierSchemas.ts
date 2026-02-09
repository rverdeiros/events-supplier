import { z } from 'zod';

const urlSchema = z.string().url('URL inválida').optional().or(z.literal(''));

// Helper para validar CEP (formato: XXXXX-XXX ou XXXXXXXX)
const zipCodeSchema = z.string()
  .refine((val) => {
    const clean = val.replace(/\D/g, '');
    return clean.length === 8;
  }, 'CEP deve ter 8 dígitos')
  .optional();

// Helper para validar CNPJ (formato: XX.XXX.XXX/XXXX-XX ou 14 dígitos)
// Valida apenas se o valor for fornecido (não vazio)
const cnpjSchema = z.string()
  .optional()
  .refine((val) => {
    // Se não fornecido ou vazio, é válido (opcional)
    if (!val || val.trim() === '') return true;
    // Se fornecido, deve ter 14 dígitos
    const clean = val.replace(/\D/g, '');
    return clean.length === 14;
  }, 'CNPJ deve ter 14 dígitos');

// Schema base com campos opcionais
const supplierBaseSchema = z.object({
  supplier_type: z.enum(['individual', 'company']).default('individual'),
  fantasy_name: z.string().min(1, 'Nome fantasia é obrigatório'),
  legal_name: z.string().optional(),
  cnpj: cnpjSchema,
  description: z.string().optional(),
  category_id: z.number().int().positive().optional(),
  address: z.string().optional(),
  zip_code: zipCodeSchema,
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório').max(2, 'Estado deve ter 2 caracteres'),
  price_range: z.enum(['low', 'medium', 'high']).optional(),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido'),
  instagram_url: urlSchema,
  whatsapp_url: urlSchema,
  site_url: urlSchema,
});

// Schema para Pessoa Física (address e zip_code obrigatórios)
export const individualSupplierSchema = supplierBaseSchema.extend({
  supplier_type: z.literal('individual'), // Restrict to 'individual' only
  address: z.string().min(1, 'Endereço é obrigatório'),
  zip_code: z.string()
    .refine((val) => {
      if (!val) return false;
      const clean = val.replace(/\D/g, '');
      return clean.length === 8;
    }, 'CEP é obrigatório e deve ter 8 dígitos'),
});

// Schema para Pessoa Jurídica (todos os campos PJ obrigatórios)
export const companySupplierSchema = supplierBaseSchema.extend({
  supplier_type: z.literal('company'), // Restrict to 'company' only
  legal_name: z.string().min(1, 'Razão social é obrigatória'),
  cnpj: z.string()
    .min(1, 'CNPJ é obrigatório para pessoa jurídica')
    .refine((val) => {
      if (!val || val.trim() === '') return false;
      const clean = val.replace(/\D/g, '');
      return clean.length === 14;
    }, 'CNPJ deve ter 14 dígitos'),
  address: z.string().min(1, 'Endereço comercial é obrigatório'),
  zip_code: z.string()
    .refine((val) => {
      if (!val) return false;
      const clean = val.replace(/\D/g, '');
      return clean.length === 8;
    }, 'CEP é obrigatório e deve ter 8 dígitos'),
});

// Schema genérico para edição (todos opcionais exceto os básicos)
export const supplierSchema = supplierBaseSchema;

// Explicitly define SupplierFormData to ensure supplier_type is required
export type SupplierFormData = {
  supplier_type: 'individual' | 'company';
  fantasy_name: string;
  legal_name?: string;
  cnpj?: string;
  description?: string;
  category_id?: number;
  address?: string;
  zip_code?: string;
  city: string;
  state: string;
  price_range?: 'low' | 'medium' | 'high';
  phone: string;
  email: string;
  instagram_url?: string;
  whatsapp_url?: string;
  site_url?: string;
};

// Explicitly define IndividualSupplierFormData to ensure supplier_type is required
export type IndividualSupplierFormData = {
  supplier_type: 'individual';
  fantasy_name: string;
  legal_name?: string;
  cnpj?: string;
  description?: string;
  category_id?: number;
  address: string;
  zip_code: string;
  city: string;
  state: string;
  price_range?: 'low' | 'medium' | 'high';
  phone: string;
  email: string;
  instagram_url?: string;
  whatsapp_url?: string;
  site_url?: string;
};

// Explicitly define CompanySupplierFormData to ensure supplier_type is required
export type CompanySupplierFormData = {
  supplier_type: 'company';
  fantasy_name: string;
  legal_name: string;
  cnpj: string;
  description?: string;
  category_id?: number;
  address: string;
  zip_code: string;
  city: string;
  state: string;
  price_range?: 'low' | 'medium' | 'high';
  phone: string;
  email: string;
  instagram_url?: string;
  whatsapp_url?: string;
  site_url?: string;
};

