'use client';

import { Modal } from '@/components/ui/Modal';
import { ReviewForm } from './ReviewForm';
import { Review } from '@/types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId: number;
  review?: Review; // If provided, edit mode
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  supplierId,
  review,
  onSuccess,
}) => {
  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={review ? 'Editar Avaliação' : 'Avaliar Fornecedor'}
    >
      <ReviewForm
        supplierId={supplierId}
        onSuccess={handleSuccess}
        initialData={review ? {
          id: review.id,
          supplier_id: review.supplier_id,
          rating: review.rating,
          comment: review.comment,
          user_id: review.user_id,
          status: review.status,
          created_at: review.created_at,
        } : undefined}
      />
    </Modal>
  );
};
