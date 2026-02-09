'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { reviewService } from '@/lib/api/reviewService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { useUIStore } from '@/lib/store/uiStore';
import { Review } from '@/types';
import { Star, Check, X, Eye, AlertCircle, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';

export default function AdminReviewsPage() {
  useRequireAuth('admin');
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const { setError, setSuccess } = useUIStore();

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      if (filter === 'pending') {
        const response = await reviewService.getPending();
        setPendingReviews(response.data);
      } else {
        const response = await reviewService.getAll(filter === 'all' ? undefined : filter);
        setPendingReviews(response.data);
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar avaliações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReview = async (id: number) => {
    try {
      await reviewService.approve(id);
      setSuccess('Avaliação aprovada com sucesso!');
      setSelectedReview(null);
      loadReviews();
    } catch (error: any) {
      setError(error.message || 'Erro ao aprovar avaliação');
    }
  };

  const handleRejectReview = async (id: number) => {
    if (!confirm('Tem certeza que deseja rejeitar esta avaliação?')) return;
    
    try {
      await reviewService.reject(id);
      setSuccess('Avaliação rejeitada com sucesso!');
      setSelectedReview(null);
      loadReviews();
    } catch (error: any) {
      setError(error.message || 'Erro ao rejeitar avaliação');
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.')) return;
    
    try {
      await reviewService.delete(id);
      setSuccess('Avaliação excluída com sucesso!');
      setSelectedReview(null);
      loadReviews();
    } catch (error: any) {
      setError(error.message || 'Erro ao excluir avaliação');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <Loading variant="inline" text="Carregando avaliações..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Moderação de Avaliações</h1>
        <div className="flex gap-2">
          <Button
            variant={filter === 'pending' ? 'primary' : 'outline'}
            onClick={() => setFilter('pending')}
            size="sm"
          >
            Pendentes
          </Button>
          <Button
            variant={filter === 'approved' ? 'primary' : 'outline'}
            onClick={() => setFilter('approved')}
            size="sm"
          >
            Aprovadas
          </Button>
          <Button
            variant={filter === 'rejected' ? 'primary' : 'outline'}
            onClick={() => setFilter('rejected')}
            size="sm"
          >
            Rejeitadas
          </Button>
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            Todas
          </Button>
        </div>
      </div>

      {pendingReviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'pending' 
                ? 'Nenhuma avaliação pendente para moderação.' 
                : 'Nenhuma avaliação encontrada.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingReviews.map((review) => (
            <Card
              key={review.id}
              className={`cursor-pointer transition-shadow hover:shadow-md ${
                review.status === 'pending' ? 'border-l-4 border-l-yellow-500' : ''
              }`}
              onClick={() => setSelectedReview(review)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-semibold text-gray-900">
                        {review.user_name || review.supplier_name || 'Anônimo'}
                      </p>
                      {review.status === 'pending' && (
                        <Badge variant="warning">Pendente</Badge>
                      )}
                      {review.status === 'approved' && (
                        <Badge variant="success">Aprovada</Badge>
                      )}
                      {review.status === 'rejected' && (
                        <Badge variant="error">Rejeitada</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
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
                      <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDate(review.created_at)}
                    </p>
                    <p className="text-gray-700 line-clamp-2">{review.comment}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {review.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApproveReview(review.id);
                          }}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRejectReview(review.id);
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReview(review.id);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Detail Modal */}
      <Modal
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        title="Detalhes da Avaliação"
      >
        {selectedReview && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <p className="text-sm text-gray-500">Usuário</p>
                <p className="font-medium">{selectedReview.user_name || 'Anônimo'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Data</p>
                <p className="font-medium">{formatDate(selectedReview.created_at)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Avaliação</p>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < selectedReview.rating 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">({selectedReview.rating}/5)</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Comentário</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedReview.comment}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Status</p>
              <Badge 
                variant={
                  selectedReview.status === 'approved' ? 'success' :
                  selectedReview.status === 'rejected' ? 'error' : 'warning'
                }
              >
                {selectedReview.status === 'approved' ? 'Aprovada' :
                 selectedReview.status === 'rejected' ? 'Rejeitada' : 'Pendente'}
              </Badge>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              {selectedReview.status === 'pending' && (
                <>
                  <Button
                    variant="primary"
                    onClick={() => {
                      handleApproveReview(selectedReview.id);
                    }}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleRejectReview(selectedReview.id);
                    }}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  handleDeleteReview(selectedReview.id);
                }}
                className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
