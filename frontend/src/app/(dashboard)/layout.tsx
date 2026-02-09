'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useAuthStore } from '@/lib/store/authStore';
import { Loading } from '@/components/ui/Loading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, initAuth, user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    // Only run on client side after mount
    if (!isMounted) return;

    const token = localStorage.getItem('auth_token');
    
    if (!isAuthenticated) {
      if (!token) {
        router.push('/login');
        return;
      }
      // If we have a token but not authenticated, show loading while auth initializes
      setIsCheckingAuth(true);
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, router, isMounted]);

  // Show loading while checking auth (only on client, after mount)
  if (isMounted && isCheckingAuth) {
    return <Loading variant="full-screen" text="Carregando..." />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8">
          <Breadcrumbs />
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}

