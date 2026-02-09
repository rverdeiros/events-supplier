import { z } from 'zod';

const questionTypeSchema = z.enum([
  'text',
  'textarea',
  'email',
  'phone',
  'number',
  'select',
  'multiselect',
  'radio',
  'checkbox',
  'date',
  'datetime',
]);

export const questionSchema = z.object({
  question: z.string().min(1, 'Pergunta é obrigatória'),
  type: questionTypeSchema,
  required: z.boolean(),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  min_length: z.number().optional(),
  max_length: z.number().optional(),
});

export const contactFormSchema = z.object({
  questions: z.array(questionSchema),
  active: z.boolean(),
});

export const contactFormSubmissionSchema = z.object({
  answers: z.record(z.string(), z.string()),
  submitter_name: z.string().min(1, 'Nome é obrigatório'),
  submitter_email: z.string().email('Email inválido'),
  submitter_phone: z.string().min(1, 'Telefone é obrigatório'),
});

// Explicitly define types to ensure required fields
export type QuestionFormData = {
  question: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'number' | 'select' | 'multiselect' | 'radio' | 'checkbox' | 'date' | 'datetime';
  required: boolean;
  placeholder?: string;
  options?: string[];
  min_value?: number;
  max_value?: number;
  min_length?: number;
  max_length?: number;
};

export type ContactFormFormData = {
  questions: QuestionFormData[];
  active: boolean;
};

// Explicitly define ContactFormSubmissionFormData for consistency
export type ContactFormSubmissionFormData = {
  answers: Record<string, string>;
  submitter_name: string;
  submitter_email: string;
  submitter_phone: string;
};

