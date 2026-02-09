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
  required: z.boolean().optional().default(false),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  min_length: z.number().optional(),
  max_length: z.number().optional(),
});

export const contactFormSchema = z.object({
  questions: z.array(questionSchema),
  active: z.boolean().optional().default(true),
});

export const contactFormSubmissionSchema = z.object({
  answers: z.record(z.string()),
  submitter_name: z.string().min(1, 'Nome é obrigatório'),
  submitter_email: z.string().email('Email inválido'),
  submitter_phone: z.string().min(1, 'Telefone é obrigatório'),
});

export type QuestionFormData = z.infer<typeof questionSchema>;
export type ContactFormFormData = z.infer<typeof contactFormSchema>;
export type ContactFormSubmissionFormData = z.infer<typeof contactFormSubmissionSchema>;

