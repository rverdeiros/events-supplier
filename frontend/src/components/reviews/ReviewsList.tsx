'use client';

import { Review } from '@/types';
import { Star } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ReviewsListProps {
  reviews: Review[];
  averageRating?: number;
  totalReviews?: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
  currentUserId?: number;
  onEdit?: (review: Review) => void;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  averageRating,
  totalReviews,
  onLoadMore,
  hasMore,
  isLoading,
  currentUserId,
  onEdit,
}) => {
  const canEdit = (review: Review) => {
    if (!currentUserId || review.user_id !== currentUserId) return false;
    // Check if review was created within last 24 hours
    const reviewDate = new Date(review.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 24;
  };

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">Ainda não há avaliações para este fornecedor.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Average Rating */}
      {averageRating && averageRating > 0 && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${
                  i < Math.round(averageRating)
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          {totalReviews && (
            <span className="text-gray-600">
              ({totalReviews} avaliação{totalReviews !== 1 ? 'ões' : ''})
            </span>
          )}
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-semibold text-gray-900">
                      {review.user_name || 'Anônimo'}
                    </p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-2">{review.comment}</p>
                  <span className="text-sm text-gray-500">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                {canEdit(review) && onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(review)}
                  >
                    Editar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            isLoading={isLoading}
          >
            Carregar mais avaliações
          </Button>
        </div>
      )}
    </div>
  );
};
