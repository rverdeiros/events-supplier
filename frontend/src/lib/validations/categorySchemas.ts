import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório'),
  origin: z.enum(['fixed', 'manual']).optional().default('manual'),
  active: z.boolean().optional().default(true),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

