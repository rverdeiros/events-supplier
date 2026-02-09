'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/forms/LoginForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Link from 'next/link';

function LoginFormWrapper() {
  return (
    <>
      <LoginForm />
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Não tem uma conta? </span>
        <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
          Cadastre-se
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Entrar</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-center py-4">Carregando...</div>}>
            <LoginFormWrapper />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

