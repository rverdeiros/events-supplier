import { z } from 'zod';
import { VALIDATION } from '@/constants';

// Password validation with uppercase and number requirement
const passwordSchema = z
  .string()
  .min(VALIDATION.PASSWORD_MIN_LENGTH, `Senha deve ter pelo menos ${VALIDATION.PASSWORD_MIN_LENGTH} caracteres`)
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número');

export const registerSchema = z.object({
  name: z
    .string()
    .min(VALIDATION.NAME_MIN_LENGTH, `Nome deve ter pelo menos ${VALIDATION.NAME_MIN_LENGTH} caracteres`)
    .max(VALIDATION.NAME_MAX_LENGTH, `Nome deve ter no máximo ${VALIDATION.NAME_MAX_LENGTH} caracteres`),
  email: z.string().email('Email inválido'),
  password: passwordSchema,
  type: z.enum(['client', 'supplier', 'admin']).optional().default('client'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

