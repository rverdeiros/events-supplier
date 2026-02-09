import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório'),
  origin: z.enum(['fixed', 'manual']),
  active: z.boolean(),
});

export type CategoryFormData = {
  name: string;
  origin: 'fixed' | 'manual';
  active: boolean;
};

