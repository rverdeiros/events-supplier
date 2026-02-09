'use client';

import { useRequireAuth } from '@/hooks/useAuth';
import { CompanySupplierForm } from '@/components/forms/CompanySupplierForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

export default function CreateCompanySupplierPage() {
  useRequireAuth();
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Cadastro de Fornecedor - Pessoa Jurídica</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanySupplierForm
            onSuccess={() => {
              // Use window.location to ensure full page reload with updated user state
              window.location.href = '/dashboard/supplier/edit';
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
