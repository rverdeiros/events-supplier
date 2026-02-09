'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { supplierService } from '@/lib/api/supplierService';
import { Supplier } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { useUIStore } from '@/lib/store/uiStore';
import Link from 'next/link';
import { Plus, Edit, Star, MessageSquare, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface SupplierMetrics {
  average_rating: number | null;
  approved_reviews_count: number;
  total_reviews_count: number;
  total_submissions: number;
  unread_submissions: number;
  completeness_score: number;
  completeness_is_complete: boolean;
  media_counts: {
    images: number;
    videos: number;
    documents: number;
  };
}

export default function DashboardPage() {
  useRequireAuth('supplier');
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [metrics, setMetrics] = useState<SupplierMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setError } = useUIStore();

  useEffect(() => {
    loadSupplier();
  }, []);

  const loadSupplier = async () => {
    setIsLoading(true);
    try {
      const response = await supplierService.getMySupplier();
      setSupplier(response.data.supplier);
      setMetrics(response.data.metrics);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Supplier not found - user needs to create one
        setSupplier(null);
        setMetrics(null);
      } else {
        setError(error.message || 'Erro ao carregar dados do fornecedor');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        {!supplier && (
          <Link href="/dashboard/supplier/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Criar Perfil de Fornecedor
            </Button>
          </Link>
        )}
      </div>

      {supplier && metrics ? (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Avaliações Aprovadas"
              value={metrics.approved_reviews_count}
              icon={Star}
              href="/dashboard/reviews"
              variant="success"
              description={metrics.average_rating ? `Média: ${metrics.average_rating}/5` : 'Sem avaliações ainda'}
            />
            <MetricCard
              title="Submissões"
              value={metrics.total_submissions}
              icon={MessageSquare}
              href="/dashboard/submissions"
              variant={metrics.unread_submissions > 0 ? 'warning' : 'default'}
              description={metrics.unread_submissions > 0 ? `${metrics.unread_submissions} não lidas` : 'Todas lidas'}
            />
            <MetricCard
              title="Completude do Perfil"
              value={`${Math.round(metrics.completeness_score)}%`}
              icon={metrics.completeness_is_complete ? CheckCircle2 : AlertCircle}
              href="/dashboard/supplier/edit"
              variant={metrics.completeness_is_complete ? 'success' : 'warning'}
              description={metrics.completeness_is_complete ? 'Perfil completo' : 'Complete seu perfil'}
            />
            <MetricCard
              title="Mídia"
              value={metrics.media_counts.images + metrics.media_counts.videos + metrics.media_counts.documents}
              icon={FileText}
              href="/dashboard/media"
              variant="info"
              description={`${metrics.media_counts.images} imagens, ${metrics.media_counts.videos} vídeos, ${metrics.media_counts.documents} docs`}
            />
          </div>

          {/* Supplier Info and Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Perfil do Fornecedor</CardTitle>
                  <Link href="/dashboard/supplier/edit">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-semibold mb-2">{supplier.fantasy_name}</h3>
                {supplier.description && (
                  <p className="text-gray-600 mb-4 line-clamp-3">{supplier.description}</p>
                )}
                <div className="space-y-2 text-sm">
                  <p><strong>Cidade:</strong> {supplier.city}, {supplier.state}</p>
                  <p><strong>Email:</strong> {supplier.email}</p>
                  <p><strong>Telefone:</strong> {supplier.phone}</p>
                  {supplier.price_range && (
                    <p><strong>Faixa de Preço:</strong> {
                      supplier.price_range === 'low' ? 'Econômico' :
                      supplier.price_range === 'medium' ? 'Médio' : 'Alto'
                    }</p>
                  )}
                </div>
                {!metrics.completeness_is_complete && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      Seu perfil está {Math.round(metrics.completeness_score)}% completo. 
                      <Link href="/dashboard/supplier/edit" className="underline ml-1">
                        Complete agora
                      </Link>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/dashboard/supplier/edit">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                </Link>
                <Link href="/dashboard/media">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Gerenciar Mídia
                  </Button>
                </Link>
                <Link href="/dashboard/contact-form">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Formulário de Contato
                  </Button>
                </Link>
                <Link href="/dashboard/submissions">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start relative"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Ver Submissões
                    {metrics.unread_submissions > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {metrics.unread_submissions}
                      </span>
                    )}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              Você ainda não criou um perfil de fornecedor.
            </p>
            <Link href="/dashboard/supplier/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Perfil
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

