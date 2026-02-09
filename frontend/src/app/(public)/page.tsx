'use client';

import { useCallback } from 'react';
import { useSupplierStore } from '@/lib/store/supplierStore';
import dynamic from 'next/dynamic';
import { HeroSearchBar } from '@/components/search/HeroSearchBar';

// Lazy load carousel components
const SupplierCarousel = dynamic(() => import('@/components/carousels/SupplierCarousel').then(mod => ({ default: mod.SupplierCarousel })), {
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false,
});

const ReviewCarousel = dynamic(() => import('@/components/carousels/ReviewCarousel').then(mod => ({ default: mod.ReviewCarousel })), {
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false,
});

export default function HomePage() {
  const { setFilters } = useSupplierStore();

  const handleSearch = useCallback((searchTerm: string) => {
    setFilters({ search: searchTerm || undefined, page: 1 });
  }, [setFilters]);

  return (
    <>
      {/* Barra de busca */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 -mx-4 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Encontre os Melhores Fornecedores
            </h1>
            <p className="text-lg text-blue-100">
              Descubra fornecedores de qualidade para seu evento
            </p>
          </div>
          <HeroSearchBar 
            placeholder="Busque aqui seus fornecedores"
            onSearch={handleSearch}
          />
        </div>
      </section>

      {/* Carrossel de Fornecedores */}
      <section className="py-12">
        <SupplierCarousel 
          title="Fornecedores Cadastrados"
          limit={50}
        />
      </section>

      {/* Avaliações */}
      <section className="py-12 bg-gray-50 -mx-4 px-4">
        <div className="container mx-auto">
          <ReviewCarousel 
            title="Últimas Avaliações"
            limit={20}
          />
        </div>
      </section>
    </>
  );
}
