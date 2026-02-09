import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório'),
  origin: z.enum(['fixed', 'manual']).default('manual'),
  active: z.boolean().default(true),
});

// Explicitly define the type to ensure required fields
export type CategoryFormData = {
  name: string;
  origin: 'fixed' | 'manual';
  active: boolean;
};

