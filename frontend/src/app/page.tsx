'use client';

import { useCallback, useState, useEffect } from 'react';
import { useSupplierStore } from '@/lib/store/supplierStore';
import dynamic from 'next/dynamic';
import { HeroSearchBar } from '@/components/search/HeroSearchBar';
import { FilterBar } from '@/components/search/FilterBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Filter } from 'lucide-react';
import { categoryService } from '@/lib/api/categoryService';
import { Category, PriceRange } from '@/types';

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
  const { filters, setFilters, resetFilters } = useSupplierStore();
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await categoryService.list(true);
        setCategories(response.data || []);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleSearch = useCallback((searchTerm: string) => {
    setFilters({ search: searchTerm || undefined, page: 1 });
  }, [setFilters]);

  const handleCityChange = useCallback((city: string) => {
    setFilters({ city: city || undefined });
  }, [setFilters]);

  const handleStateChange = useCallback((state: string) => {
    setFilters({ state: state || undefined });
  }, [setFilters]);

  const handleCategoryChange = useCallback((categoryId: number | undefined) => {
    setFilters({ category_id: categoryId });
  }, [setFilters]);

  const handlePriceRangeChange = useCallback((priceRange: PriceRange | undefined) => {
    setFilters({ price_range: priceRange });
  }, [setFilters]);

  const handleOrderByChange = useCallback((orderBy: 'created_at' | 'rating' | undefined) => {
    // Note: order_by is not in SupplierFilters, but we can add it if needed
    // For now, we'll skip this or add it to the store
  }, []);

  const handleClearFilters = useCallback(() => {
    resetFilters();
    setFilters({ search: filters.search }); // Keep search term
  }, [resetFilters, setFilters, filters.search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Barra de busca */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
          <div className="container mx-auto px-4">
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
            
            {/* Botão para exibir filtros avançados */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Ocultar filtros avançados' : 'Exibir filtros avançados'}
              </Button>
            </div>
          </div>
        </section>

        {/* Filtros avançados */}
        {showFilters && (
          <section className="bg-white border-b shadow-sm py-6">
            <div className="container mx-auto px-4">
              {!loadingCategories && (
                <FilterBar
                  city={filters.city || ''}
                  state={filters.state || ''}
                  categoryId={filters.category_id}
                  priceRange={filters.price_range}
                  orderBy="created_at"
                  categories={categories}
                  onCityChange={handleCityChange}
                  onStateChange={handleStateChange}
                  onCategoryChange={handleCategoryChange}
                  onPriceRangeChange={handlePriceRangeChange}
                  onOrderByChange={handleOrderByChange}
                  onClearFilters={handleClearFilters}
                />
              )}
            </div>
          </section>
        )}

        {/* Carrossel de Fornecedores */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <SupplierCarousel 
              title="Fornecedores Cadastrados"
              limit={50}
            />
          </div>
        </section>

        {/* Avaliações */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <ReviewCarousel 
              title="Últimas Avaliações"
              limit={50}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
