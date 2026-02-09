import { z } from 'zod';
import { VALIDATION } from '@/constants';

export const reviewSchema = z.object({
  supplier_id: z.number().int().positive('ID do fornecedor é obrigatório'),
  rating: z.number().int().min(1, 'Avaliação deve ser no mínimo 1').max(5, 'Avaliação deve ser no máximo 5'),
  comment: z
    .string()
    .min(VALIDATION.COMMENT_MIN_LENGTH, `Comentário deve ter pelo menos ${VALIDATION.COMMENT_MIN_LENGTH} caracteres`),
});

// Explicitly define ReviewFormData for consistency
export type ReviewFormData = {
  supplier_id: number;
  rating: number;
  comment: string;
};

