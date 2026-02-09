'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, ReviewFormData } from '@/lib/validations/reviewSchemas';
import { reviewService } from '@/lib/api/reviewService';
import { useUIStore } from '@/lib/store/uiStore';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Star } from 'lucide-react';

interface ReviewFormProps {
  supplierId: number;
  onSuccess?: () => void;
  initialData?: {
    id: number;
    supplier_id: number;
    rating: number;
    comment: string;
    user_id: number;
    status: string;
    created_at: string;
  };
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ supplierId, onSuccess, initialData }) => {
  const { setError, setSuccess } = useUIStore();
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      supplier_id: supplierId,
      comment: initialData?.comment || '',
    },
  });

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      setError('Por favor, selecione uma avaliação (1 a 5 estrelas)');
      return;
    }

    setIsLoading(true);
    try {
      if (initialData) {
        // Edit existing review
        await reviewService.update(initialData.id, {
          ...data,
          rating,
        });
        setSuccess('Avaliação atualizada com sucesso! Aguardando moderação.');
      } else {
        // Create new review
        await reviewService.create({
          ...data,
          supplier_id: supplierId,
          rating,
        });
        setSuccess('Avaliação enviada com sucesso! Aguardando moderação.');
      }
      reset();
      setRating(0);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      setError(error.message || 'Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Avaliação <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {rating === 0 && (
          <p className="mt-1 text-sm text-red-600">Selecione uma avaliação</p>
        )}
      </div>

      <Textarea
        label="Comentário"
        rows={4}
        {...register('comment')}
        error={errors.comment?.message}
        helperText="Mínimo de 10 caracteres"
        placeholder="Compartilhe sua experiência com este fornecedor..."
      />

      <Button type="submit" variant="primary" isLoading={isLoading}>
        Enviar Avaliação
      </Button>
    </form>
  );
};

