'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { authService } from '@/lib/api/authService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Loading } from '@/components/ui/Loading';
import { useUIStore } from '@/lib/store/uiStore';
import { Users, Store, Star, FolderOpen, MessageSquare, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface PlatformStats {
  users: {
    total: number;
    by_type: {
      client: number;
      supplier: number;
      admin: number;
    };
  };
  suppliers: {
    total: number;
    active: number;
  };
  reviews: {
    total: number;
    pending: number;
    approved: number;
  };
  categories: {
    total: number;
    active: number;
  };
  submissions: {
    total: number;
    unread: number;
  };
}

export default function AdminDashboardPage() {
  useRequireAuth('admin');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setError } = useUIStore();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await authService.getStats();
      setStats(response.data);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <Loading variant="inline" text="Carregando estatísticas..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Erro ao carregar estatísticas</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Usuários"
          value={stats.users.total}
          icon={Users}
          variant="info"
          description={`${stats.users.by_type.client} clientes, ${stats.users.by_type.supplier} fornecedores, ${stats.users.by_type.admin} admins`}
        />
        <MetricCard
          title="Fornecedores"
          value={stats.suppliers.active}
          icon={Store}
          variant="success"
          description={`${stats.suppliers.total} total, ${stats.suppliers.active} ativos`}
          href="/admin/suppliers"
        />
        <MetricCard
          title="Avaliações Pendentes"
          value={stats.reviews.pending}
          icon={Star}
          variant={stats.reviews.pending > 0 ? 'warning' : 'default'}
          description={`${stats.reviews.approved} aprovadas de ${stats.reviews.total} total`}
          href="/admin/reviews"
        />
        <MetricCard
          title="Categorias"
          value={stats.categories.active}
          icon={FolderOpen}
          variant="info"
          description={`${stats.categories.total} total, ${stats.categories.active} ativas`}
          href="/admin/categories"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Submissões"
          value={stats.submissions.total}
          icon={MessageSquare}
          variant={stats.submissions.unread > 0 ? 'warning' : 'default'}
          description={stats.submissions.unread > 0 ? `${stats.submissions.unread} não lidas` : 'Todas lidas'}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/reviews">
              <Button variant="outline" className="w-full justify-start">
                <Star className="w-4 h-4 mr-2" />
                Moderar Avaliações
                {stats.reviews.pending > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {stats.reviews.pending}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline" className="w-full justify-start">
                <FolderOpen className="w-4 h-4 mr-2" />
                Gerenciar Categorias
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Gerenciar Usuários
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
