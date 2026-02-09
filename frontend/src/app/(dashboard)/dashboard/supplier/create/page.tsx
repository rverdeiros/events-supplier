'use client';

import { useRequireAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { User, Building2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useEffect } from 'react';
import { Loading } from '@/components/ui/Loading';

export default function CreateSupplierPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useRequireAuth(); // Permite qualquer usuário autenticado (cliente ou fornecedor)
  const router = useRouter();

  // Se o usuário já é fornecedor, redireciona para o dashboard
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.type === 'supplier') {
      router.push('/dashboard');
    }
  }, [user, isAuthenticated, authLoading, router]);

  // Mostra loading enquanto verifica autenticação
  if (authLoading || !isAuthenticated) {
    return <Loading variant="full-screen" text="Carregando..." />;
  }

  // Se o usuário já é fornecedor, não mostra nada (será redirecionado)
  if (user?.type === 'supplier') {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Cadastrar como Fornecedor</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Escolha o tipo de cadastro que melhor se adequa ao seu perfil:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => router.push('/dashboard/supplier/create/individual')}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <User className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Pessoa Física</h3>
              <p className="text-gray-600 text-sm">
                Para profissionais autônomos e prestadores de serviços individuais
              </p>
            </button>

            <button
              onClick={() => router.push('/dashboard/supplier/create/company')}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <Building2 className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Pessoa Jurídica</h3>
              <p className="text-gray-600 text-sm">
                Para empresas e organizações com CNPJ
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
